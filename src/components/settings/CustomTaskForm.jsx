import { useState } from 'react';
import { Plus } from 'lucide-react';
import { makeCustomTask, TASK_TYPE_OPTIONS } from '../../data/tasks';

const CUSTOM_SECTION = '__custom_section__';

const makeInitialForm = (category = 'Personal', sections = []) => {
  const existingSection = sections.find((section) => section.toLocaleLowerCase() === category.toLocaleLowerCase());
  return {
  label: '',
  sectionChoice: existingSection || sections[0] || CUSTOM_SECTION,
  customSection: existingSection || sections.length ? '' : category,
  type: 'bool',
  placeholder: '',
  options: '',
  detailWhen: 'complete',
  };
};

export default function CustomTaskForm({ sections, initialCategory = 'Personal', onAddTask, onComplete, compact = false }) {
  const [form, setForm] = useState(() => makeInitialForm(initialCategory, sections));
  const [formError, setFormError] = useState('');

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const optionList = form.options.split(',').map((option) => option.trim()).filter(Boolean);
    const enteredCategory = form.sectionChoice === CUSTOM_SECTION ? form.customSection.trim() : form.sectionChoice;
    const category = sections.find((section) => section.toLocaleLowerCase() === enteredCategory.toLocaleLowerCase()) || enteredCategory;

    if (!form.label.trim()) {
      setFormError('Give your task a name.');
      return;
    }
    if (!category) {
      setFormError('Give your custom section a name.');
      return;
    }
    if (form.type === 'bool_select' && optionList.length < 2) {
      setFormError('Add at least two comma-separated choices.');
      return;
    }

    setFormError('');
    await onAddTask(makeCustomTask({ ...form, category, options: optionList }));
    setForm(makeInitialForm(initialCategory, [...sections, category]));
    onComplete?.();
  };

  const hasDetails = form.type !== 'bool';

  return (
    <form className={`task-form${compact ? ' compact-task-form' : ''}`} onSubmit={handleSubmit}>
      <label className="field field-wide">
        <span>Task name</span>
        <input
          className="form-input"
          value={form.label}
          onChange={(event) => updateField('label', event.target.value)}
          placeholder="e.g. Practice Spanish"
          autoFocus={compact}
        />
      </label>

      <label className="field">
        <span>Section</span>
        <select
          className="form-input"
          value={form.sectionChoice}
          onChange={(event) => updateField('sectionChoice', event.target.value)}
        >
          {sections.map((section) => <option key={section} value={section}>{section}</option>)}
          <option value={CUSTOM_SECTION}>＋ Add custom section…</option>
        </select>
        {form.sectionChoice === CUSTOM_SECTION && (
          <input
            className="form-input custom-section-input"
            value={form.customSection}
            onChange={(event) => updateField('customSection', event.target.value)}
            placeholder="Name your new section"
            aria-label="Custom section name"
          />
        )}
      </label>

      <label className="field">
        <span>How to track it</span>
        <select className="form-input" value={form.type} onChange={(event) => updateField('type', event.target.value)}>
          {TASK_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>

      {form.type === 'bool_select' ? (
        <label className="field field-wide">
          <span>Choices</span>
          <input
            className="form-input"
            value={form.options}
            onChange={(event) => updateField('options', event.target.value)}
            placeholder="Great, Okay, Needs work"
          />
          <small>Separate each choice with a comma.</small>
        </label>
      ) : hasDetails && (
        <label className="field field-wide">
          <span>Input hint <em>Optional</em></span>
          <input
            className="form-input"
            value={form.placeholder}
            onChange={(event) => updateField('placeholder', event.target.value)}
            placeholder={form.type === 'bool_num' ? 'minutes, pages, reps…' : 'Add a helpful hint'}
          />
        </label>
      )}

      {hasDetails && (
        <fieldset className="field field-wide detail-behavior">
          <legend>Show the detail field</legend>
          <div className="segmented-control">
            <button type="button" data-active={form.detailWhen === 'complete'} onClick={() => updateField('detailWhen', 'complete')}>After completion</button>
            <button type="button" data-active={form.detailWhen === 'incomplete'} onClick={() => updateField('detailWhen', 'incomplete')}>When incomplete · A</button>
          </div>
          <small>Feature A is ideal for recording why an avoidance habit was missed.</small>
        </fieldset>
      )}

      <div className="form-footer field-wide">
        <span className="form-error" role="alert">{formError}</span>
        <button className="primary-button" type="submit"><Plus size={17} /> Add task</button>
      </div>
    </form>
  );
}
