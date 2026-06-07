export const getToday = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const getDaysArray = (startDate, numDays) => {
  const days = [];
  const start = new Date(startDate);
  for (let i = 0; i < numDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};