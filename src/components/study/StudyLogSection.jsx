import { useMemo, useState } from 'react';
import { BookOpenCheck, Brain, Clock3, Pencil, Plus, Trash2, X } from 'lucide-react';
import StudySessionSheet from './StudySessionSheet';
import {
  STUDY_CONFIDENCE,
  formatStudyDuration,
  getStudyActivity,
  getSubjectDisplayName,
} from '../../data/study';

export default function StudyLogSection({
  dateKey,
  theme,
  subjects,
  sources,
  sessions,
  onSaveSession,
  onDeleteSession,
  onAddSubject,
}) {
  const [sheetState, setSheetState] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects.find((subject) => !subject.archived)?.id || '');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [subjectAddOpen, setSubjectAddOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [subjectAddError, setSubjectAddError] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);
  const activeSubjects = subjects.filter((subject) => !subject.archived);
  const chosenSubjectId = activeSubjects.some((subject) => subject.id === selectedSubjectId)
    ? selectedSubjectId
    : activeSubjects[0]?.id || '';
  const subjectById = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject])), [subjects]);
  const totalMinutes = sessions.reduce((total, session) => total + Number(session.durationMinutes || 0), 0);
  const subjectTotals = useMemo(() => sessions.reduce((totals, session) => {
    totals[session.subjectId] = (totals[session.subjectId] || 0) + Number(session.durationMinutes || 0);
    return totals;
  }, {}), [sessions]);

  const openNewSession = (subjectId = activeSubjects[0]?.id) => setSheetState({ subjectId, session: null });
  const openEditSession = (session) => setSheetState({ subjectId: session.subjectId, session });

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await onDeleteSession(pendingDelete);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };
  const addSubject = async (event) => {
    event.preventDefault();
    if (!newSubjectName.trim()) {
      setSubjectAddError('Give the subject a name.');
      return;
    }
    setAddingSubject(true);
    setSubjectAddError('');
    try {
      const saved = await onAddSubject(newSubjectName);
      if (saved === false) throw new Error('The subject was not saved.');
      setNewSubjectName('');
      setSubjectAddOpen(false);
    } catch (addError) {
      setSubjectAddError(addError.message || 'Could not add that subject.');
    } finally {
      setAddingSubject(false);
    }
  };

  return (
    <section className="study-log-card" aria-labelledby="study-log-title">
      <header className="study-log-header">
        <div className="study-log-title-wrap">
          <span className="study-log-icon"><BookOpenCheck size={20} /></span>
          <div><span className="eyebrow">Daily learning</span><h2 id="study-log-title">Study log</h2><p>Capture focused sessions, not just a checked box.</p></div>
        </div>
        <div className="study-day-total"><strong>{formatStudyDuration(totalMinutes)}</strong><span>today</span></div>
        <div className="study-log-actions">
          <label className="study-subject-select"><span className="sr-only">Subject to log</span><select value={chosenSubjectId} onChange={(event) => setSelectedSubjectId(event.target.value)} disabled={!activeSubjects.length}>{activeSubjects.map((subject) => <option key={subject.id} value={subject.id}>{getSubjectDisplayName(subject)}</option>)}</select></label>
          <button className="study-add-subject" type="button" onClick={() => { setSubjectAddOpen((open) => !open); setSubjectAddError(''); }} aria-label="Add a study subject" title="Add a subject"><Plus size={17} /></button>
          <button className="primary-button study-log-primary" onClick={() => openNewSession(chosenSubjectId)} disabled={!activeSubjects.length}><Plus size={17} /> Log study session</button>
        </div>
      </header>

      {subjectAddOpen && (
        <form className="study-inline-subject-add" onSubmit={addSubject}>
          <label><span className="sr-only">New subject name</span><input autoFocus value={newSubjectName} maxLength="60" onChange={(event) => setNewSubjectName(event.target.value)} placeholder="New subject, e.g. Pathology" /></label>
          <button className="secondary-button" type="submit" disabled={addingSubject}>{addingSubject ? 'Adding…' : 'Add subject'}</button>
          <button className="icon-button" type="button" onClick={() => setSubjectAddOpen(false)} aria-label="Close add subject"><X size={17} /></button>
          {subjectAddError && <span className="form-error" role="alert">{subjectAddError}</span>}
        </form>
      )}

      {activeSubjects.length ? (
        <div className="study-subject-quick-grid" aria-label="Log a subject">
          {activeSubjects.map((subject) => (
            <button key={subject.id} style={{ '--study-subject': subject.color }} onClick={() => openNewSession(subject.id)}>
              <span className="study-subject-swatch" />
              <span><strong>{getSubjectDisplayName(subject)}</strong><small>{subjectTotals[subject.id] ? formatStudyDuration(subjectTotals[subject.id], true) : 'Tap to log'}</small></span>
              <Plus size={16} />
            </button>
          ))}
        </div>
      ) : (
        <div className="study-inline-empty">All study subjects are archived. Restore one in Settings to log a session.</div>
      )}

      {sessions.length ? (
        <div className="study-session-list">
          <div className="study-session-list-heading"><strong>Sessions</strong><span>{sessions.length} logged</span></div>
          {sessions.map((session) => {
            const subject = subjectById.get(session.subjectId);
            const confidence = STUDY_CONFIDENCE.find((item) => item.value === Number(session.confidence));
            const activity = getStudyActivity(session.activityType);
            const details = [session.source, session.amountValue != null ? `${session.amountValue} ${session.amountUnit}` : '', session.notes ? 'Note added' : ''].filter(Boolean);
            return (
              <article className="study-session-row" key={session.id} style={{ '--study-subject': subject?.color || 'var(--accent)' }}>
                <span className="study-session-marker" />
                <div className="study-session-main">
                  <div className="study-session-topline"><strong>{session.topic}</strong><span>{formatStudyDuration(session.durationMinutes)}</span></div>
                  <p>{subject?.name || 'Archived subject'} · {activity.label} · {session.learningMode === 'revision' ? 'Revision' : 'New topic'}</p>
                  <div className="study-session-meta">
                    <span><Brain size={13} /> {confidence?.label || `Confidence ${session.confidence}`}</span>
                    {details.length > 0 && <span>{details.join(' · ')}</span>}
                  </div>
                </div>
                <div className="study-session-actions">
                  <button onClick={() => openEditSession(session)} aria-label={`Edit ${session.topic}`}><Pencil size={16} /></button>
                  <button className="danger-text" onClick={() => setPendingDelete(session)} aria-label={`Delete ${session.topic}`}><Trash2 size={16} /></button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="study-empty-day">
          <Clock3 size={20} />
          <span><strong>No study sessions yet</strong><small>Choose a subject above when you finish studying.</small></span>
        </div>
      )}

      {sheetState && (
        <StudySessionSheet
          dateKey={dateKey}
          theme={theme}
          subjects={subjects}
          sources={sources}
          initialSubjectId={sheetState.subjectId}
          session={sheetState.session}
          onClose={() => setSheetState(null)}
          onSave={onSaveSession}
        />
      )}

      {pendingDelete && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setPendingDelete(null)}>
          <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-study-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="dialog-close" onClick={() => setPendingDelete(null)} aria-label="Close"><X size={18} /></button>
            <span className="danger-orb"><Trash2 size={21} /></span>
            <h2 id="delete-study-title">Delete this session?</h2>
            <p>“{pendingDelete.topic}” and its study time will be removed from your Insights. This cannot be undone.</p>
            <div className="dialog-actions"><button className="secondary-button" onClick={() => setPendingDelete(null)}>Cancel</button><button className="danger-button" onClick={confirmDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</button></div>
          </div>
        </div>
      )}
    </section>
  );
}
