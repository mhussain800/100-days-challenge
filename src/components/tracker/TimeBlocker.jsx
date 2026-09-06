import { useState } from 'react';
import { Clock3, Eraser } from 'lucide-react';
import { TIME_CATEGORIES } from '../../data/tasks';

export default function TimeBlocker({ date, logs, updateLog }) {
  const rawData = logs[date]?.timeBlocks?.list || logs[date]?.timeBlocks;
  const blocks = Array.isArray(rawData) ? rawData : Array(24).fill(null);
  const [selectedHours, setSelectedHours] = useState([]);

  const toggleHour = (hour) => {
    setSelectedHours((current) => current.includes(hour)
      ? current.filter((selectedHour) => selectedHour !== hour)
      : [...current, hour]);
  };

  const assignCategory = (categoryId) => {
    if (!selectedHours.length) return;
    const newBlocks = [...blocks];
    selectedHours.forEach((hour) => { newBlocks[hour] = categoryId; });
    updateLog(date, 'timeBlocks', newBlocks);
    setSelectedHours([]);
  };

  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <section className="tool-card time-card">
      <header className="tool-card-header">
        <span className="tool-icon"><Clock3 size={19} /></span>
        <span><strong>Daily time log</strong><small>Select hours, then assign an activity</small></span>
      </header>

      <div className="time-scale" aria-label="24-hour activity timeline">
        <div className="time-labels">
          {[0, 6, 12, 18, 24].map((hour) => <span key={hour}>{hour === 24 ? '12 AM' : formatHour(hour)}</span>)}
        </div>
        <div className="time-blocks">
          {blocks.map((categoryId, hour) => {
            const category = TIME_CATEGORIES.find((item) => item.id === categoryId);
            const selected = selectedHours.includes(hour);
            return (
              <button
                key={hour}
                className="time-block"
                data-selected={selected}
                onClick={() => toggleHour(hour)}
                style={{ backgroundColor: !selected && category ? category.color : undefined }}
                aria-label={`${formatHour(hour)}: ${category?.label || 'Empty'}${selected ? ', selected' : ''}`}
              >
                <span className="time-tooltip">{formatHour(hour)} · {category?.label || 'Empty'}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="time-actions" data-ready={selectedHours.length > 0}>
        <p>{selectedHours.length ? `${selectedHours.length} hour${selectedHours.length > 1 ? 's' : ''} selected` : 'Tap one or more hours'}</p>
        <div className="time-category-list">
          {TIME_CATEGORIES.map((category) => (
            <button key={category.id} onClick={() => assignCategory(category.id)}>
              <i style={{ backgroundColor: category.color }} />{category.label}
            </button>
          ))}
          <button onClick={() => assignCategory(null)}><Eraser size={13} /> Clear</button>
        </div>
      </div>
    </section>
  );
}
