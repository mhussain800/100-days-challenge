import { useState } from 'react';
import {
  Check,
  Folder,
  FolderPlus,
  Laptop,
  Moon,
  Palette,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import CustomTaskForm from './CustomTaskForm';

const THEME_OPTIONS = [
  { id: 'ios', name: 'iOS Focus', description: 'Clean, calm and designed around native-feeling controls.' },
  { id: 'ledger', name: 'Classic Ledger', description: 'Your original paper, ink and serif theme—preserved.' },
];

const COLOR_MODES = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'Automatic', icon: Laptop },
];

export default function SettingsView({
  tasks,
  sections,
  theme,
  colorMode,
  onThemeChange,
  onColorModeChange,
  onAddTask,
  onAddSection,
  onRemoveSection,
  onRemoveTask,
  onRemoveDefaultTasks,
  onRestoreDefaults,
}) {
  const [newSection, setNewSection] = useState('');
  const [sectionError, setSectionError] = useState('');
  const [pendingRemoval, setPendingRemoval] = useState(null);

  const handleAddSection = async (event) => {
    event.preventDefault();
    const cleanName = newSection.trim();
    if (!cleanName) {
      setSectionError('Give the section a name.');
      return;
    }
    if (sections.some((section) => section.toLocaleLowerCase() === cleanName.toLocaleLowerCase())) {
      setSectionError('That section already exists.');
      return;
    }
    setSectionError('');
    await onAddSection(cleanName);
    setNewSection('');
  };

  const confirmRemoval = async () => {
    if (pendingRemoval?.type === 'all-defaults') await onRemoveDefaultTasks();
    if (pendingRemoval?.type === 'task') await onRemoveTask(pendingRemoval.task.id);
    if (pendingRemoval?.type === 'section') await onRemoveSection(pendingRemoval.section);
    setPendingRemoval(null);
  };

  const removalTitle = pendingRemoval?.type === 'all-defaults'
    ? 'Remove pre-installed tasks?'
    : pendingRemoval?.type === 'section'
      ? `Remove “${pendingRemoval.section}”?`
      : `Remove “${pendingRemoval?.task?.label}”?`;

  const removalCopy = pendingRemoval?.type === 'section'
    ? `This also removes ${tasks.filter((task) => task.category === pendingRemoval.section).length} active task${tasks.filter((task) => task.category === pendingRemoval.section).length === 1 ? '' : 's'} in this section. Past tracking data stays in your history.`
    : 'Your past tracking data stays safely in your history. This only removes the task from Today and Insights.';

  return (
    <div className="page-stack settings-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Make it yours</span>
          <h1>Settings</h1>
          <p>Choose your look and decide exactly what belongs in your daily practice.</p>
        </div>
      </section>

      <section className="settings-section">
        <div className="section-title-row">
          <div className="section-icon"><Palette size={19} /></div>
          <div><h2>Appearance</h2><p>Theme and light mode follow you across devices.</p></div>
        </div>

        <div className="theme-grid">
          {THEME_OPTIONS.map((option) => (
            <button key={option.id} className="theme-choice" data-selected={theme === option.id} onClick={() => onThemeChange(option.id)} aria-pressed={theme === option.id}>
              <span className="theme-preview" data-preview={option.id} aria-hidden="true">
                <span className="preview-bar" />
                <span className="preview-card preview-card-wide" />
                <span className="preview-card" />
                <span className="preview-card" />
              </span>
              <span className="theme-copy"><strong>{option.name}</strong><small>{option.description}</small></span>
              <span className="theme-check">{theme === option.id && <Check size={15} strokeWidth={3} />}</span>
            </button>
          ))}
        </div>

        <div className="appearance-mode-row">
          <div><strong>Color mode</strong><small>Automatic follows your phone&apos;s appearance setting.</small></div>
          <div className="segmented-control mode-control" aria-label="Color mode">
            {COLOR_MODES.map(({ id, label, icon: Icon }) => (
              <button key={id} data-active={colorMode === id} onClick={() => onColorModeChange(id)} aria-pressed={colorMode === id}><Icon size={14} />{label}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="settings-section" id="custom-task-form">
        <div className="section-title-row">
          <div className="section-icon"><Plus size={20} /></div>
          <div><h2>Create a custom task</h2><p>It appears in Today and gets its own live dashboard widget.</p></div>
        </div>
        <CustomTaskForm sections={sections} onAddTask={onAddTask} />
      </section>

      <section className="settings-section">
        <div className="section-title-row">
          <div className="section-icon"><FolderPlus size={19} /></div>
          <div><h2>Task sections</h2><p>Add or remove groups such as Screen Time, Health or Personal.</p></div>
        </div>

        <form className="section-form" onSubmit={handleAddSection}>
          <label className="field"><span>New section name</span><input className="form-input" value={newSection} onChange={(event) => setNewSection(event.target.value)} placeholder="e.g. Learning" /></label>
          <button className="primary-button" type="submit"><FolderPlus size={16} /> Add section</button>
          <span className="form-error" role="alert">{sectionError}</span>
        </form>

        <div className="section-list">
          {sections.map((section) => {
            const taskCount = tasks.filter((task) => task.category === section).length;
            return (
              <div className="section-row" key={section}>
                <span className="task-orb"><Folder size={16} /></span>
                <span><strong>{section}</strong><small>{taskCount} task{taskCount === 1 ? '' : 's'}</small></span>
                <button className="remove-button" onClick={() => setPendingRemoval({ type: 'section', section })} aria-label={`Remove ${section} section`}><Trash2 size={17} /></button>
              </div>
            );
          })}
          {!sections.length && <div className="inline-empty">No sections yet. Create one above.</div>}
        </div>
      </section>

      <section className="settings-section">
        <div className="section-title-row manage-title">
          <div className="section-icon"><SlidersHorizontal size={19} /></div>
          <div><h2>Active task list</h2><p>{tasks.length} tasks are currently shown in your tracker.</p></div>
          <div className="section-actions">
            <button className="text-button" onClick={onRestoreDefaults}><RotateCcw size={15} /> Restore defaults</button>
            {tasks.some((task) => !task.custom) && <button className="text-button danger-text" onClick={() => setPendingRemoval({ type: 'all-defaults' })}><Trash2 size={15} /> Remove pre-installed</button>}
          </div>
        </div>

        {tasks.length ? (
          <div className="manage-list">
            {tasks.map((task) => (
              <div className="manage-row" key={task.id}>
                <span className="task-orb" data-custom={!!task.custom}>{task.label.charAt(0).toUpperCase()}</span>
                <span className="manage-copy"><strong>{task.label}</strong><small>{task.category} · {task.custom ? 'Custom' : 'Pre-installed'}{task.detailWhen === 'incomplete' ? ' · Feature A' : ''}</small></span>
                <button className="remove-button" onClick={() => setPendingRemoval({ type: 'task', task })} aria-label={`Remove ${task.label}`}><Trash2 size={17} /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state compact-empty"><span className="empty-icon"><Check size={24} /></span><h3>Your tracker is a blank canvas</h3><p>Add a custom task above or restore the pre-installed list.</p></div>
        )}
      </section>

      {pendingRemoval && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setPendingRemoval(null)}>
          <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="remove-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="dialog-close" onClick={() => setPendingRemoval(null)} aria-label="Close"><X size={18} /></button>
            <span className="danger-orb"><Trash2 size={21} /></span>
            <h2 id="remove-title">{removalTitle}</h2>
            <p>{removalCopy}</p>
            <div className="dialog-actions"><button className="secondary-button" onClick={() => setPendingRemoval(null)}>Cancel</button><button className="danger-button" onClick={confirmRemoval}>Remove</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
