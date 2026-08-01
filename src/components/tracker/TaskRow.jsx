import { Check, X } from 'lucide-react';

export default function TaskRow({ task, value, onChange, isPast = false }) {
  const checked = !!value.checked;
  const missed = isPast && !checked;

  const detailField = () => {
    const showWhenIncomplete = task.detailWhen === 'incomplete';
    const showDetails = showWhenIncomplete ? !checked : checked;
    if (!showDetails || task.type === 'bool') return null;

    if (task.type === 'bool_select') {
      return (
        <select
          className="task-detail-input"
          value={value.val || task.options?.[0] || ''}
          onChange={(event) => onChange('val', event.target.value)}
          aria-label={`${task.label} choice`}
        >
          {(task.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      );
    }

    if (task.type === 'bool_num' || task.type === 'bool_text') {
      return (
        <input
          className="task-detail-input"
          type={task.type === 'bool_num' ? 'number' : 'text'}
          value={value.val || ''}
          onChange={(event) => onChange('val', event.target.value)}
          placeholder={task.placeholder || (task.type === 'bool_num' ? 'Value' : 'Add note')}
          aria-label={`${task.label} details`}
        />
      );
    }

    if (task.type === 'bool_time' || task.type === 'bool_time_slept') {
      return (
        <input
          className="task-detail-input time-input"
          type="time"
          value={value.val || ''}
          onChange={(event) => onChange('val', event.target.value)}
          aria-label={`${task.label} time`}
        />
      );
    }

    return null;
  };

  return (
    <div className="task-row" data-complete={checked} data-missed={missed}>
      <button
        className="task-check"
        role="switch"
        aria-checked={checked}
        aria-label={`${checked ? 'Mark incomplete' : 'Complete'} ${task.label}`}
        onClick={() => onChange('checked', !checked)}
      >
        {missed ? <X size={15} strokeWidth={3} /> : <Check size={15} strokeWidth={3} />}
      </button>
      <div className="task-row-content">
        <span className="task-label" title={task.label}>{task.label}</span>
        {detailField()}
      </div>
    </div>
  );
}
