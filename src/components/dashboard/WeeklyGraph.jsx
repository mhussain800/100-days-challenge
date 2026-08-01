import { BarChart3 } from 'lucide-react';
import { TIME_CATEGORIES } from '../../data/tasks';

export default function WeeklyGraph({ logs, today }) {
  const past7Dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${today}T12:00:00`);
    date.setDate(date.getDate() - (6 - index));
    return date.toISOString().split('T')[0];
  });

  const chartData = past7Dates.map((date) => {
    const blocks = logs[date]?.timeBlocks?.list || logs[date]?.timeBlocks;
    const totals = {};
    (Array.isArray(blocks) ? blocks : []).forEach((categoryId) => {
      if (categoryId) totals[categoryId] = (totals[categoryId] || 0) + 1;
    });
    const segments = Object.entries(totals).map(([id, hours]) => {
      const category = TIME_CATEGORIES.find((item) => item.id === id);
      return { id, hours, color: category?.color || 'var(--text-tertiary)', label: category?.label || 'Unknown' };
    });
    return {
      date,
      dayName: new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
      totalTracked: segments.reduce((sum, segment) => sum + segment.hours, 0),
      segments,
    };
  });

  return (
    <section className="chart-card weekly-chart">
      <header className="chart-header">
        <span className="chart-icon"><BarChart3 size={18} /></span>
        <span><strong>Weekly time</strong><small>Last seven days</small></span>
      </header>
      <div className="weekly-plot">
        <div className="weekly-grid-lines"><span>24h</span><span>18h</span><span>12h</span><span>6h</span><span>0h</span></div>
        <div className="weekly-columns">
          {chartData.map((day) => (
            <div className="weekly-column" key={day.date}>
              <div className="weekly-bar" style={{ height: `${(day.totalTracked / 24) * 100}%` }}>
                {day.segments.map((segment) => (
                  <i
                    key={segment.id}
                    style={{ height: `${(segment.hours / day.totalTracked) * 100}%`, backgroundColor: segment.color }}
                    title={`${segment.label}: ${segment.hours}h`}
                  />
                ))}
              </div>
              <span>{day.dayName}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-legend">
        {TIME_CATEGORIES.map((category) => <span key={category.id}><i style={{ backgroundColor: category.color }} />{category.label}</span>)}
      </div>
    </section>
  );
}
