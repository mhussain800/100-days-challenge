const pad = (value) => String(value).padStart(2, '0');

export const toDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
};

export const getToday = () => toDateKey(new Date());

export const getDaysArray = (startDate, numDays) => {
  const days = [];
  const start = parseDateKey(startDate);
  for (let i = 0; i < numDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(toDateKey(d));
  }
  return days;
};
