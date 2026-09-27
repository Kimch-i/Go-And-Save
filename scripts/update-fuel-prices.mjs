// Weekly fuel-price check. Run by .github/workflows/update-fuel-prices.yml.
//
// What this does and does not do:
// - Fetches ONE public page, tries to read a gasoline and a diesel peso price
//   off it, and sanity-checks both before touching anything.
// - If the page can't be parsed, or a number looks wrong, it exits with an
//   error and writes NOTHING. The workflow then fails loudly (you get a
//   GitHub notification) instead of a bad number quietly landing in the repo.
// - If the numbers look fine and this week isn't already recorded, it edits
//   server/db/seed.sql and client/src/api/seed.json in place and exits 0.
//   The workflow turns that file change into a pull request for a human to
//   review — this script never commits, pushes, or merges anything itself.
//
// Merging the PR only updates the files in the repo. It does not touch a
// live database — re-run the seed against Postgres yourself after merging.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const SOURCE_URL = 'https://www.dailyfuels.com/philippines/'
const MIN_PLAUSIBLE = 20 // PHP/liter -- below this, something was misparsed
const MAX_PLAUSIBLE = 250 // PHP/liter -- above this, something was misparsed

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const seedSqlPath = path.join(repoRoot, 'server/db/seed.sql')
const seedJsonPath = path.join(repoRoot, 'client/src/api/seed.json')

function fail(message) {
  console.error(`update-fuel-prices: ${message}`)
  process.exit(1)
}

function extractPrice(html, label) {
  // Looks for the fuel's label, then the first peso amount after it.
  // Deliberately loose about what sits in between (emoji, tags, spacing)
  // since a source page's markup can shift without its wording changing.
  const pattern = new RegExp(`${label}[\\s\\S]{0,120}?₱\\s*([0-9]+(?:\\.[0-9]+)?)`, 'i')
  const match = html.match(pattern)
  return match ? Number(match[1]) : null
}

function extractDate(html) {
  const match = html.match(/Updated:\s*(\d{4}-\d{2}-\d{2})/i)
  return match ? match[1] : null
}

async function main() {
  const response = await fetch(SOURCE_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GAS-price-check/1.0)' },
  })
  if (!response.ok) fail(`source responded ${response.status}`)
  const html = await response.text()

  const gasoline = extractPrice(html, 'Gasoline')
  const diesel = extractPrice(html, 'Diesel')
  const weekOf = extractDate(html)

  if (!Number.isFinite(gasoline) || gasoline < MIN_PLAUSIBLE || gasoline > MAX_PLAUSIBLE) {
    fail(`gasoline price missing or implausible (got ${gasoline})`)
  }
  if (!Number.isFinite(diesel) || diesel < MIN_PLAUSIBLE || diesel > MAX_PLAUSIBLE) {
    fail(`diesel price missing or implausible (got ${diesel})`)
  }
  if (!weekOf) fail('could not find an "Updated: YYYY-MM-DD" date on the page')

  console.log(`Parsed: gasoline ₱${gasoline}/L, diesel ₱${diesel}/L, dated ${weekOf}`)

  const sqlUpdated = updateSeedSql(weekOf, gasoline, diesel)
  const jsonUpdated = updateSeedJson(weekOf, gasoline, diesel)

  if (!sqlUpdated && !jsonUpdated) {
    console.log(`${weekOf} is already recorded in both seed files. Nothing to do.`)
    return
  }

  // Left for the PR body (see the workflow file) to pick up.
  console.log(`::set-output name=week_of::${weekOf}`)
  console.log(`::set-output name=gasoline::${gasoline}`)
  console.log(`::set-output name=diesel::${diesel}`)
  console.log(`::set-output name=source::${SOURCE_URL}`)
}

function updateSeedSql(weekOf, gasoline, diesel) {
  const text = readFileSync(seedSqlPath, 'utf8')

  if (text.includes(`'${weekOf}'`)) return false // already has this week

  const match = text.match(/INSERT INTO fuel_prices[\s\S]*?;/)
  if (!match) fail('could not find the fuel_prices INSERT block in seed.sql')

  const block = match[0]
  const semicolonIndex = block.lastIndexOf(';')
  const newBlock =
    block.slice(0, semicolonIndex) +
    `,\n  ('gasoline', ${gasoline}, '${weekOf}'),\n  ('diesel', ${diesel}, '${weekOf}');`

  writeFileSync(seedSqlPath, text.replace(block, newBlock))
  return true
}

function updateSeedJson(weekOf, gasoline, diesel) {
  const text = readFileSync(seedJsonPath, 'utf8')

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
  writeFileSync(seedJsonPath, updated)

  JSON.parse(updated) // fail loudly here rather than commit invalid JSON
  return true
}

main().catch((error) => fail(error.stack || String(error)))
