export const DEFAULT_TODAY_CARD_ORDER = ['habits', 'study', 'time', 'todos'];
export const DEFAULT_INSIGHTS_CARD_ORDER = ['salah', 'effort', 'study', 'time', 'weekly'];

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

  return normalized;
};
