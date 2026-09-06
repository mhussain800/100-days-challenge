export const DEFAULT_TODAY_CARD_ORDER = ['habits', 'study', 'time', 'todos'];
export const DEFAULT_INSIGHTS_CARD_ORDER = ['salah', 'study', 'time', 'weekly'];

export const normalizeCardOrder = (order, defaults) => {
  const valid = new Set(defaults);
  const supplied = Array.isArray(order) ? order.filter((item) => valid.has(item)) : [];
  return [...new Set([...supplied, ...defaults])];
};
