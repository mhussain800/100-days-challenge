import { Target } from 'lucide-react';
import { formatStudyDuration, getSubjectDisplayName } from '../../data/study';
import { parseDateKey, toDateKey } from '../../utils/helpers';

const startOfWeek = (dateKey) => {
  const date = parseDateKey(dateKey);
  const weekday = date.getDay();
  date.setDate(date.getDate() - (weekday === 0 ? 6 : weekday - 1));
  return toDateKey(date);
};

const formatWeekRange = (start, end) => {
  const startDate = parseDateKey(start);
  const endDate = parseDateKey(end);
  const options = { month: 'short', day: 'numeric' };
  const startLabel = startDate.toLocaleDateString('en-US', options);
  const endLabel = endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' });
  return `${startLabel} – ${endLabel}`;
};

export default function StudyGoalProgress({ sessions, subjects, weeklyGoals, today }) {
  const weekStart = startOfWeek(today);
  const activeSubjects = subjects.filter((subject) => !subject.archived);
  const weekSessions = sessions.filter((session) => session.dateKey >= weekStart && session.dateKey <= today);
  const goals = activeSubjects.map((subject) => {
    const minutes = weekSessions
      .filter((session) => session.subjectId === subject.id)
      .reduce((total, session) => total + Number(session.durationMinutes || 0), 0);
    const goalMinutes = Math.max(0, Number(weeklyGoals[subject.id]) || 0);
    const progress = goalMinutes ? Math.round((minutes / goalMinutes) * 100) : null;
    return { subject, minutes, goalMinutes, progress };
  });
  const totalMinutes = goals.reduce((total, item) => total + item.minutes, 0);
  const totalGoalMinutes = goals.reduce((total, item) => total + item.goalMinutes, 0);
  const goalCount = goals.filter((item) => item.goalMinutes > 0).length;
  const overallProgress = totalGoalMinutes ? Math.round((totalMinutes / totalGoalMinutes) * 100) : null;

  return (
    <section className="study-goal-progress-card" aria-labelledby="study-goal-progress-title">
      <header className="study-goal-progress-header">
        <span className="study-goal-progress-icon"><Target size={19} /></span>
        <span>
          <span className="eyebrow">Weekly target</span>
          <h2 id="study-goal-progress-title">Subject goal progress</h2>
          <p>{formatWeekRange(weekStart, today)}</p>
        </span>
        <span className="study-goal-progress-total">
          <strong>{overallProgress === null ? '—' : `${Math.min(overallProgress, 999)}%`}</strong>
          <small>{totalGoalMinutes ? `${formatStudyDuration(totalMinutes)} of ${formatStudyDuration(totalGoalMinutes)}` : 'No goals set'}</small>
        </span>
      </header>

      {goals.length ? (
        <div className="study-goal-chart" aria-label="Weekly study progress by subject">
          {goals.map(({ subject, minutes, goalMinutes, progress }) => {
            const fill = progress === null ? 0 : Math.min(progress, 100);
            return (
              <div className="study-goal-row" key={subject.id} data-has-goal={goalMinutes > 0} data-complete={progress !== null && progress >= 100}>
                <div className="study-goal-row-heading">
                  <span><i style={{ backgroundColor: subject.color }} />{getSubjectDisplayName(subject)}</span>
                  <small>{goalMinutes ? `${formatStudyDuration(minutes)} / ${formatStudyDuration(goalMinutes)}` : `${formatStudyDuration(minutes)} · No goal`}</small>
                </div>
                <div className="study-goal-track" aria-label={`${getSubjectDisplayName(subject)}: ${progress === null ? 'no weekly goal' : `${progress}% of weekly goal`}`}>
                  <i style={{ width: `${fill}%`, backgroundColor: subject.color }} />
                  {progress !== null && progress > 100 && <b>+{progress - 100}%</b>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="study-goal-empty">Add a study subject to start tracking weekly goals.</div>
      )}

      {!goalCount && goals.length > 0 && <p className="study-goal-hint">Set an optional weekly goal for each subject in Study Subjects to compare planned and completed time here.</p>}
    </section>
  );
}
