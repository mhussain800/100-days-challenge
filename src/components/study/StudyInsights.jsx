import { useMemo, useState } from 'react';
import { BarChart3, BookOpenCheck, Brain, CalendarDays, Clock3, Flame, TrendingDown, TrendingUp } from 'lucide-react';
import { formatStudyDuration, getSubjectDisplayName } from '../../data/study';
import { parseDateKey, toDateKey } from '../../utils/helpers';

const startOfWeek = (dateKey) => {
  const date = parseDateKey(dateKey);
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  return toDateKey(date);
};

const startOfMonth = (dateKey) => {
  const date = parseDateKey(dateKey);
  date.setDate(1);
  return toDateKey(date);
};

const shiftDateKey = (dateKey, amount) => {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
};

const daysBetween = (start, end) => Math.max(1, Math.round((parseDateKey(end) - parseDateKey(start)) / 86400000) + 1);

const datesInRange = (start, end, limit = 400) => {
  const dates = [];
  const cursor = parseDateKey(start);
  const final = parseDateKey(end);
  while (cursor <= final && dates.length < limit) {
    dates.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

const getRange = (range, today, customStart, customEnd) => {
  if (range === 'week') return { start: startOfWeek(today), end: today, label: 'This week' };
  if (range === 'month') return { start: startOfMonth(today), end: today, label: 'This month' };
  if (range === 'custom') {
    const start = customStart <= customEnd ? customStart : customEnd;
    const end = customStart <= customEnd ? customEnd : customStart;
    return { start, end, label: 'Custom range' };
  }
  return { start: shiftDateKey(today, -29), end: today, label: 'Last 30 days' };
};

const getStudyStreak = (sessions, today) => {
  const studiedDates = new Set(sessions.map((session) => session.dateKey));
  let cursor = parseDateKey(today);
  if (!studiedDates.has(today)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (streak < 1000 && studiedDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export default function StudyInsights({ sessions, subjects, weeklyGoals, today }) {
  const [range, setRange] = useState('week');
  const [customStart, setCustomStart] = useState(shiftDateKey(today, -6));
  const [customEnd, setCustomEnd] = useState(today);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const subjectById = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject])), [subjects]);
  const selectedRange = getRange(range, today, customStart, customEnd);
  const rangeDays = daysBetween(selectedRange.start, selectedRange.end);
  const rangeSessions = sessions.filter((session) => session.dateKey >= selectedRange.start && session.dateKey <= selectedRange.end);
  const totalMinutes = rangeSessions.reduce((total, session) => total + Number(session.durationMinutes || 0), 0);
  const studiedDays = new Set(rangeSessions.map((session) => session.dateKey)).size;
  const averageMinutes = studiedDays ? Math.round(totalMinutes / studiedDays) : 0;
  const averageConfidence = rangeSessions.length
    ? rangeSessions.reduce((total, session) => total + Number(session.confidence || 0), 0) / rangeSessions.length
    : 0;
  const streak = getStudyStreak(sessions, today);

  const previousEnd = shiftDateKey(selectedRange.start, -1);
  const previousStart = shiftDateKey(previousEnd, -(rangeDays - 1));
  const previousMinutes = sessions
    .filter((session) => session.dateKey >= previousStart && session.dateKey <= previousEnd)
    .reduce((total, session) => total + Number(session.durationMinutes || 0), 0);
  const changePercent = previousMinutes ? Math.round(((totalMinutes - previousMinutes) / previousMinutes) * 100) : totalMinutes ? 100 : 0;

  const subjectTotals = subjects.map((subject) => {
    const minutes = rangeSessions.filter((session) => session.subjectId === subject.id).reduce((total, session) => total + Number(session.durationMinutes || 0), 0);
    const scaledGoal = Math.round((Number(weeklyGoals[subject.id]) || 0) * (rangeDays / 7));
    return { subject, minutes, scaledGoal };
  }).sort((first, second) => second.minutes - first.minutes);
  const maxSubjectMinutes = Math.max(...subjectTotals.map((item) => item.minutes), 1);
  const leadingSubject = subjectTotals.find((item) => item.minutes > 0)?.subject;

  const allDates = datesInRange(selectedRange.start, selectedRange.end);
  const chartDates = allDates.slice(-31);
  const dailyData = chartDates.map((dateKey) => {
    const daySessions = rangeSessions.filter((session) => session.dateKey === dateKey);
    const totals = daySessions.reduce((accumulator, session) => {
      accumulator[session.subjectId] = (accumulator[session.subjectId] || 0) + Number(session.durationMinutes || 0);
      return accumulator;
    }, {});
    return {
      dateKey,
      total: Object.values(totals).reduce((sum, minutes) => sum + minutes, 0),
      totals,
    };
  });
  const maxDailyMinutes = Math.max(...dailyData.map((day) => day.total), 60);
  const newMinutes = rangeSessions.filter((session) => session.learningMode === 'new').reduce((total, session) => total + Number(session.durationMinutes || 0), 0);
  const revisionMinutes = totalMinutes - newMinutes;
  const selectedSubject = subjectById.get(selectedSubjectId);
  const selectedSessions = selectedSubject
    ? rangeSessions.filter((session) => session.subjectId === selectedSubject.id).sort((first, second) => second.dateKey.localeCompare(first.dateKey))
    : [];

  return (
    <section className="study-insights-section" aria-labelledby="study-insights-title">
      <header className="study-insights-header">
        <div className="study-insights-heading"><span className="study-log-icon"><BookOpenCheck size={20} /></span><div><span className="eyebrow">Focused learning</span><h2 id="study-insights-title">Study insights</h2><p>See where your study time is going and how consistently you return.</p></div></div>
        <div className="study-range-control" aria-label="Study insight range">
          {[['week', 'Week'], ['month', 'Month'], ['30', '30 days'], ['custom', 'Custom']].map(([value, label]) => <button key={value} data-active={range === value} onClick={() => setRange(value)}>{label}</button>)}
        </div>
      </header>

      {range === 'custom' && <div className="study-custom-range"><label><span>From</span><input type="date" value={customStart} max={today} onChange={(event) => setCustomStart(event.target.value)} /></label><label><span>To</span><input type="date" value={customEnd} max={today} onChange={(event) => setCustomEnd(event.target.value)} /></label></div>}

      <div className="study-insight-summary">
        <article><span className="study-summary-icon"><Clock3 size={17} /></span><div><strong>{formatStudyDuration(totalMinutes)}</strong><small>{selectedRange.label}</small></div></article>
        <article><span className="study-summary-icon"><CalendarDays size={17} /></span><div><strong>{studiedDays}</strong><small>Days studied</small></div></article>
        <article><span className="study-summary-icon"><Brain size={17} /></span><div><strong>{averageConfidence ? `${averageConfidence.toFixed(1)}/5` : '—'}</strong><small>Avg. confidence</small></div></article>
        <article><span className="study-summary-icon"><Flame size={17} /></span><div><strong>{streak}</strong><small>Day streak</small></div></article>
        <article className="study-summary-wide"><span className="study-summary-icon">{changePercent >= 0 ? <TrendingUp size={17} /> : <TrendingDown size={17} />}</span><div><strong>{changePercent > 0 ? '+' : ''}{changePercent}%</strong><small>vs previous {rangeDays}-day period · {averageMinutes ? `${formatStudyDuration(averageMinutes)} per study day` : 'No sessions yet'}</small></div></article>
      </div>

      <div className="study-insights-grid">
        <article className="study-insight-panel study-daily-panel">
          <header><span><BarChart3 size={17} /></span><div><strong>Daily study time</strong><small>{chartDates.length < allDates.length ? `Latest ${chartDates.length} days of ${selectedRange.label.toLocaleLowerCase()}` : selectedRange.label}</small></div></header>
          <div className="study-daily-chart" aria-label="Daily study time by subject">
            {dailyData.map((day) => (
              <div className="study-day-column" key={day.dateKey} title={`${day.dateKey}: ${formatStudyDuration(day.total)}`}>
                <div className="study-day-stack" style={{ height: `${Math.max(day.total ? 8 : 1, (day.total / maxDailyMinutes) * 100)}%` }}>
                  {Object.entries(day.totals).map(([subjectId, minutes]) => <i key={subjectId} style={{ height: `${(minutes / day.total) * 100}%`, backgroundColor: subjectById.get(subjectId)?.color || 'var(--text-tertiary)' }} />)}
                </div>
                <span>{parseDateKey(day.dateKey).toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
              </div>
            ))}
          </div>
          <div className="study-chart-legend">{subjects.filter((subject) => subjectTotals.some((item) => item.subject.id === subject.id && item.minutes > 0)).map((subject) => <span key={subject.id}><i style={{ backgroundColor: subject.color }} />{getSubjectDisplayName(subject)}</span>)}</div>
        </article>

        <article className="study-insight-panel study-subject-panel">
          <header><span><BookOpenCheck size={17} /></span><div><strong>Time by subject</strong><small>{leadingSubject ? `${leadingSubject.name} leads this period` : 'Your subject balance will appear here'}</small></div></header>
          <div className="study-subject-bars">
            {subjectTotals.map(({ subject, minutes, scaledGoal }) => (
              <button key={subject.id} data-active={selectedSubjectId === subject.id} onClick={() => setSelectedSubjectId((current) => current === subject.id ? null : subject.id)}>
                <span className="study-subject-bar-label"><strong>{subject.name}</strong><small>{formatStudyDuration(minutes)}{scaledGoal ? ` of ${formatStudyDuration(scaledGoal)} goal` : ''}</small></span>
                <span className="study-subject-bar-track"><i style={{ width: `${(minutes / maxSubjectMinutes) * 100}%`, backgroundColor: subject.color }} /></span>
                {scaledGoal > 0 && <span className="study-goal-percent">{Math.min(999, Math.round((minutes / scaledGoal) * 100))}%</span>}
              </button>
            ))}
          </div>
        </article>

        <article className="study-insight-panel study-learning-split">
          <header><span><Brain size={17} /></span><div><strong>Learning mix</strong><small>New material and revision</small></div></header>
          <div className="study-split-values"><span><strong>{formatStudyDuration(newMinutes)}</strong><small>New topics</small></span><span><strong>{formatStudyDuration(revisionMinutes)}</strong><small>Revision</small></span></div>
          <div className="study-split-track" aria-label={`${totalMinutes ? Math.round((newMinutes / totalMinutes) * 100) : 0}% new topics`}><i style={{ width: `${totalMinutes ? (newMinutes / totalMinutes) * 100 : 0}%` }} /></div>
        </article>

        <article className="study-insight-panel study-calendar-panel">
          <header><span><CalendarDays size={17} /></span><div><strong>Consistency</strong><small>More time creates a stronger square</small></div></header>
          <div className="study-calendar-grid">{dailyData.map((day) => <span key={day.dateKey} title={`${day.dateKey}: ${formatStudyDuration(day.total)}`} style={{ '--study-intensity': day.total ? Math.max(0.18, day.total / maxDailyMinutes) : 0 }} data-active={day.total > 0} />)}</div>
        </article>
      </div>

      {selectedSubject && (
        <article className="study-subject-detail" style={{ '--study-subject': selectedSubject.color }}>
          <header><span className="study-subject-swatch" /><div><strong>{selectedSubject.name}</strong><small>Recent topics in {selectedRange.label.toLocaleLowerCase()}</small></div><button onClick={() => setSelectedSubjectId(null)}>Close</button></header>
          {selectedSessions.length ? <div>{selectedSessions.slice(0, 8).map((session) => <span key={session.id}><strong>{session.topic}</strong><small>{session.dateKey} · {formatStudyDuration(session.durationMinutes)} · {session.learningMode === 'revision' ? 'Revision' : 'New topic'}</small></span>)}</div> : <p>No {selectedSubject.name} sessions in this period.</p>}
        </article>
      )}
    </section>
  );
}
