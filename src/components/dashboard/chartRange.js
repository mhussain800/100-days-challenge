import { useMemo, useState } from 'react';
import { parseDateKey, toDateKey } from '../../utils/helpers';

const shiftDateKey = (dateKey, amount) => {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
};

const startOfMonth = (dateKey) => {
  const date = parseDateKey(dateKey);
  date.setDate(1);
  return toDateKey(date);
};

const startOfYear = (dateKey) => {
  const date = parseDateKey(dateKey);
  date.setMonth(0, 1);
  return toDateKey(date);
};

const getSelectedRange = (range, today, customStart, customEnd) => {
  if (range === '100') return { start: shiftDateKey(today, -99), end: today, label: 'Last 100 days' };
  if (range === 'month') return { start: startOfMonth(today), end: today, label: 'This month' };
  if (range === 'year') return { start: startOfYear(today), end: today, label: 'This year' };
  return {
    start: customStart <= customEnd ? customStart : customEnd,
    end: customStart <= customEnd ? customEnd : customStart,
    label: 'Custom range',
  };
};

const datesInRange = (start, end) => {
  const dates = [];
  const cursor = parseDateKey(start);
  const final = parseDateKey(end);
  while (cursor <= final && dates.length < 366) {
    dates.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

export const formatRangeDate = (dateKey, range) => {
  const date = parseDateKey(dateKey);
  if (range === 'year') return date.toLocaleDateString('en-US', { month: 'short' });
  if (range === 'month') return date.toLocaleDateString('en-US', { day: 'numeric' });
  if (range === 'custom') return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
};

export const formatTooltipDate = (dateKey) => parseDateKey(dateKey).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function useChartRange(today) {
  const [range, setRange] = useState('100');
  const [customStart, setCustomStart] = useState(shiftDateKey(today, -99));
  const [customEnd, setCustomEnd] = useState(today);
  const selectedRange = useMemo(() => getSelectedRange(range, today, customStart, customEnd), [customEnd, customStart, range, today]);
  const dates = useMemo(() => datesInRange(selectedRange.start, selectedRange.end), [selectedRange.end, selectedRange.start]);

  return { range, setRange, customStart, setCustomStart, customEnd, setCustomEnd, selectedRange, dates };
}
