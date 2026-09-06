import { useState } from 'react';
import { Archive, ArchiveRestore, ArrowDown, ArrowUp, BookOpenCheck, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import {
  DEFAULT_STUDY_SUBJECTS,
  makeStudySubject,
  normalizeStudyGoals,
  normalizeStudySources,
  normalizeStudySubjects,
} from '../../data/study';

export default function StudySettings({ subjects, sources, weeklyGoals, onSave }) {
  const [draftSubjects, setDraftSubjects] = useState(subjects);
  const [draftSources, setDraftSources] = useState(sources);
  const [draftGoals, setDraftGoals] = useState(weeklyGoals);
  const [newSubject, setNewSubject] = useState('');
  const [newSource, setNewSource] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateSubject = (subjectId, patch) => setDraftSubjects((current) => current.map((subject) => {
    if (subject.id !== subjectId) return subject;
    const nextSubject = { ...subject, ...patch };
    if (patch.name !== undefined) nextSubject.shortName = patch.name.trim().slice(0, 24) || subject.shortName;
    return nextSubject;
  }));

  const moveSubject = (subjectId, amount) => setDraftSubjects((current) => {
    const ordered = [...current].sort((first, second) => first.order - second.order);
    const index = ordered.findIndex((subject) => subject.id === subjectId);
    const target = index + amount;
    if (index < 0 || target < 0 || target >= ordered.length) return current;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    return ordered.map((subject, order) => ({ ...subject, order }));
  });

  const addSubject = async () => {
    const cleanName = newSubject.trim();
    if (!cleanName) return;
    if (draftSubjects.some((subject) => subject.name.toLocaleLowerCase() === cleanName.toLocaleLowerCase())) {
      setError('That subject already exists.');
      return;
    }
    const nextSubjects = [...draftSubjects, makeStudySubject(cleanName, draftSubjects.length)];
    setDraftSubjects(nextSubjects);
    setNewSubject('');
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      const saveSucceeded = await onSave({
        subjects: normalizeStudySubjects(nextSubjects),
        sources: normalizeStudySources(draftSources),
        weeklyGoals: normalizeStudyGoals(draftGoals),
      });
      if (saveSucceeded === false) throw new Error('New subject was not saved.');
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (saveError) {
      console.error('New study subject save error:', saveError);
      setError('Could not save the new subject. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const restoreDefaults = () => setDraftSubjects((current) => {
    const existing = new Map(current.map((subject) => [subject.id, subject]));
    const restored = current.map((subject) => DEFAULT_STUDY_SUBJECTS.some((item) => item.id === subject.id)
      ? { ...subject, archived: false }
      : subject);
    DEFAULT_STUDY_SUBJECTS.forEach((subject) => {
      if (!existing.has(subject.id)) restored.push({ ...subject, order: restored.length });
    });
    return restored;
  });

  const updateSource = (index, value) => setDraftSources((current) => current.map((source, sourceIndex) => sourceIndex === index ? value : source));
  const removeSource = (index) => setDraftSources((current) => current.filter((_, sourceIndex) => sourceIndex !== index));
  const addSource = () => {
    const cleanSource = newSource.trim();
    if (!cleanSource) return;
    if (draftSources.some((source) => source.trim().toLocaleLowerCase() === cleanSource.toLocaleLowerCase())) {
      setError('That study source already exists.');
      return;
    }
    setDraftSources((current) => [...current, cleanSource]);
    setNewSource('');
    setError('');
  };

  const saveSettings = async () => {
    const invalidSubject = draftSubjects.find((subject) => !subject.name.trim());
    if (invalidSubject) {
      setError('Every subject needs a name.');
      return;
    }
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const saveSucceeded = await onSave({
        subjects: normalizeStudySubjects(draftSubjects),
        sources: normalizeStudySources(draftSources),
        weeklyGoals: normalizeStudyGoals(draftGoals),
      });
      if (saveSucceeded === false) throw new Error('Study settings were not saved.');
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (saveError) {
      console.error('Study preferences save error:', saveError);
      setError('Could not save study settings. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="settings-section study-settings-section">
      <div className="section-title-row study-settings-heading">
        <div className="section-icon"><BookOpenCheck size={20} /></div>
        <div><h2>Study subjects</h2><p>Rename, reorder, color, archive, and set optional weekly targets.</p></div>
        <button className="text-button" type="button" onClick={restoreDefaults}><RotateCcw size={15} /> Restore defaults</button>
      </div>

      <div className="study-settings-list">
        {[...draftSubjects].sort((first, second) => first.order - second.order).map((subject, index, ordered) => (
          <div className="study-settings-row" key={subject.id} data-archived={subject.archived}>
            <label className="study-color-control" title={`Color for ${subject.name}`}>
              <input type="color" value={subject.color} onChange={(event) => updateSubject(subject.id, { color: event.target.value })} aria-label={`Color for ${subject.name}`} />
              <span style={{ backgroundColor: subject.color }} />
            </label>
            <label className="study-setting-name"><span>Subject name</span><input value={subject.name} maxLength="60" onChange={(event) => updateSubject(subject.id, { name: event.target.value })} /></label>
            <label className="study-goal-input"><span>Weekly goal</span><span className="study-goal-control"><input type="number" min="0" max="168" step="0.5" value={draftGoals[subject.id] ? draftGoals[subject.id] / 60 : ''} onChange={(event) => setDraftGoals((current) => ({ ...current, [subject.id]: event.target.value === '' ? 0 : Number(event.target.value) * 60 }))} placeholder="—" /><small>hr</small></span></label>
            <div className="study-setting-actions">
              <button type="button" onClick={() => moveSubject(subject.id, -1)} disabled={index === 0} aria-label={`Move ${subject.name} up`}><ArrowUp size={16} /></button>
              <button type="button" onClick={() => moveSubject(subject.id, 1)} disabled={index === ordered.length - 1} aria-label={`Move ${subject.name} down`}><ArrowDown size={16} /></button>
              <button type="button" onClick={() => updateSubject(subject.id, { archived: !subject.archived })} aria-label={`${subject.archived ? 'Restore' : 'Archive'} ${subject.name}`} title={subject.archived ? 'Restore subject' : 'Archive subject'}>{subject.archived ? <ArchiveRestore size={17} /> : <Archive size={17} />}</button>
            </div>
          </div>
        ))}
      </div>

      <div className="study-settings-add-row">
        <label className="field"><span>Add another subject</span><input className="form-input" value={newSubject} onChange={(event) => setNewSubject(event.target.value)} placeholder="e.g. Pathology" onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSubject(); } }} /></label>
        <button className="secondary-button" type="button" onClick={addSubject} disabled={saving}><Plus size={16} /> Add subject</button>
      </div>

      <div className="study-source-settings">
        <div className="study-source-heading"><strong>Study sources</strong><span>Shown when adding optional session details.</span></div>
        <div className="study-source-list">
          {draftSources.map((source, index) => (
            <div className="study-source-row" key={index}><input value={source} maxLength="60" aria-label={`Study source ${index + 1}`} onChange={(event) => updateSource(index, event.target.value)} /><button type="button" onClick={() => removeSource(index)} aria-label={`Remove ${source || 'source'}`}><Trash2 size={15} /></button></div>
          ))}
        </div>
        <div className="study-source-add"><input className="form-input" value={newSource} onChange={(event) => setNewSource(event.target.value)} placeholder="Add a source, e.g. Osmosis" onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSource(); } }} /><button className="secondary-button" type="button" onClick={addSource}><Plus size={16} /> Add source</button></div>
      </div>

      <div className="study-settings-footer">
        <span className="form-error" role="alert">{error}</span>
        {saved && <span className="study-settings-saved">Study settings saved</span>}
        <button className="primary-button" type="button" onClick={saveSettings} disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save study settings'}</button>
      </div>
    </section>
  );
}
