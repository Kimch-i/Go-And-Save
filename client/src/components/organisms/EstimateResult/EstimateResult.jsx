import { Link } from 'react-router';
import CostCard from '../../molecules/CostCard/CostCard.jsx';
import TrafficGapNote from '../../molecules/TrafficGapNote/TrafficGapNote.jsx';
import PriceFootnote from '../../molecules/PriceFootnote/PriceFootnote.jsx';
import EstimateExplainer from '../../molecules/EstimateExplainer/EstimateExplainer.jsx';
import EmptyState from '../../molecules/EmptyState/EmptyState.jsx';
import Button from '../../atoms/Button/Button.jsx';
import Spinner from '../../atoms/Spinner/Spinner.jsx';
import styles from './EstimateResult.module.css';

const COMMUTE_MAX_KM = 60;
const WORK_DAYS_PER_MONTH = 22;

// The result under the map: the two cost cards, or loading, error or empty.
export default function EstimateResult({ resultRef, ...props }) {
  return (
    <div ref={resultRef} className={styles.result} aria-live="polite">
      <ResultContent {...props} />
    </div>
  );
}

function ResultContent({ status, error, onRetry, estimate, roundTrip, onSave, saving, saved }) {
  if (status === 'loading') {
    return (
      <p className={styles.loading}>
        <Spinner /> Checking the route and live traffic…
      </p>
    );
  }

  if (status === 'error') {
    return (
      <EmptyState
        variant="error"
        title={error.message}
        message={error.canRetry ? 'Check both places, then try again.' : null}
        actionLabel={error.canRetry ? 'Try again' : null}
        onAction={onRetry}
      />
    );
  }

  if (!estimate) {
    return <EmptyState message="Choose where you are going and we will work out what it costs." />;
  }

  const extraCost = estimate.actualCost - estimate.idealCost;
  const oneWayKm = roundTrip ? estimate.distance / 2 : estimate.distance;
  const monthlyCost = oneWayKm <= COMMUTE_MAX_KM ? extraCost * WORK_DAYS_PER_MONTH : null;

  return (
    <>
      <div className={styles.cards}>
        <CostCard
          label="If the road were clear"
          amount={estimate.idealCost}
          meta={`${estimate.idealLiters.toFixed(2)} L in ${Math.round(estimate.freeMin)} min`}
        />
        {estimate.hasTraffic && (
          <CostCard
            label="Leaving now"
            amount={estimate.actualCost}
            meta={`${estimate.actualLiters.toFixed(2)} L in ${Math.round(estimate.trafficMin)} min`}
            emphasis
          />
        )}
      </div>

      <div className={styles.gap}>
        <TrafficGapNote hasTraffic={estimate.hasTraffic} extraCost={extraCost} monthlyCost={monthlyCost} />
        <div className={styles.save}>
          {saved ? (
            <Link to="/trips" className="small">Saved to your trips</Link>
          ) : (
            <Button variant="ghost" onClick={onSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save trip'}
            </Button>
          )}
        </div>
      </div>

      <PriceFootnote
        distance={estimate.distance}
        roundTrip={roundTrip}
        price={estimate.price}
        fuelType={estimate.fuelType}
        extraKg={estimate.extraKg}
      />
      <EstimateExplainer />
    </>
  );
}
