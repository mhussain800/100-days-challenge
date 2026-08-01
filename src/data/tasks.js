export const PRAYER_OPTS = ['Masjid with Jamat', 'Ghar', 'Masjid w/o Jamat', 'Qaza'];

export const TASK_TYPE_OPTIONS = [
  { value: 'bool', label: 'Simple check-off' },
  { value: 'bool_num', label: 'Number + check-off' },
  { value: 'bool_text', label: 'Note + check-off' },
  { value: 'bool_time', label: 'Time + check-off' },
  { value: 'bool_select', label: 'Choice + check-off' },
];

export const DEFAULT_SECTIONS = ['Spiritual', 'Routine', 'Health', 'Discipline', 'Character', 'Social', 'Screen Time'];

// These three habits were intentionally retired from the built-in catalogue.
// Keeping their IDs here also removes them from any older saved preference document.
export const RETIRED_TASK_IDS = new Set(['no_m', 'no_p', 'no_s']);

export const DEFAULT_TASKS = [
  // Spiritual
  { id: 'fajar', label: 'Fajar', category: 'Spiritual', type: 'bool_select', options: PRAYER_OPTS },
  { id: 'zuhar', label: 'Zuhar', category: 'Spiritual', type: 'bool_select', options: PRAYER_OPTS },
  { id: 'asar', label: 'Asar', category: 'Spiritual', type: 'bool_select', options: PRAYER_OPTS },
  { id: 'maghrib', label: 'Maghrib', category: 'Spiritual', type: 'bool_select', options: PRAYER_OPTS },
  { id: 'isha', label: 'Isha', category: 'Spiritual', type: 'bool_select', options: PRAYER_OPTS },
  { id: 'quran', label: 'Recite Quran', category: 'Spiritual', type: 'bool_num', placeholder: 'pages' },
  { id: 'tafseer', label: 'Tafseer', category: 'Spiritual', type: 'bool_text', placeholder: 'details...' },
  { id: 'dhikr', label: 'Dhikr', category: 'Spiritual', type: 'bool' },
  // Sleep / Morning
  { id: 'wake', label: 'Wake up early [4:30 am]', category: 'Routine', type: 'bool_time', placeholder: 'Woke up:' },
  { id: 'sleep', label: 'Sleep Early [10 pm]', category: 'Routine', type: 'bool_time_slept' },
  { id: 'sleep_hrs', label: 'Sleep Duration', category: 'Routine', type: 'bool_num', placeholder: 'hrs' },
  { id: 'bed', label: 'Make Bed', category: 'Routine', type: 'bool' },
  // Fitness / Health
  { id: 'walk', label: 'Walk/Running', category: 'Health', type: 'bool_num', placeholder: 'mins' },
  { id: 'gym', label: 'Gym/Workout', category: 'Health', type: 'bool' },
  { id: 'protein', label: 'Protein Target', category: 'Health', type: 'bool_text', placeholder: 'grams' },
  { id: 'calories', label: 'Calories Target', category: 'Health', type: 'bool_text', placeholder: 'kcal' },
  { id: 'sunbath', label: 'Sunbath', category: 'Health', type: 'bool_num', placeholder: 'mins' },
  { id: 'skincare', label: 'Skin care routine', category: 'Health', type: 'bool' },
  { id: 'brush', label: 'Dental Hygiene', category: 'Health', type: 'bool_num', placeholder: 'times' },
  // Productivity / Discipline
  { id: 'study', label: 'Study', category: 'Discipline', type: 'bool_num', placeholder: 'hrs' },
  { id: 'book', label: 'Read a book', category: 'Discipline', type: 'bool_num', placeholder: 'pgs' },
  { id: 'college', label: 'College on Time', category: 'Discipline', type: 'bool_time' },
  { id: 'plan', label: 'Plan the next day', category: 'Discipline', type: 'bool_text' },
  { id: 'waste', label: "Don't waste time", category: 'Discipline', type: 'bool_text' },
  { id: 'urdu_task', label: 'آج کا کام کل پر مت چھوڑو (No Procrastination)', category: 'Discipline', type: 'bool' },
  // Character
  { id: 'junk', label: 'No Junk Food', category: 'Character', type: 'bool_text', placeholder: 'What did you eat, and what triggered it?', detailWhen: 'incomplete' },
  { id: 'cold_drink', label: 'No Cold Drink', category: 'Character', type: 'bool' },
  { id: 'gaze', label: 'Gaze Control', category: 'Character', type: 'bool' },
  { id: 'tongue', label: 'Tongue Control', category: 'Character', type: 'bool' },
  // Social / Other
  { id: 'parents', label: 'Serve Parents', category: 'Social', type: 'bool_text' },
  { id: 'charity', label: 'Charity', category: 'Social', type: 'bool_num', placeholder: 'amount' },
  { id: 'expense', label: 'Record Total Expense', category: 'Social', type: 'bool_num', placeholder: 'PKR' },
  // Screen Time & Habits
  { id: 'media_songs', label: 'No Songs', category: 'Screen Time', type: 'bool_select', options: ['accidentally', 'purposefully'], detailWhen: 'incomplete' },
  { id: 'media_movies', label: 'No Movies/Seasons/Animes', category: 'Screen Time', type: 'bool_select', options: ['doomscroll', 'purposefully', 'bored'], detailWhen: 'incomplete' },
  { id: 'media_yt', label: 'No YouTube', category: 'Screen Time', type: 'bool_select', options: ['doomscroll', 'purposefully'], detailWhen: 'incomplete' },
  { id: 'media_insta', label: 'No Instagram', category: 'Screen Time', type: 'bool_select', options: ['doomscroll', 'purposefully'], detailWhen: 'incomplete' },
  { id: 'media_fb', label: 'No Facebook', category: 'Screen Time', type: 'bool_select', options: ['doomscroll', 'purposefully'], detailWhen: 'incomplete' },
];

