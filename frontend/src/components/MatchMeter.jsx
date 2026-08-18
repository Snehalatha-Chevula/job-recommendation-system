import { matchTone } from '../utils/format.js';

/**
 * The match percentage, shown as a number plus a bar.
 *
 * The value is computed in Cypher as
 *   matched required skills / total required skills * 100
 * and is passed straight through - there is no client-side scoring.
 */
export function MatchMeter({ percentage, caption }) {
  const value = Math.max(0, Math.min(100, Number(percentage) || 0));
  const rounded = Number.isInteger(value) ? value : Math.round(value * 10) / 10;

  return (
    <div className="match">
      <div className="match__head">
        <span className="match__value">{rounded}%</span>
        <span className="match__label">Match</span>
      </div>
      <div
        className="match__track"
        role="progressbar"
        aria-valuenow={rounded}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Skill match: ${rounded} percent`}
      >
        <div className={`match__fill ${matchTone(value)}`} style={{ width: `${value}%` }} />
      </div>
      {caption && <p className="match__caption">{caption}</p>}
    </div>
  );
}
