import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, Minus, Plus, X } from 'lucide-react';
import {
  STUDY_ACTIVITY_OPTIONS,
  STUDY_CONFIDENCE,
  STUDY_DURATION_PRESETS,
  getStudyActivity,
  getSubjectDisplayName,
  sanitizeStudySession,
} from '../../data/study';
import { parseDateKey } from '../../utils/helpers';

const formatSheetDate = (dateKey, theme) => {
  const date = parseDateKey(dateKey);
  if (theme === 'ledger') {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month}`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const emptySession = (dateKey, subjectId) => ({
  dateKey,
  subjectId,
  durationMinutes: 60,
  learningMode: 'new',
  activityType: 'lecture',
  topic: '',
  confidence: 3,
  source: '',
  amountValue: '',
  amountUnit: 'videos',
  notes: '',
});

export default function StudySessionSheet({
  dateKey,
  theme = 'ios',
  subjects,
  sources,
  initialSubjectId,
  initialValues,
  session,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(() => ({
    ...emptySession(dateKey, initialSubjectId || subjects[0]?.id || ''),
    ...(initialValues || {}),
    ...(session || {}),
    dateKey: session?.dateKey || initialValues?.dateKey || dateKey,
  }));
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const topicRef = useRef(null);
  const activeSubjects = subjects.filter((subject) => !subject.archived || subject.id === form.subjectId);
  const activity = useMemo(() => getStudyActivity(form.activityType), [form.activityType]);
  const confidenceLabel = STUDY_CONFIDENCE.find((item) => item.value === Number(form.confidence))?.label || '';

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (detailsOpen) setDetailsOpen(false);
      else onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [detailsOpen, onClose]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError('');
  };

  const changeActivity = (activityType) => {
    const nextActivity = getStudyActivity(activityType);
    setForm((current) => ({
      ...current,
      activityType,
      amountUnit: nextActivity.units.includes(current.amountUnit) ? current.amountUnit : nextActivity.units[0],
    }));
  };

  const setDuration = (value) => updateForm('durationMinutes', Math.min(1440, Math.max(5, Math.round(Number(value) || 5))));
  const adjustDuration = (amount) => setDuration(Number(form.durationMinutes) + amount);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.subjectId) {
      setError('Choose a subject.');
      return;
    }
    if (!form.topic.trim()) {
      setError('Add the topic you studied.');
      topicRef.current?.focus();
      return;
    }
    if (!Number(form.confidence)) {
      setError('Choose your confidence level.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...sanitizeStudySession(form),
        id: session?.id,
        createdAt: session?.createdAt,
      });
      onClose();
    } catch (saveError) {
      console.error('Study session save error:', saveError);
      setError('Could not save this session. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // The study sheet is a viewport-level dialog. Portaling it prevents an
  // ancestor's layout, clipping, filter, or transform from hiding it.
  return createPortal(
    <div className="study-sheet-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="study-session-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="study-sheet-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="study-sheet-grabber" aria-hidden="true" />
        <header className="study-sheet-heading">
          <div>
            <span className="study-ledger-eyebrow">Study log</span>
            <h2 id="study-sheet-title">{session ? 'Edit session' : theme === 'ledger' ? 'New session' : 'New study entry'}</h2>
          </div>
          <div className="study-sheet-heading-actions">
            <time dateTime={form.dateKey}>{formatSheetDate(form.dateKey, theme)}</time>
            <button type="button" className="study-sheet-close" onClick={onClose} aria-label="Close study entry"><X size={21} /></button>
          </div>
        </header>

        <form className="study-session-form" onSubmit={handleSubmit}>
          <fieldset className="study-fieldset study-subject-fieldset">
            <legend>Subject</legend>
            <label className="study-subject-select study-subject-select-sheet"><span className="sr-only">Choose a subject</span><select value={form.subjectId} onChange={(event) => updateForm('subjectId', event.target.value)}>{activeSubjects.map((subject) => <option key={subject.id} value={subject.id}>{getSubjectDisplayName(subject)}</option>)}</select></label>
            <div className="study-subject-options">
              {activeSubjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  data-active={form.subjectId === subject.id}
                  style={{ '--study-subject': subject.color }}
                  onClick={() => updateForm('subjectId', subject.id)}
                >
                  {getSubjectDisplayName(subject)}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="study-fieldset study-duration-fieldset">
            <legend>Duration</legend>
            <div className="study-duration-value-row">
              <button type="button" className="duration-stepper" onClick={() => adjustDuration(-5)} aria-label="Decrease duration by 5 minutes"><Minus size={21} /></button>
              <label className="study-duration-value">
                <span className="sr-only">Custom duration in minutes</span>
                <input type="number" min="5" max="1440" step="5" value={form.durationMinutes} onChange={(event) => setDuration(event.target.value)} />
                <small>min</small>
              </label>
              <button type="button" className="duration-stepper" onClick={() => adjustDuration(5)} aria-label="Increase duration by 5 minutes"><Plus size={21} /></button>
            </div>
            <div className="study-duration-slider-wrap">
              <input className="study-duration-slider" type="range" min="5" max="120" step="5" value={Math.min(Number(form.durationMinutes), 120)} onChange={(event) => setDuration(event.target.value)} aria-label="Study duration" aria-valuetext={`${form.durationMinutes} minutes`} style={{ '--duration-progress': `${(Math.min(Number(form.durationMinutes), 120) / 120) * 100}%` }} />
              <div className="study-duration-ruler" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
              <div className="study-duration-ruler-labels" aria-hidden="true"><span>5</span><span>30</span><span>60</span><span>90</span><span>120 min</span></div>
            </div>
            <div className="study-duration-presets" aria-label="Quick durations">
              {STUDY_DURATION_PRESETS.map((minutes) => (
                <button key={minutes} type="button" data-active={Number(form.durationMinutes) === minutes} onClick={() => setDuration(minutes)}>{minutes}</button>
              ))}
            </div>
          </fieldset>

          <div className="study-form-pair">
            <fieldset className="study-fieldset study-mode-fieldset">
              <legend>Type</legend>
              <div className="study-mode-options">
                <button type="button" data-active={form.learningMode === 'new'} onClick={() => updateForm('learningMode', 'new')}>New topic</button>
                <button type="button" data-active={form.learningMode === 'revision'} onClick={() => updateForm('learningMode', 'revision')}>Revision</button>
              </div>
            </fieldset>
            <label className="study-compact-field">
              <span>Activity</span>
              <select value={form.activityType} onChange={(event) => changeActivity(event.target.value)}>
                {STUDY_ACTIVITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>

          <label className="study-topic-field">
            <span>Topic</span>
            <input ref={topicRef} type="text" maxLength="160" value={form.topic} onChange={(event) => updateForm('topic', event.target.value)} placeholder="e.g. Heart failure" required />
          </label>

          <fieldset className="study-fieldset study-confidence-fieldset">
            <legend>Confidence <em>Required</em></legend>
            <div className="confidence-scale">
              {STUDY_CONFIDENCE.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  data-active={Number(form.confidence) === item.value}
                  onClick={() => updateForm('confidence', item.value)}
                  aria-label={`${item.value}: ${item.label}`}
                  aria-pressed={Number(form.confidence) === item.value}
                >
                  {item.value}
                </button>
              ))}
            </div>
            <div className="confidence-copy"><span>Needs review</span><strong>Confidence {form.confidence} · {confidenceLabel}</strong><span>Confident</span></div>
          </fieldset>

          <button type="button" className="study-details-disclosure" onClick={() => setDetailsOpen(true)}>
            <span className="study-details-plus"><Plus size={19} /></span>
            <span><strong>Add details</strong><small>Source, amount &amp; notes</small></span>
            <ChevronRight size={19} />
          </button>

          <div className="study-sheet-footer">
            <span className="form-error" role="alert">{error}</span>
            <button className="primary-button study-save-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save session'}</button>
          </div>
        </form>

        {detailsOpen && (
          <div className="study-details-layer" role="presentation" onMouseDown={() => setDetailsOpen(false)}>
            <section className="study-details-sheet" role="dialog" aria-modal="true" aria-labelledby="study-details-title" onMouseDown={(event) => event.stopPropagation()}>
              <span className="study-sheet-grabber" aria-hidden="true" />
              <header className="study-sheet-heading">
                <div><span className="study-ledger-eyebrow">Optional</span><h2 id="study-details-title">Session details</h2></div>
                <button type="button" className="study-sheet-close" onClick={() => setDetailsOpen(false)} aria-label="Close optional details"><X size={20} /></button>
              </header>
              <div className="study-details-form">
                <label className="study-topic-field">
                  <span>Source</span>
                  <select value={form.source} onChange={(event) => updateForm('source', event.target.value)}>
                    <option value="">Not specified</option>
                    {sources.map((source) => <option key={source} value={source}>{source}</option>)}
                  </select>
                </label>
                <div className="study-amount-fields">
                  <label className="study-topic-field"><span>Amount completed</span><input type="number" min="0" step="1" value={form.amountValue ?? ''} onChange={(event) => updateForm('amountValue', event.target.value)} placeholder="e.g. 2" /></label>
                  <label className="study-topic-field"><span>Unit</span><select value={form.amountUnit} onChange={(event) => updateForm('amountUnit', event.target.value)}>{activity.units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></label>
                </div>
                <label className="study-topic-field"><span>Notes</span><textarea maxLength="1000" value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} placeholder="What did you learn?" /></label>
                <button type="button" className="primary-button study-save-button" onClick={() => setDetailsOpen(false)}>Save details</button>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  , document.body);
}
