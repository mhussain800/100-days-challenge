import { Gauge } from 'lucide-react';

const EFFORT_STEPS = Array.from({ length: 11 }, (_, index) => index * 10);

function getEffortLevel(value, checkedIn) {
  if (!checkedIn) return 'unset';
  if (value <= 30) return 'low';
  if (value <= 60) return 'steady';
  if (value <= 80) return 'focused';
  return 'strong';
}

export default function EffortCheckIn({ effort, onChange }) {
  const checkedIn = Number.isInteger(effort) && effort >= 0 && effort <= 100;
  const value = checkedIn ? effort : 0;
  const level = getEffortLevel(value, checkedIn);

  return (
    <section className="effort-card" data-effort-level={level} style={{ '--effort-fill': `${value}%` }}>
      <header className="effort-card-header">
        <span className="effort-icon"><Gauge size={19} /></span>
        <span>
          <strong>Today&apos;s effort</strong>
          <small>How much did you give today?</small>
        </span>
        <output className="effort-value" htmlFor="daily-effort-range">
          <strong>{value}%</strong>
          <small>{checkedIn ? 'checked in' : 'not set'}</small>
        </output>
      </header>

      <div className="effort-slider-wrap">
        <input
          id="daily-effort-range"
          className="effort-slider"
          type="range"
          min="0"
          max="100"
          step="10"
          value={value}
          aria-label="Today’s effort percentage"
          aria-valuetext={`${value}% effort`}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <div className="effort-ticks" aria-label="Choose effort percentage">
          {EFFORT_STEPS.map((step) => (
            <button
              key={step}
              type="button"
              data-active={checkedIn && value === step}
              onClick={() => onChange(step)}
              aria-label={`Set today’s effort to ${step}%`}
              aria-pressed={checkedIn && value === step}
            >
              {step}%
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
