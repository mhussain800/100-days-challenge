export const DEFAULT_TODAY_CARD_ORDER = ['effort', 'habits', 'quote', 'study', 'time', 'todos'];
export const DEFAULT_INSIGHTS_CARD_ORDER = ['hero', 'summary', 'salah', 'effort', 'study', 'studyGoals', 'time', 'weekly', 'quotes'];
export const TODAY_QUOTE_CARD_ID = '__today_quote__';

export const getDefaultTodayHabitCardOrder = (sections) => {
  return [...sections];
};

export const normalizeTodayHabitCardOrder = (order, sections) => {
  const sectionLookup = new Map(sections.map((section) => [section.toLocaleLowerCase(), section]));
  const supplied = Array.isArray(order)
    ? order.map((item) => {
      if (item === TODAY_QUOTE_CARD_ID) return null;
      return typeof item === 'string' ? sectionLookup.get(item.toLocaleLowerCase()) : null;
    }).filter(Boolean)
    : [];
  return [...new Set([...supplied, ...getDefaultTodayHabitCardOrder(sections)])];
};

export const normalizeCardOrder = (order, defaults) => {
  const valid = new Set(defaults);
  const supplied = Array.isArray(order) ? order.filter((item) => valid.has(item)) : [];
  const normalized = [...new Set([...supplied, ...defaults])];

  // Existing saved layouts predate Daily effort. Add it beside Salah for a
  // sensible migration, while preserving intentional future reordering.
  if (defaults.includes('effort') && defaults.includes('salah') && !supplied.includes('effort')) {
    const effortIndex = normalized.indexOf('effort');
    normalized.splice(effortIndex, 1);
    normalized.splice(normalized.indexOf('salah') + 1, 0, 'effort');
  }

  if (defaults.includes('studyGoals') && defaults.includes('study') && !supplied.includes('studyGoals')) {
    const goalsIndex = normalized.indexOf('studyGoals');
    normalized.splice(goalsIndex, 1);
    normalized.splice(normalized.indexOf('study') + 1, 0, 'studyGoals');
  }

  if (defaults.includes('quote') && defaults.includes('habits') && !supplied.includes('quote')) {
    const quoteIndex = normalized.indexOf('quote');
    normalized.splice(quoteIndex, 1);
    normalized.splice(normalized.indexOf('habits') + 1, 0, 'quote');
  }

  return normalized;
};
