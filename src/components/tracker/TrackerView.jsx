import { useState } from 'react';
import { ChevronLeft, ChevronRight, ListChecks, Plus, X } from 'lucide-react';
import TaskRow from './TaskRow';
import TodoList from './TodoList';
import TimeBlocker from './TimeBlocker';
import CustomTaskForm from '../settings/CustomTaskForm';
import { parseDateKey, toDateKey } from '../../utils/helpers';

const formatHeadingDate = (date) => parseDateKey(date).toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export default function TrackerView({ tasks, sections, logs, today, currentDate, setCurrentDate, updateTask, onAddTask }) {
  const [taskSheetCategory, setTaskSheetCategory] = useState(null);
  const currentLog = logs[currentDate] || {};
  const grouped = tasks.reduce((groups, task) => {
    (groups[task.category] = groups[task.category] || []).push(task);
    return groups;
  }, {});
  const completed = tasks.filter((task) => currentLog[task.id]?.checked).length;
  const completion = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const isPastDate = currentDate < today;

  const shiftDate = (amount) => {
    const date = parseDateKey(currentDate);
    date.setDate(date.getDate() + amount);
    setCurrentDate(toDateKey(date));
  };

  const openTaskSheet = (category) => setTaskSheetCategory(category || sections[0] || 'Personal');

  return (
    <div className="page-stack">
      <section className="page-heading tracker-heading">
        <div>
          <span className="eyebrow">Daily check-in</span>
          <h1>{formatHeadingDate(currentDate)}</h1>
          <p>{completed} of {tasks.length} habits complete · {completion}% progress{isPastDate ? ' · Day closed' : ''}</p>
        </div>
        <button className="primary-button" onClick={() => openTaskSheet()}><Plus size={17} /> Add task</button>
      </section>

      <section className="date-panel" aria-label="Choose tracking date">
        <button className="icon-button" onClick={() => shiftDate(-1)} aria-label="Previous day"><ChevronLeft size={20} /></button>
        <label className="date-field">
          <span>Selected date</span>
          <input type="date" value={currentDate} onChange={(event) => setCurrentDate(event.target.value)} />
        </label>
        <button className="icon-button" onClick={() => shiftDate(1)} aria-label="Next day"><ChevronRight size={20} /></button>
        <div className="progress-track" aria-label={`${completion}% complete`}><span style={{ width: `${completion}%` }} /></div>
      </section>

      {sections.length ? (
        <div className="tracker-grid">
          {sections.map((category) => {
            const categoryTasks = grouped[category] || [];
            const categoryComplete = categoryTasks.filter((task) => currentLog[task.id]?.checked).length;
            return (
              <section key={category} className="task-group">
                <header className="task-group-header">
                  <span><i className="category-dot" /><strong>{category}</strong></span>
                  <span className="task-group-actions">
                    <small>{categoryComplete}/{categoryTasks.length}</small>
                    <button onClick={() => openTaskSheet(category)} aria-label={`Add a task to ${category}`}><Plus size={15} /></button>
                  </span>
                </header>
                <div className="task-list">
                  {categoryTasks.map((task) => (
                    <TaskRow key={task.id} task={task} value={currentLog[task.id] || {}} isPast={isPastDate} onChange={(field, value) => updateTask(task.id, field, value)} />
                  ))}
                  {!categoryTasks.length && <button className="empty-section-row" onClick={() => openTaskSheet(category)}><Plus size={15} /> Add the first task</button>}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon"><ListChecks size={28} /></span>
          <h2>Build a tracker that fits you</h2>
          <p>Add your first task here, or create and organize sections in Settings.</p>
          <button className="primary-button" onClick={() => openTaskSheet('Personal')}><Plus size={17} /> Add your first task</button>
        </div>
      )}

      <div className="daily-tools-grid">
        <TimeBlocker date={currentDate} logs={logs} updateLog={(_, field, value) => updateTask(field, 'list', value)} />
        <TodoList date={currentDate} logs={logs} updateLog={(_, __, newTodos) => updateTask('todos', 'list', newTodos)} />
      </div>

      {taskSheetCategory !== null && (
        <div className="modal-backdrop task-sheet-backdrop" role="presentation" onMouseDown={() => setTaskSheetCategory(null)}>
          <section className="task-sheet" role="dialog" aria-modal="true" aria-labelledby="task-sheet-title" onMouseDown={(event) => event.stopPropagation()}>
            <span className="sheet-grabber" aria-hidden="true" />
            <header className="sheet-header">
              <div><span className="eyebrow">Today</span><h2 id="task-sheet-title">Add a custom task</h2><p>It will also get a widget in Insights.</p></div>
              <button className="icon-button" onClick={() => setTaskSheetCategory(null)} aria-label="Close"><X size={18} /></button>
            </header>
            <CustomTaskForm key={taskSheetCategory} sections={sections} initialCategory={taskSheetCategory} onAddTask={onAddTask} onComplete={() => setTaskSheetCategory(null)} compact />
          </section>
        </div>
      )}
    </div>
  );
}
