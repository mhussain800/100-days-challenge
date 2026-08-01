import { Clock3 } from 'lucide-react';
import { TIME_CATEGORIES } from '../../data/tasks';

export default function TimeGraph({ logs, today }) {
  const past30Dates = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(`${today}T12:00:00`);
    date.setDate(date.getDate() - index);
    return date.toISOString().split('T')[0];
  });

  const categoryTotals = Object.fromEntries(TIME_CATEGORIES.map((category) => [category.id, 0]));
  past30Dates.forEach((date) => {
    const blocks = logs[date]?.timeBlocks?.list || logs[date]?.timeBlocks;
    if (Array.isArray(blocks)) {
      blocks.forEach((categoryId) => {
        if (categoryId && categoryTotals[categoryId] !== undefined) categoryTotals[categoryId] += 1;
      });
    }
  });

  const chartData = TIME_CATEGORIES.map((category) => ({
    ...category,
    averageHours: categoryTotals[category.id] / 30,
    totalHours: categoryTotals[category.id],
  })).sort((first, second) => second.totalHours - first.totalHours);

  return (
    <section className="chart-card time-average-chart">
      <header className="chart-header">
        <span className="chart-icon"><Clock3 size={18} /></span>
        <span><strong>Where your time goes</strong><small>30-day daily average</small></span>
      </header>
      <div className="bar-chart-list">
        {chartData.map((item) => (
          <div className="bar-chart-row" key={item.id}>
            <span className="bar-label" title={item.label}>{item.label}</span>
            <span className="bar-track"><i style={{ width: `${Math.min((item.averageHours / 12) * 100, 100)}%`, backgroundColor: item.color }} /></span>
            <span className="bar-value">{item.averageHours > 0 ? `${item.averageHours.toFixed(1)}h` : '—'}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
