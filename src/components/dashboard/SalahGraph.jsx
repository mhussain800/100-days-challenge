import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MoonStar } from 'lucide-react';
import ChartRangeControl from './ChartRangeControl';
import { formatRangeDate, useChartRange } from './chartRange';

function ChartTooltip({ active, payload, label, prayerCount }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      <span>Prayers <b>{payload[0].value} / {prayerCount}</b></span>
    </div>
  );
}

function SalahDot({ cx, cy, value }) {
  if (!Number.isFinite(value)) return null;
  return <circle className="salah-data-point" cx={cx} cy={cy} r={4} />;
}

export default function SalahGraph({ logs, today, prayerTasks }) {
  const chartRange = useChartRange(today);
  const chartData = useMemo(() => chartRange.dates.map((day) => ({
    name: formatRangeDate(day, chartRange.range),
    count: prayerTasks.filter((task) => logs[day]?.[task.id]?.checked).length,
  })), [chartRange.dates, chartRange.range, logs, prayerTasks]);

  return (
    <section className="chart-card salah-chart">
      <header className="chart-header">
        <span className="chart-icon"><MoonStar size={18} /></span>
        <span><strong>Salah consistency</strong><small>Your active daily prayers</small></span>
      </header>
      <ChartRangeControl {...chartRange} today={today} label="Salah consistency" />
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 12, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--separator)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} minTickGap={24} />
            <YAxis stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} domain={[0, prayerTasks.length]} allowDecimals={false} />
            <Tooltip content={<ChartTooltip prayerCount={prayerTasks.length} />} />
            <Line type="linear" dataKey="count" stroke="var(--success)" strokeWidth={2.5} dot={<SalahDot />} activeDot={{ r: 6, stroke: 'var(--surface)', strokeWidth: 2, fill: 'var(--success)' }} connectNulls={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
