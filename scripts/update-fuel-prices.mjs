// Fuel-price check. Run by .github/workflows/update-fuel-prices.yml.
//
//   node scripts/update-fuel-prices.mjs          fetch, validate, update seed files
//   node scripts/update-fuel-prices.mjs --sql    print an upsert of every price in
//                                                seed.json, for the live database
//
// What this does and does not do:
// - Tries each source in SOURCES in order and uses the first one that gives a
//   plausible gasoline AND diesel peso price. A source that is down, blocks the
//   request, or changed its layout is skipped, not trusted.
// - If no source can be parsed, it exits with an error and writes NOTHING. The
//   workflow then fails loudly (you get a GitHub notification) instead of a bad
//   number quietly landing in the app.
// - If the prices are the same as the latest ones already recorded, or that
//   date is already recorded, it changes nothing. Otherwise it edits
//   server/db/seed.sql and client/src/api/seed.json in place. The workflow
//   commits that, pushes the new rows to the live database and redeploys.

import { readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const MIN_PLAUSIBLE = 20 // PHP/liter -- below this, something was misparsed
const MAX_PLAUSIBLE = 250 // PHP/liter -- above this, something was misparsed
const USER_AGENT = 'Mozilla/5.0 (compatible; GAS-price-check/2.0)'

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }

// Most trusted first. GlobalPetrolPrices publishes the Philippine retail pump
// price (taxes included) weekly with the exact date it applies to, so the
// chart gets the real date of the price instead of the date this ran.
// DailyFuels only says the month, so it is the fallback.
const SOURCES = [
  {
    name: 'GlobalPetrolPrices',
    url: 'https://www.globalpetrolprices.com/Philippines/',
    async read() {
      const gasolineHtml = await fetchText('https://www.globalpetrolprices.com/Philippines/gasoline_prices/')
      const dieselHtml = await fetchText('https://www.globalpetrolprices.com/Philippines/diesel_prices/')
      // "The current gasoline price in the Philippines is PHP 95.90 per liter
      //  ... updated on 09-Nov-2026."
      const current = /current[\s\S]{0,80}?PHP\s*([0-9]+(?:\.[0-9]+)?)\s*per liter[\s\S]{0,200}?(\d{2})-([A-Za-z]{3})-(\d{4})/i
      const g = gasolineHtml.match(current)
      const d = dieselHtml.match(current)
      if (!g || !d) return null
      const gasolineDate = toIsoDate(g[2], g[3], g[4])
      const dieselDate = toIsoDate(d[2], d[3], d[4])
      // Both pages are updated together. If they disagree, one of them is
      // mid-update and the pair is not trustworthy this run.
      if (!gasolineDate || gasolineDate !== dieselDate) return null
      return { gasoline: Number(g[1]), diesel: Number(d[1]), asOf: gasolineDate }
    },
  },
  {
    name: 'DailyFuels',
    url: 'https://www.dailyfuels.com/philippines/',
    async read() {
      const html = await fetchText('https://www.dailyfuels.com/philippines/')
      return { gasoline: extractPeso(html, 'Gasoline'), diesel: extractPeso(html, 'Diesel'), asOf: null }
    },
  },
]

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const seedSqlPath = path.join(repoRoot, 'server/db/seed.sql')
const seedJsonPath = path.join(repoRoot, 'client/src/api/seed.json')

// Git on Windows checks files out with CRLF line endings. Edit as LF and write
// back with whatever the file had, so a local run doesn't rewrite every line.
function readLf(file) {
  const raw = readFileSync(file, 'utf8')
  return { text: raw.replace(/\r\n/g, '\n'), eol: raw.includes('\r\n') ? '\r\n' : '\n' }
}

function writeWithEol(file, text, eol) {
  writeFileSync(file, eol === '\n' ? text : text.replace(/\n/g, eol))
}

function fail(message) {
  console.error(`update-fuel-prices: ${message}`)
  process.exit(1)
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`${url} responded ${response.status}`)
  return response.text()
}

function extractPeso(html, label) {
  // Looks for the fuel's label, then the first peso amount after it.
  // Deliberately loose about what sits in between (emoji, tags, spacing)
  // since a source page's markup can shift without its wording changing.
  const pattern = new RegExp(`${label}[\\s\\S]{0,120}?₱\\s*([0-9]+(?:\\.[0-9]+)?)`, 'i')
  const match = html.match(pattern)
  return match ? Number(match[1]) : null
}

function toIsoDate(day, monthName, year) {
  const month = MONTHS[monthName.toLowerCase()]
  if (!month) return null
  return `${year}-${String(month).padStart(2, '0')}-${day.padStart(2, '0')}`
}

function isPlausible(price) {
  return Number.isFinite(price) && price >= MIN_PLAUSIBLE && price <= MAX_PLAUSIBLE
}

// Manila date, not UTC: a 01:00 UTC run is already 09:00 the same day in Manila.
function todayInManila() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date())
}

async function readFirstGoodSource() {
  for (const source of SOURCES) {
    try {
      const result = await source.read()
      if (!result) {
        console.warn(`${source.name}: could not find both prices on the page, skipping`)
        continue
      }
      if (!isPlausible(result.gasoline) || !isPlausible(result.diesel)) {
        console.warn(`${source.name}: implausible prices (gasoline ${result.gasoline}, diesel ${result.diesel}), skipping`)
        continue
      }
      const today = todayInManila()
      // A date in the future means we misread it; a date we cannot read means
      // we fall back to today, the day we saw this price.
      const weekOf = result.asOf && result.asOf <= today ? result.asOf : today
      return { ...result, weekOf, source }
    } catch (error) {
      console.warn(`${source.name}: ${error.message}, skipping`)
    }
  }
  return null
}

