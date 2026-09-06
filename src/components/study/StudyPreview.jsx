import {
  DEFAULT_STUDY_SOURCES,
  DEFAULT_STUDY_SUBJECTS,
} from '../../data/study';
import StudyInsights from './StudyInsights';
import StudyLogSection from './StudyLogSection';
import StudySessionSheet from './StudySessionSheet';
import StudySettings from './StudySettings';

const PREVIEW_SESSIONS = [
  { id: 's1', dateKey: '2026-09-06', subjectId: 'medicine', durationMinutes: 55, learningMode: 'new', activityType: 'lecture', topic: 'Heart failure', confidence: 3, source: 'Boards & Beyond', amountValue: 2, amountUnit: 'videos', notes: '' },
  { id: 's2', dateKey: '2026-09-06', subjectId: 'pediatrics', durationMinutes: 35, learningMode: 'revision', activityType: 'questions', topic: 'Neonatal jaundice', confidence: 4, source: '', amountValue: 24, amountUnit: 'questions', notes: '' },
  { id: 's3', dateKey: '2026-09-05', subjectId: 'surgery', durationMinutes: 75, learningMode: 'new', activityType: 'reading', topic: 'Acute abdomen', confidence: 3 },
  { id: 's4', dateKey: '2026-09-04', subjectId: 'gyneobs', durationMinutes: 45, learningMode: 'revision', activityType: 'flashcards', topic: 'Hypertensive disorders', confidence: 4 },
  { id: 's5', dateKey: '2026-09-03', subjectId: 'medicine', durationMinutes: 95, learningMode: 'revision', activityType: 'questions', topic: 'ECG practice', confidence: 4 },
  { id: 's6', dateKey: '2026-09-02', subjectId: 'pediatrics', durationMinutes: 60, learningMode: 'new', activityType: 'lecture', topic: 'Congenital heart disease', confidence: 2 },
  { id: 's7', dateKey: '2026-09-01', subjectId: 'surgery', durationMinutes: 40, learningMode: 'revision', activityType: 'notes', topic: 'Wound healing', confidence: 4 },
  { id: 's8', dateKey: '2026-08-31', subjectId: 'medicine', durationMinutes: 80, learningMode: 'new', activityType: 'lecture', topic: 'Valvular disease', confidence: 3 },
];

const PREVIEW_GOALS = { medicine: 360, pediatrics: 240, surgery: 240, gyneobs: 180 };

export default function StudyPreview({ theme = 'ios', screen = 'sheet' }) {
  if (screen === 'today') {
    return (
      <div className="app-shell study-preview study-preview-page" data-theme={theme} data-color-mode="light">
        <main className="app-main page-stack">
          <section className="page-heading"><div><span className="eyebrow">Sunday · Day 6</span><h1>Today</h1><p>Keep the day honest, focused and visible.</p></div></section>
          <StudyLogSection dateKey="2026-09-06" theme={theme} subjects={DEFAULT_STUDY_SUBJECTS} sources={DEFAULT_STUDY_SOURCES} sessions={PREVIEW_SESSIONS.filter((session) => session.dateKey === '2026-09-06')} onSaveSession={async () => {}} onDeleteSession={async () => {}} />
        </main>
      </div>
    );
  }

  if (screen === 'insights') {
    return (
      <div className="app-shell study-preview study-preview-page" data-theme={theme} data-color-mode="light">
        <main className="app-main page-stack">
          <section className="page-heading"><div><span className="eyebrow">Your patterns</span><h1>Insights</h1><p>See where your time goes and what keeps moving.</p></div></section>
          <StudyInsights sessions={PREVIEW_SESSIONS} subjects={DEFAULT_STUDY_SUBJECTS} weeklyGoals={PREVIEW_GOALS} today="2026-09-06" />
        </main>
      </div>
    );
  }

  if (screen === 'settings') {
    return (
      <div className="app-shell study-preview study-preview-page" data-theme={theme} data-color-mode="light">
        <main className="app-main page-stack">
          <section className="page-heading"><div><span className="eyebrow">Make it yours</span><h1>Settings</h1><p>Choose the subjects and sources that match your study plan.</p></div></section>
          <StudySettings subjects={DEFAULT_STUDY_SUBJECTS} sources={DEFAULT_STUDY_SOURCES} weeklyGoals={PREVIEW_GOALS} onSave={async () => {}} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell study-preview" data-theme={theme} data-color-mode="light">
      <main className="study-preview-background">
        <span className="eyebrow">Daily check-in</span>
        <h1>Sunday, September 6</h1>
        <div><span /><span /><span /></div>
      </main>
      <StudySessionSheet
        dateKey="2026-09-06"
        theme={theme}
        subjects={DEFAULT_STUDY_SUBJECTS}
        sources={DEFAULT_STUDY_SOURCES}
        initialSubjectId="medicine"
        initialValues={{
          dateKey: '2026-09-06',
          subjectId: 'medicine',
          durationMinutes: 55,
          learningMode: 'new',
          activityType: 'lecture',
          topic: 'Heart failure',
          confidence: 3,
          source: '',
          amountValue: '',
          amountUnit: 'videos',
          notes: '',
        }}
        onClose={() => {}}
        onSave={async () => {}}
      />
    </div>
  );
}
