export const DEFAULT_STUDY_SUBJECTS = [
  { id: 'medicine', name: 'Medicine', shortName: 'Medicine', color: '#0a84ff', order: 0, archived: false, isDefault: true },
  { id: 'pediatrics', name: 'Pediatrics', shortName: 'Pediatrics', color: '#af52de', order: 1, archived: false, isDefault: true },
  { id: 'surgery', name: 'Surgery', shortName: 'Surgery', color: '#ff9f0a', order: 2, archived: false, isDefault: true },
  { id: 'gyneobs', name: 'Gynecology & Obstetrics', shortName: 'Gyne/Obs', color: '#ff375f', order: 3, archived: false, isDefault: true },
];

export const DEFAULT_STUDY_SOURCES = [
  'Sketchy',
  'Picmonic',
  'Boards & Beyond',
  'Bootcamp',
  'College lecture',
];

export const STUDY_ACTIVITY_OPTIONS = [
  { value: 'lecture', label: 'Lecture / video', units: ['videos', 'lessons', 'minutes'] },
  { value: 'questions', label: 'Questions / QBank', units: ['questions', 'blocks'] },
  { value: 'reading', label: 'Reading', units: ['pages', 'chapters'] },
  { value: 'notes', label: 'Notes', units: ['pages', 'topics'] },
  { value: 'flashcards', label: 'Flashcards / Anki', units: ['cards', 'decks'] },
  { value: 'clinical', label: 'Clinical / practical', units: ['cases', 'stations', 'hours'] },
  { value: 'other', label: 'Other', units: ['items'] },
];

export const STUDY_CONFIDENCE = [
  { value: 1, label: 'Needs review' },
  { value: 2, label: 'Unclear' },
  { value: 3, label: 'Fairly clear' },
  { value: 4, label: 'Mostly confident' },
  { value: 5, label: 'Confident' },
];

export const STUDY_DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

const safeText = (value, maxLength = 120) => typeof value === 'string'
  ? value.trim().slice(0, maxLength)
  : '';

export const normalizeStudySubjects = (subjects) => {
  if (!Array.isArray(subjects)) return DEFAULT_STUDY_SUBJECTS.map((subject) => ({ ...subject }));

  const seen = new Set();
  return subjects.reduce((normalized, subject, index) => {
    const id = safeText(subject?.id, 80);
    const name = safeText(subject?.name, 60);
    if (!id || !name || seen.has(id)) return normalized;
    seen.add(id);
    normalized.push({
      id,
      name,
      shortName: safeText(subject.shortName, 24) || name,
      color: /^#[0-9a-f]{6}$/i.test(subject.color || '') ? subject.color : '#0a84ff',
      order: Number.isFinite(subject.order) ? subject.order : index,
      archived: !!subject.archived,
      isDefault: !!subject.isDefault || DEFAULT_STUDY_SUBJECTS.some((item) => item.id === id),
    });
    return normalized;
  }, []).sort((first, second) => first.order - second.order);
};

export const normalizeStudySources = (sources) => {
  if (!Array.isArray(sources)) return [...DEFAULT_STUDY_SOURCES];
  const normalized = [];
  sources.forEach((source) => {
    const cleanSource = safeText(source, 60);
    if (cleanSource && !normalized.some((item) => item.toLocaleLowerCase() === cleanSource.toLocaleLowerCase())) {
      normalized.push(cleanSource);
    }
  });
  return normalized;
};

export const normalizeStudyGoals = (goals) => {
  if (!goals || typeof goals !== 'object' || Array.isArray(goals)) return {};
  return Object.fromEntries(Object.entries(goals).flatMap(([subjectId, minutes]) => {
    const safeMinutes = Number(minutes);
    return Number.isFinite(safeMinutes) && safeMinutes >= 0
      ? [[subjectId, Math.min(Math.round(safeMinutes), 10080)]]
      : [];
  }));
};

export const makeStudySubject = (name, order) => {
  const randomPart = globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id: `subject_${randomPart}`,
    name: safeText(name, 60),
    shortName: safeText(name, 24),
    color: '#5e5ce6',
    order,
    archived: false,
    isDefault: false,
  };
};

export const sanitizeStudySession = (session) => {
  const durationMinutes = Math.min(1440, Math.max(5, Math.round(Number(session.durationMinutes) || 0)));
  const confidence = Math.min(5, Math.max(1, Math.round(Number(session.confidence) || 0)));
  const allowedActivities = new Set(STUDY_ACTIVITY_OPTIONS.map((item) => item.value));

  return {
    subjectId: safeText(session.subjectId, 80),
    dateKey: safeText(session.dateKey, 10),
    durationMinutes,
    learningMode: session.learningMode === 'revision' ? 'revision' : 'new',
    activityType: allowedActivities.has(session.activityType) ? session.activityType : 'lecture',
    topic: safeText(session.topic, 160),
    confidence,
    source: safeText(session.source, 60),
    amountValue: session.amountValue === '' || session.amountValue == null
      ? null
      : Math.min(100000, Math.max(0, Number(session.amountValue) || 0)),
    amountUnit: safeText(session.amountUnit, 30),
    notes: safeText(session.notes, 1000),
  };
};

export const formatStudyDuration = (minutes, compact = false) => {
  const safeMinutes = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  if (!hours) return `${remainingMinutes} min`;
  if (!remainingMinutes) return `${hours} hr${hours === 1 || compact ? '' : 's'}`;
  return `${hours} hr ${remainingMinutes} min`;
};

export const getStudyActivity = (value) => STUDY_ACTIVITY_OPTIONS.find((item) => item.value === value)
  || STUDY_ACTIVITY_OPTIONS[0];

export const getSubjectDisplayName = (subject) => subject?.shortName || subject?.name || 'Subject';
