import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Gauge } from 'lucide-react';
import ChartRangeControl from './ChartRangeControl';
import { formatRangeDate, formatTooltipDate, useChartRange } from './chartRange';

function getEffort(dayLog) {
  const value = dayLog?.dailyEffort?.percentage ?? dayLog?.dailyEffort;
  if (value === null || value === undefined || value === '') return null;
  const effort = Number(value);
  return Number.isFinite(effort) && effort >= 0 && effort <= 100 ? effort : null;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length || !Number.isFinite(payload[0].value)) return null;
  return (
    <div className="chart-tooltip">
      <strong>{payload[0]?.payload?.tooltipDate || label}</strong>
      <span>Effort <b>{payload[0].value}%</b></span>
    </div>
  );
}

function getEffortColor(value) {
  if (value <= 30) return 'var(--danger)';
  if (value <= 60) return 'var(--warning)';
  if (value <= 80) return 'var(--accent)';
  return 'var(--success)';
}

function EffortDot({ cx, cy, value }) {
  if (!Number.isFinite(value)) return null;
  return <circle cx={cx} cy={cy} r={4.5} fill={getEffortColor(value)} stroke="var(--surface)" strokeWidth={2} />;
}

export default function EffortGraph({ logs, today }) {
  const chartRange = useChartRange(today);
  const chartData = useMemo(() => chartRange.dates.map((day) => ({
    name: formatRangeDate(day, chartRange.range),
    tooltipDate: formatTooltipDate(day),
    effort: getEffort(logs[day]),
  })), [chartRange.dates, chartRange.range, logs]);

  return (
    <section className="chart-card effort-chart">
      <header className="chart-header">
        <span className="chart-icon"><Gauge size={18} /></span>
        <span><strong>Daily effort</strong><small>{chartRange.selectedRange.label}</small></span>
      </header>
      <ChartRangeControl {...chartRange} today={today} label="Daily effort" />
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 12, left: 2, bottom: 2 }}>
            <defs>
              <linearGradient id="effort-level-gradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="var(--danger)" />
                <stop offset="30%" stopColor="var(--danger)" />
                <stop offset="31%" stopColor="var(--warning)" />
                <stop offset="60%" stopColor="var(--warning)" />
                <stop offset="61%" stopColor="var(--accent)" />
                <stop offset="80%" stopColor="var(--accent)" />
                <stop offset="81%" stopColor="var(--success)" />
                <stop offset="100%" stopColor="var(--success)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--separator)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} minTickGap={24} />
            <YAxis stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} tickMargin={8} width={44} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="effort" stroke="url(#effort-level-gradient)" strokeWidth={3} dot={<EffortDot />} activeDot={{ r: 6, stroke: 'var(--surface)', strokeWidth: 2, fill: 'var(--text-primary)' }} connectNulls={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
