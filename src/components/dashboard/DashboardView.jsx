import { useMemo } from 'react';
import { Activity, Check, Flame, Layers3 } from 'lucide-react';
import SalahGraph from './SalahGraph';
import EffortGraph from './EffortGraph';
import { getDaysArray, parseDateKey, toDateKey } from '../../utils/helpers';
import TimeGraph from './TimeGraph';
import WeeklyGraph from './WeeklyGraph';
import StudyInsights from '../study/StudyInsights';

const PRAYER_IDS = new Set(['fajar', 'zuhar', 'asar', 'maghrib', 'isha']);

export default function DashboardView({ tasks, logs, startDate, userName, today, studySessions, studySubjects, weeklyStudyGoals, insightsCardOrder }) {
  const days100 = useMemo(() => getDaysArray(startDate, 100), [startDate]);
  const todayLog = logs[today] || {};

  const isCompleted = (task, data) => !!task && !!data?.checked;

  const getStreak = (task) => {
    let streak = 0;
    const cursor = parseDateKey(today);

    if (!isCompleted(task, logs[today]?.[task.id])) cursor.setDate(cursor.getDate() - 1);
    for (let index = 0; index < 100; index += 1) {
      const day = toDateKey(cursor);
      if (!isCompleted(task, logs[day]?.[task.id])) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  };

  const taskStreaks = tasks.map((task) => ({ task, streak: getStreak(task) }));
  const completedToday = tasks.filter((task) => isCompleted(task, todayLog[task.id])).length;
  const completionRate = tasks.length ? Math.round((completedToday / tasks.length) * 100) : 0;
  const bestStreak = taskStreaks.reduce((best, item) => Math.max(best, item.streak), 0);
  const prayerTasks = tasks.filter((task) => PRAYER_IDS.has(task.id));
  const insightCards = {
    salah: prayerTasks.length > 0 ? <SalahGraph logs={logs} days100={days100} today={today} prayerTasks={prayerTasks} /> : null,
    effort: <EffortGraph logs={logs} days100={days100} today={today} />,
    study: <StudyInsights sessions={studySessions} subjects={studySubjects} weeklyGoals={weeklyStudyGoals} today={today} />,
    time: <TimeGraph logs={logs} today={today} />,
    weekly: <WeeklyGraph logs={logs} today={today} />,
  };

  return (
    <div className="page-stack dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Your momentum</span>
          <h1>{userName}&apos;s Insights</h1>
          <p>A clear view of the routines you&apos;re building, one day at a time.</p>
        </div>
        <div className="hero-progress">
          <strong>{completionRate}%</strong>
          <span>complete today</span>
        </div>
      </section>

      <section className="summary-grid" aria-label="Today's summary">
        <div className="summary-card"><span className="summary-icon"><Check size={18} /></span><span><strong>{completedToday}</strong><small>Done today</small></span></div>
        <div className="summary-card"><span className="summary-icon"><Layers3 size={18} /></span><span><strong>{tasks.length}</strong><small>Active tasks</small></span></div>
        <div className="summary-card"><span className="summary-icon"><Flame size={18} /></span><span><strong>{bestStreak}</strong><small>Best streak</small></span></div>
        <div className="summary-card"><span className="summary-icon"><Activity size={18} /></span><span><strong>{Object.keys(logs).length}</strong><small>Days logged</small></span></div>
      </section>

      <div className="charts-grid">
        {insightsCardOrder.map((cardId) => <div key={cardId} className={`insight-card-slot insight-card-slot-${cardId}`}>{insightCards[cardId]}</div>)}
      </div>

      <section>
        <div className="content-section-heading">
          <div><span className="eyebrow">Every habit</span><h2>100-day progress</h2></div>
          <p>Each square represents one day.</p>
        </div>

        {tasks.length ? (
          <div className="habit-widget-grid">
            {taskStreaks.map(({ task, streak }) => (
              <article key={task.id} className="habit-widget">
                <header>
                  <span className="widget-title"><i className="category-dot" /><span><strong>{task.label}</strong><small>{task.category}{task.custom ? ' · Custom' : ''}</small></span></span>
                  <span className="streak"><strong>{streak}</strong><small>day streak</small></span>
                </header>
                <div className="heatmap" aria-label={`${task.label} 100-day completion map`}>
                  {days100.map((day) => {
                    const done = isCompleted(task, logs[day]?.[task.id]);
                    const future = day > today;
                    const missed = day < today && !done;
                    return <span key={day} className="heat-cell" data-done={done} data-missed={missed} data-future={future} title={`${day}: ${done ? 'Complete' : future ? 'Upcoming' : missed ? 'Missed' : 'Pending'}`} />;
                  })}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state compact-empty"><h3>No active task widgets</h3><p>Add a custom task in Settings and its progress will appear here.</p></div>
        )}
      </section>
    </div>
  );
}
