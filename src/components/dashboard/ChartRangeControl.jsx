const RANGE_OPTIONS = [
  ['week', 'Week'],
  ['month', 'Month'],
  ['year', 'Year'],
  ['custom', 'Custom'],
];

export default function ChartRangeControl({ range, setRange, customStart, setCustomStart, customEnd, setCustomEnd, today, label }) {
  return (
    <>
      <div className="chart-range-control" aria-label={`${label} chart range`}>
        {RANGE_OPTIONS.map(([value, optionLabel]) => (
          <button key={value} type="button" data-active={range === value} onClick={() => setRange(value)}>{optionLabel}</button>
        ))}
      </div>
      {range === 'custom' && (
        <div className="chart-custom-range">
          <label><span>From</span><input type="date" value={customStart} max={today} onChange={(event) => setCustomStart(event.target.value)} /></label>
          <label><span>To</span><input type="date" value={customEnd} max={today} onChange={(event) => setCustomEnd(event.target.value)} /></label>
        </div>
      )}
    </>
  );
}
