export const PRAYER_OPTS = ["Masjid with Jamat", "Ghar", "Masjid w/o Jamat", "Qaza"];

export const TASKS = [
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
  { id: 'wake', label: 'Wake up early [4:30 am]', category: 'Routine', type: 'bool_time_woke up' },
  { id: 'sleep', label: 'Sleep Early [10 pm]', category: 'Routine', type: 'bool_time_slept' },
  { id: 'sleep_hrs', label: 'Sleep Durtion', category: 'Routine', type: 'bool_num', placeholder: 'hrs' },
  { id: 'bed', label: 'Make Bed', category: 'Routine', type: 'bool' },
  // Fitness / Health
  { id: 'walk', label: 'Walk/Running', category: 'Health', type: 'bool_num', placeholder: 'mins' },
  { id: 'gym', label: 'Gym', category: 'Health', type: 'bool' },
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
  { id: 'waste', label: 'Don\'t waste time', category: 'Discipline', type: 'bool_text' },
  // Character / Vices
  { id: 'no_s', label: 'No Smoking', category: 'Character', type: 'bool' },
  { id: 'no_m', label: 'No Masturbation', category: 'Character', type: 'bool' },
  { id: 'no_p', label: 'No Porn', category: 'Character', type: 'bool' },
  { id: 'gaze', label: 'Gaze Control', category: 'Character', type: 'bool' },
  { id: 'tongue', label: 'Tongue Control', category: 'Character', type: 'bool' },
  { id: 'junk', label: 'No Junk Food', category: 'Character', type: 'bool_text', placeholder: 'what?' },
  { id: 'cold_drink', label: 'No Cold Drink', category: 'Character', type: 'bool' },
  { id: 'social', label: 'Social Media', category: 'Character', type: 'bool_num', placeholder: 'hrs' },
  // Social / Other
  { id: 'parents', label: 'Serve Parents', category: 'Social', type: 'bool_text' },
  { id: 'charity', label: 'Charity', category: 'Social', type: 'bool_num', placeholder: 'amount' },
  { id: 'expense', label: 'Record Total Expense', category: 'Social', type: 'bool_num', placeholder: 'PKR' }
];