function readFuelPrices() {
  return JSON.parse(readFileSync(seedJsonPath, 'utf8')).fuelPrices
}

function latestRecorded(fuelPrices, fuelType) {
  return fuelPrices
    .filter((row) => row.fuelType === fuelType)
    .sort((a, b) => a.weekOf.localeCompare(b.weekOf))
    .at(-1)
}

function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`)
}

async function main() {
  const found = await readFirstGoodSource()
  if (!found) fail('no source gave a plausible gasoline and diesel price; nothing was written')

  const { gasoline, diesel, weekOf, source } = found
  console.log(`Parsed from ${source.name}: gasoline ₱${gasoline}/L, diesel ₱${diesel}/L, as of ${weekOf}`)

  setOutput('week_of', weekOf)
  setOutput('gasoline', gasoline)
  setOutput('diesel', diesel)
  setOutput('source', source.url)

  const fuelPrices = readFuelPrices()
  const lastGasoline = latestRecorded(fuelPrices, 'gasoline')
  const lastDiesel = latestRecorded(fuelPrices, 'diesel')

  if (lastGasoline?.pricePerLiter === gasoline && lastDiesel?.pricePerLiter === diesel) {
    console.log('Same prices as the latest recorded ones. Nothing to do.')
    setOutput('changed', 'false')
    return
  }
  if (fuelPrices.some((row) => row.weekOf === weekOf)) {
    console.log(`${weekOf} is already recorded. Nothing to do.`)
    setOutput('changed', 'false')
    return
  }

  const sqlUpdated = updateSeedSql(weekOf, gasoline, diesel)
  const jsonUpdated = updateSeedJson(weekOf, gasoline, diesel)
  setOutput('changed', String(sqlUpdated || jsonUpdated))
}

function updateSeedSql(weekOf, gasoline, diesel) {
  const { text, eol } = readLf(seedSqlPath)

  if (text.includes(`'${weekOf}'`)) return false // already has this week

  const match = text.match(/INSERT INTO fuel_prices[\s\S]*?;/)
  if (!match) fail('could not find the fuel_prices INSERT block in seed.sql')

  const block = match[0]
  // New rows go right before ON CONFLICT, not before the block's final
  // semicolon -- the VALUES list ends at ON CONFLICT, the semicolon now
  // closes the DO UPDATE SET clause after it (seed.sql upserts instead of
  // truncating, see its header comment for why).
  const conflictIndex = block.indexOf('ON CONFLICT')
  if (conflictIndex === -1) fail('fuel_prices INSERT is missing its ON CONFLICT clause')

  const newBlock =
    block.slice(0, conflictIndex).replace(/\n$/, '') +
    `,\n  ('gasoline', ${gasoline}, '${weekOf}'),\n  ('diesel', ${diesel}, '${weekOf}')\n` +
    block.slice(conflictIndex)

  writeWithEol(seedSqlPath, text.replace(block, () => newBlock), eol)
  return true
}

function updateSeedJson(weekOf, gasoline, diesel) {
  const { text, eol } = readLf(seedJsonPath)

  if (text.includes(`"weekOf": "${weekOf}"`)) return false // already has this week

  // Edited as text, not JSON.parse + stringify, so the rest of the file's
  // formatting (including the single-line car rows) is left untouched.
  const match = text.match(/"fuelPrices":\s*\[([\s\S]*?)\n {2}\],\n {2}"places"/)
  if (!match) fail('could not find the fuelPrices array in seed.json')

  const idNumbers = [...match[1].matchAll(/"id":\s*(\d+)/g)].map((m) => Number(m[1]))
  const nextId = Math.max(...idNumbers) + 1

  const newEntries =
    `,\n    {\n      "id": ${nextId},\n      "fuelType": "gasoline",\n` +
    `      "pricePerLiter": ${gasoline},\n      "weekOf": "${weekOf}"\n    },\n` +
    `    {\n      "id": ${nextId + 1},\n      "fuelType": "diesel",\n` +
    `      "pricePerLiter": ${diesel},\n      "weekOf": "${weekOf}"\n    }`

  const updated = text.replace(match[0], `"fuelPrices": [${match[1]}${newEntries}\n  ],\n  "places"`)
  JSON.parse(updated) // fail loudly here rather than write invalid JSON
  writeFileSync(seedJsonPath, updated)
  return true
}

// Every price in seed.json as one upsert, so the live database ends up with
// exactly the rows the repo has -- including any week a past run failed to push.
// Only fuel_prices is touched; users, vehicles and trips are never part of it.
function printUpsertSql() {
  const rows = readFuelPrices().map((row) => {
    if (!['gasoline', 'diesel'].includes(row.fuelType)) fail(`unexpected fuelType ${row.fuelType}`)
    if (!isPlausible(row.pricePerLiter)) fail(`implausible price ${row.pricePerLiter}`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.weekOf)) fail(`bad date ${row.weekOf}`)
    return `  ('${row.fuelType}', ${row.pricePerLiter}, '${row.weekOf}')`
  })
  console.log(
    'INSERT INTO fuel_prices (fuel_type, price_per_liter, week_of) VALUES\n' +
      rows.join(',\n') +
      '\nON CONFLICT (fuel_type, week_of) DO UPDATE SET\n  price_per_liter = EXCLUDED.price_per_liter;'
  )
}

if (process.argv.includes('--sql')) printUpsertSql()
else main().catch((error) => fail(error.stack || String(error)))