export const TIME_CATEGORIES = [
  { id: 'sleep', label: 'Sleep', color: 'var(--time-sleep)' },
  { id: 'worship', label: 'Religion & Prayer', color: 'var(--time-worship)' },
  { id: 'work', label: 'Work', color: 'var(--time-work)' },
  { id: 'study', label: 'Study', color: 'var(--time-study)' },
  { id: 'exercise', label: 'Exercise/Gym', color: 'var(--time-exercise)' },
  { id: 'social_media', label: 'Social Media/Screen Time', color: 'var(--time-screen)' },
  { id: 'social', label: 'Social', color: 'var(--time-social)' },
  { id: 'family', label: 'Family', color: 'var(--time-family)' },
  { id: 'friends', label: 'Friends', color: 'var(--time-friends)' },
  { id: 'read', label: 'Read', color: 'var(--time-read)' },
  { id: 'bored', label: 'Bored/Doing Nothing', color: 'var(--time-bored)' },
  { id: 'chores', label: 'Chores', color: 'var(--time-chores)' },
  { id: 'waste', label: 'Waste of Time & Life', color: 'var(--time-waste)' },
];

export const normalizeTasks = (tasks) => {
  if (!Array.isArray(tasks)) return DEFAULT_TASKS;

  const seen = new Set();
  const defaultsById = new Map(DEFAULT_TASKS.map((task) => [task.id, task]));
  return tasks.filter((task) => {
    const valid = task && typeof task.id === 'string' && typeof task.label === 'string' &&
      typeof task.category === 'string' && typeof task.type === 'string';
    if (!valid || RETIRED_TASK_IDS.has(task.id) || seen.has(task.id)) return false;
    seen.add(task.id);
    return true;
  }).map((task) => task.custom || !defaultsById.has(task.id)
    ? task
    : { ...task, ...defaultsById.get(task.id) });
};

export const normalizeSections = (sections, tasks) => {
  const source = Array.isArray(sections) ? sections : tasks.map((task) => task.category);
  const normalized = [];

  [...source, ...tasks.map((task) => task.category)].forEach((section) => {
    if (typeof section !== 'string' || !section.trim()) return;
    const cleanSection = section.trim();
    if (!normalized.some((item) => item.toLocaleLowerCase() === cleanSection.toLocaleLowerCase())) {
      normalized.push(cleanSection);
    }
  });

  return normalized;
};

export const makeCustomTask = ({ label, category, type, placeholder, options, detailWhen = 'complete' }) => {
  const randomPart = globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const task = {
    id: `custom_${randomPart}`,
    label: label.trim(),
    category: category.trim() || 'Personal',
    type,
    custom: true,
  };

  if (placeholder?.trim()) task.placeholder = placeholder.trim();
  if (type === 'bool_select') task.options = options.map((option) => option.trim()).filter(Boolean);
  if (type !== 'bool' && detailWhen === 'incomplete') task.detailWhen = 'incomplete';
  return task;
};
