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
            <Line type="monotone" dataKey="count" stroke="var(--success)" strokeWidth={3} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--success)' }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
