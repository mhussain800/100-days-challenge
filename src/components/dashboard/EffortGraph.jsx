import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Gauge } from 'lucide-react';

function getEffort(dayLog) {
  const effort = dayLog?.dailyEffort?.percentage;
  return Number.isInteger(effort) && effort >= 0 && effort <= 100 ? effort : null;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length || !Number.isFinite(payload[0].value)) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      <span>Effort <b>{payload[0].value}%</b></span>
    </div>
  );
}

export default function EffortGraph({ logs, days100, today }) {
  const chartData = useMemo(() => {
    const completedDays = days100.filter((day) => day <= today);
    const visibleDays = (completedDays.length ? completedDays : days100.slice(0, 10)).slice(-10);

    return visibleDays.map((day) => ({
      name: `Day ${days100.indexOf(day) + 1}`,
      effort: day <= today ? getEffort(logs[day]) : null,
    }));
  }, [days100, logs, today]);

  return (
    <section className="chart-card effort-chart">
      <header className="chart-header">
        <span className="chart-icon"><Gauge size={18} /></span>
        <span><strong>Daily effort</strong><small>Your most recent 10 days at a glance</small></span>
      </header>
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 12, left: 2, bottom: 2 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--separator)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} tickMargin={8} width={44} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="effort" stroke="var(--accent)" strokeWidth={3} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--accent)' }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
