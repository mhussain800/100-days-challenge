import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  CalendarCheck,
  ChartNoAxesColumnIncreasing,
  LogOut,
  Settings,
} from 'lucide-react';

import { DEFAULT_SECTIONS, DEFAULT_TASKS, normalizeSections, normalizeTasks } from './data/tasks';
import { DEFAULT_STUDY_SOURCES, DEFAULT_STUDY_SUBJECTS, makeStudySubject, normalizeStudyGoals, normalizeStudySources, normalizeStudySubjects, sanitizeStudySession } from './data/study';
import { DEFAULT_INSIGHTS_CARD_ORDER, DEFAULT_TODAY_CARD_ORDER, getDefaultTodayHabitCardOrder, normalizeCardOrder, normalizeTodayHabitCardOrder } from './data/layout';
import { getToday, parseDateKey } from './utils/helpers';

import Login from './components/auth/Login';
import NameModal from './components/auth/NameModal';
import TrackerView from './components/tracker/TrackerView';
import DashboardView from './components/dashboard/DashboardView';
import SettingsView from './components/settings/SettingsView';
import StudyPreview from './components/study/StudyPreview';

import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Timestamp, collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

const VALID_THEMES = new Set(['ios', 'ledger']);
const VALID_COLOR_MODES = new Set(['light', 'dark', 'system']);
const DEFAULT_THEME = 'ios';
const DEFAULT_COLOR_MODE = 'system';

const sanitizeQuote = (value) => {
  const text = typeof value?.text === 'string' ? value.text.trim().slice(0, 500) : '';
  return text ? { text } : null;
};

const quoteTime = (quote) => quote.createdAt?.toMillis?.() || Number(quote.createdAt) || 0;

const NAV_ITEMS = [
  { id: 'tracker', label: 'Today', icon: CalendarCheck },
  { id: 'dashboard', label: 'Insights', icon: ChartNoAxesColumnIncreasing },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(null);
  const [logs, setLogs] = useState({});
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [studySubjects, setStudySubjects] = useState(DEFAULT_STUDY_SUBJECTS);
  const [studySources, setStudySources] = useState(DEFAULT_STUDY_SOURCES);
  const [weeklyStudyGoals, setWeeklyStudyGoals] = useState({});
  const [todayCardOrder, setTodayCardOrder] = useState(DEFAULT_TODAY_CARD_ORDER);
  const [todayHabitCardOrder, setTodayHabitCardOrder] = useState(() => getDefaultTodayHabitCardOrder(DEFAULT_SECTIONS));
  const [insightsCardOrder, setInsightsCardOrder] = useState(DEFAULT_INSIGHTS_CARD_ORDER);
  const [studySessions, setStudySessions] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [activeQuoteId, setActiveQuoteId] = useState(null);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('challenge_theme');
    return VALID_THEMES.has(savedTheme) ? savedTheme : DEFAULT_THEME;
  });
  const [colorMode, setColorMode] = useState(() => {
    const savedMode = localStorage.getItem('challenge_color_mode');
    return VALID_COLOR_MODES.has(savedMode) ? savedMode : DEFAULT_COLOR_MODE;
  });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [today, setToday] = useState(getToday());
  const [currentDate, setCurrentDate] = useState(getToday());
  const [view, setView] = useState('tracker');
  const [startDate, setStartDate] = useState(getToday());
  const [saveStatus, setSaveStatus] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  const logSaveTimeoutRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const viewScrollPositionsRef = useRef({ tracker: 0, dashboard: 0, settings: 0 });
  const resolvedColorMode = colorMode === 'system' ? (systemDark ? 'dark' : 'light') : colorMode;

  const changeView = (nextView) => {
    if (nextView === view) return;
    viewScrollPositionsRef.current[view] = window.scrollY;
    setView(nextView);
  };

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, viewScrollPositionsRef.current[view] || 0);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [view]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.colorMode = resolvedColorMode;
    const pageColor = getComputedStyle(document.documentElement).getPropertyValue('--page-bg').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', pageColor);
  }, [resolvedColorMode, theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => setSystemDark(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    let midnightTimer;
    const syncToday = () => {
      const nextToday = getToday();
      setToday((previousToday) => {
        setCurrentDate((selectedDate) => selectedDate === previousToday ? nextToday : selectedDate);
        return nextToday;
      });
    };
    const refreshAtMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      midnightTimer = window.setTimeout(() => {
        syncToday();
        refreshAtMidnight();
      }, nextMidnight.getTime() - now.getTime() + 250);
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') syncToday();
    };

    refreshAtMidnight();
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearTimeout(midnightTimer);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);

  const showSaveStatus = (status, clearAfter = 0) => {
    if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    setSaveStatus(status);
    if (clearAfter) {
      statusTimeoutRef.current = setTimeout(() => setSaveStatus(''), clearAfter);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setUserName(null);
        setLogs({});
        setTasks(DEFAULT_TASKS);
        setSections(DEFAULT_SECTIONS);
        setStudySubjects(DEFAULT_STUDY_SUBJECTS);
        setStudySources(DEFAULT_STUDY_SOURCES);
        setWeeklyStudyGoals({});
        setTodayCardOrder(DEFAULT_TODAY_CARD_ORDER);
        setTodayHabitCardOrder(getDefaultTodayHabitCardOrder(DEFAULT_SECTIONS));
        setInsightsCardOrder(DEFAULT_INSIGHTS_CARD_ORDER);
        setStudySessions([]);
        setQuotes([]);
        setActiveQuoteId(null);
        setStartDate(getToday());
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      setUser(currentUser);

      try {
        const profileRef = doc(db, 'users', currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        setUserName(profileSnap.exists() && profileSnap.data().name ? profileSnap.data().name : null);
      } catch (error) {
        console.error('Profile load error:', error);
        setUserName(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    const logsRef = doc(db, 'users', user.uid, 'challenge_data', 'logs');
    return onSnapshot(logsRef, (docSnap) => {
      const fetchedLogs = docSnap.exists() ? docSnap.data().records || {} : {};
      setLogs(fetchedLogs);

      const savedDates = Object.keys(fetchedLogs).sort();
      setStartDate(savedDates[0] || getToday());
    }, (error) => {
      console.error('Logs sync error:', error);
      showSaveStatus('Sync unavailable');
    });
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;

    const preferencesRef = doc(db, 'users', user.uid, 'challenge_data', 'preferences');
    return onSnapshot(preferencesRef, (docSnap) => {
      if (!docSnap.exists()) {
        setTasks(DEFAULT_TASKS);
        setSections(DEFAULT_SECTIONS);
        setTheme(DEFAULT_THEME);
        setColorMode(DEFAULT_COLOR_MODE);
        setStudySubjects(DEFAULT_STUDY_SUBJECTS);
        setStudySources(DEFAULT_STUDY_SOURCES);
        setWeeklyStudyGoals({});
        setTodayCardOrder(DEFAULT_TODAY_CARD_ORDER);
        setTodayHabitCardOrder(getDefaultTodayHabitCardOrder(DEFAULT_SECTIONS));
        setInsightsCardOrder(DEFAULT_INSIGHTS_CARD_ORDER);
        setActiveQuoteId(null);
        localStorage.setItem('challenge_theme', DEFAULT_THEME);
        localStorage.setItem('challenge_color_mode', DEFAULT_COLOR_MODE);
        return;
      }

      const preferences = docSnap.data();
      const savedTasks = normalizeTasks(preferences.tasks);
      setTasks(savedTasks);
      setSections(normalizeSections(preferences.sections, savedTasks));
      setStudySubjects(normalizeStudySubjects(preferences.studySubjects));
      setStudySources(normalizeStudySources(preferences.studySources));
      setWeeklyStudyGoals(normalizeStudyGoals(preferences.weeklyStudyGoals));
      setTodayCardOrder(normalizeCardOrder(preferences.todayCardOrder, DEFAULT_TODAY_CARD_ORDER));
      setTodayHabitCardOrder(normalizeTodayHabitCardOrder(preferences.todayHabitCardOrder, normalizeSections(preferences.sections, savedTasks)));
      setInsightsCardOrder(normalizeCardOrder(preferences.insightsCardOrder, DEFAULT_INSIGHTS_CARD_ORDER));
      setActiveQuoteId(typeof preferences.activeQuoteId === 'string' ? preferences.activeQuoteId : null);

      const savedTheme = VALID_THEMES.has(preferences.theme) ? preferences.theme : DEFAULT_THEME;
      const savedColorMode = VALID_COLOR_MODES.has(preferences.colorMode) ? preferences.colorMode : DEFAULT_COLOR_MODE;
      setTheme(savedTheme);
      setColorMode(savedColorMode);
      localStorage.setItem('challenge_theme', savedTheme);
      localStorage.setItem('challenge_color_mode', savedColorMode);
    }, (error) => {
      console.error('Preferences sync error:', error);
      showSaveStatus('Settings offline');
    });
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    return onSnapshot(collection(db, 'users', user.uid, 'study_sessions'), (snapshot) => {
      const fetchedSessions = snapshot.docs.map((sessionDoc) => {
        const data = sessionDoc.data();
        const normalized = sanitizeStudySession(data);
        if (!normalized.subjectId || !normalized.dateKey || !normalized.topic) return null;
        return { id: sessionDoc.id, ...normalized, createdAt: data.createdAt, updatedAt: data.updatedAt };
      }).filter(Boolean).sort((first, second) => first.dateKey.localeCompare(second.dateKey));
      setStudySessions(fetchedSessions);
    }, (error) => { console.error('Study sessions sync error:', error); showSaveStatus('Study sync unavailable'); });
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    return onSnapshot(collection(db, 'users', user.uid, 'learning_quotes'), (snapshot) => {
      const fetchedQuotes = snapshot.docs.map((quoteDoc) => {
        const data = quoteDoc.data();
        const quote = sanitizeQuote(data);
        return quote ? { id: quoteDoc.id, ...quote, createdAt: data.createdAt, updatedAt: data.updatedAt } : null;
      }).filter(Boolean).sort((first, second) => quoteTime(second) - quoteTime(first));
      setQuotes(fetchedQuotes);
    }, (error) => { console.error('Quote sync error:', error); showSaveStatus('Quote sync unavailable'); });
  }, [user]);

  useEffect(() => () => {
    if (logSaveTimeoutRef.current) clearTimeout(logSaveTimeoutRef.current);
    if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
  }, []);

  const handleSaveName = async (name) => {
    setUserName(name);
    if (user) {
      const profileRef = doc(db, 'users', user.uid);
      await setDoc(profileRef, { name }, { merge: true });
    }
  };

  const updateTask = (taskId, field, value) => {
    const currentDayData = logs[currentDate] || {};
    const updatedTask = { ...(currentDayData[taskId] || {}), [field]: value };
    const updatedDay = { ...currentDayData, [taskId]: updatedTask, timestamp: Date.now() };
    const newLogs = { ...logs, [currentDate]: updatedDay };

    setLogs(newLogs);
    if (logSaveTimeoutRef.current) clearTimeout(logSaveTimeoutRef.current);
    showSaveStatus('Saving…');

    logSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const logsRef = doc(db, 'users', user.uid, 'challenge_data', 'logs');
        await setDoc(logsRef, { records: newLogs }, { merge: true });
        showSaveStatus('Saved', 1800);
      } catch (error) {
        console.error('Save error:', error);
        showSaveStatus('Could not save');
      }
    }, 450);
  };

  const savePreferences = async ({
    nextTasks = tasks,
    nextTheme = theme,
    nextColorMode = colorMode,
    nextSections = sections,
    nextStudySubjects = studySubjects,
    nextStudySources = studySources,
    nextWeeklyStudyGoals = weeklyStudyGoals,
    nextTodayCardOrder = todayCardOrder,
    nextTodayHabitCardOrder = todayHabitCardOrder,
    nextInsightsCardOrder = insightsCardOrder,
    nextActiveQuoteId = activeQuoteId,
  } = {}) => {
    const safeTasks = normalizeTasks(nextTasks);
    const safeTheme = VALID_THEMES.has(nextTheme) ? nextTheme : DEFAULT_THEME;
    const safeColorMode = VALID_COLOR_MODES.has(nextColorMode) ? nextColorMode : DEFAULT_COLOR_MODE;
    const safeSections = normalizeSections(nextSections, safeTasks);
    const safeStudySubjects = normalizeStudySubjects(nextStudySubjects);
    const safeStudySources = normalizeStudySources(nextStudySources);
    const safeWeeklyStudyGoals = normalizeStudyGoals(nextWeeklyStudyGoals);
    const safeTodayCardOrder = normalizeCardOrder(nextTodayCardOrder, DEFAULT_TODAY_CARD_ORDER);
    const safeTodayHabitCardOrder = normalizeTodayHabitCardOrder(nextTodayHabitCardOrder, safeSections);
    const safeInsightsCardOrder = normalizeCardOrder(nextInsightsCardOrder, DEFAULT_INSIGHTS_CARD_ORDER);
    const safeActiveQuoteId = typeof nextActiveQuoteId === 'string' ? nextActiveQuoteId : null;

    setTasks(safeTasks);
    setSections(safeSections);
    setTheme(safeTheme);
    setColorMode(safeColorMode);
    setStudySubjects(safeStudySubjects);
    setStudySources(safeStudySources);
    setWeeklyStudyGoals(safeWeeklyStudyGoals);
    setTodayCardOrder(safeTodayCardOrder);
    setTodayHabitCardOrder(safeTodayHabitCardOrder);
    setInsightsCardOrder(safeInsightsCardOrder);
    setActiveQuoteId(safeActiveQuoteId);
    localStorage.setItem('challenge_theme', safeTheme);
    localStorage.setItem('challenge_color_mode', safeColorMode);
    showSaveStatus('Saving…');

    try {
      const preferencesRef = doc(db, 'users', user.uid, 'challenge_data', 'preferences');
      await setDoc(preferencesRef, {
        tasks: safeTasks,
        sections: safeSections,
        theme: safeTheme,
        colorMode: safeColorMode,
        studySubjects: safeStudySubjects,
        studySources: safeStudySources,
        weeklyStudyGoals: safeWeeklyStudyGoals,
        todayCardOrder: safeTodayCardOrder,
        todayHabitCardOrder: safeTodayHabitCardOrder,
        insightsCardOrder: safeInsightsCardOrder,
        activeQuoteId: safeActiveQuoteId,
        updatedAt: Date.now(),
      }, { merge: true });
      showSaveStatus('Saved', 1800);
      return true;
    } catch (error) {
      console.error('Preferences save error:', error);
      showSaveStatus('Could not save');
      return false;
    }
  };

  const addTask = (task) => savePreferences({
    nextTasks: [...tasks, task],
    nextSections: sections.some((section) => section.toLocaleLowerCase() === task.category.toLocaleLowerCase())
      ? sections
      : [...sections, task.category],
  });
  const removeTask = (taskId) => savePreferences({ nextTasks: tasks.filter((task) => task.id !== taskId) });
  const removeDefaultTasks = () => savePreferences({ nextTasks: tasks.filter((task) => task.custom) });
  const restoreDefaultTasks = () => {
    const currentIds = new Set(tasks.map((task) => task.id));
    const missingDefaults = DEFAULT_TASKS.filter((task) => !currentIds.has(task.id));
    return savePreferences({ nextTasks: [...tasks, ...missingDefaults], nextSections: [...sections, ...DEFAULT_SECTIONS] });
  };
  const addSection = (section) => savePreferences({ nextSections: [...sections, section] });
  const removeSection = (section) => savePreferences({
    nextTasks: tasks.filter((task) => task.category !== section),
    nextSections: sections.filter((item) => item !== section),
  });
  const changeTheme = (nextTheme) => savePreferences({ nextTheme });
  const changeColorMode = (nextColorMode) => savePreferences({ nextColorMode });
  const saveStudySettings = ({ subjects: nextStudySubjects, sources: nextStudySources, weeklyGoals: nextWeeklyStudyGoals }) => savePreferences({ nextStudySubjects, nextStudySources, nextWeeklyStudyGoals });
  const addStudySubject = async (name) => {
    const cleanName = name.trim();
    if (!cleanName) throw new Error('Enter a subject name.');
    if (studySubjects.some((subject) => subject.name.toLocaleLowerCase() === cleanName.toLocaleLowerCase())) throw new Error('That subject already exists.');
    return savePreferences({ nextStudySubjects: [...studySubjects, makeStudySubject(cleanName, studySubjects.length)] });
  };
  const saveCardOrder = ({
    todayCardOrder: nextTodayCardOrder = todayCardOrder,
    todayHabitCardOrder: nextTodayHabitCardOrder = todayHabitCardOrder,
    insightsCardOrder: nextInsightsCardOrder = insightsCardOrder,
    sections: nextSections = sections,
  }) => savePreferences({ nextTodayCardOrder, nextTodayHabitCardOrder, nextInsightsCardOrder, nextSections });
  const selectQuote = async (quoteId) => {
    if (!quotes.some((quote) => quote.id === quoteId)) return false;
    return savePreferences({ nextActiveQuoteId: quoteId });
  };
  const saveQuote = async (text) => {
    const quote = sanitizeQuote({ text });
    if (!quote) throw new Error('Write a quote first.');
    const quoteRef = doc(collection(db, 'users', user.uid, 'learning_quotes'));
    showSaveStatus('Saving…');
    try {
      await Promise.all([
        setDoc(quoteRef, { ...quote, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }),
        setDoc(doc(db, 'users', user.uid, 'challenge_data', 'preferences'), { activeQuoteId: quoteRef.id, updatedAt: Date.now() }, { merge: true }),
      ]);
      setQuotes((current) => (current.some((item) => item.id === quoteRef.id)
        ? current
        : [{ id: quoteRef.id, ...quote, createdAt: Date.now() }, ...current]));
      setActiveQuoteId(quoteRef.id);
      showSaveStatus('Quote saved', 1800);
      return true;
    } catch (error) {
      console.error('Quote save error:', error);
      showSaveStatus('Could not save quote');
      throw error;
    }
  };
  const syncStudyHabitForDates = async (nextSessions, dateKeys) => {
    const nextLogs = { ...logs };
    dateKeys.forEach((dateKey) => {
      const totalMinutes = nextSessions.filter((session) => session.dateKey === dateKey).reduce((total, session) => total + Number(session.durationMinutes || 0), 0);
      const hours = totalMinutes ? (totalMinutes / 60).toFixed(2).replace(/\.?0+$/, '') : '';
      nextLogs[dateKey] = { ...(nextLogs[dateKey] || {}), study: { ...(nextLogs[dateKey]?.study || {}), checked: totalMinutes > 0, val: hours }, timestamp: Date.now() };
    });
    setLogs(nextLogs);
    await setDoc(doc(db, 'users', user.uid, 'challenge_data', 'logs'), { records: nextLogs }, { merge: true });
  };
  const saveStudySession = async (session) => {
    const safeSession = sanitizeStudySession(session);
    const existingSession = session.id ? studySessions.find((item) => item.id === session.id) : null;
    const sessionRef = session.id ? doc(db, 'users', user.uid, 'study_sessions', session.id) : doc(collection(db, 'users', user.uid, 'study_sessions'));
    const optimisticSession = { id: sessionRef.id, ...safeSession, createdAt: existingSession?.createdAt || Date.now(), updatedAt: Date.now() };
    const nextSessions = [...studySessions.filter((item) => item.id !== sessionRef.id), optimisticSession].sort((first, second) => first.dateKey.localeCompare(second.dateKey));
    const affectedDates = new Set([safeSession.dateKey]);
    if (existingSession?.dateKey) affectedDates.add(existingSession.dateKey);
    setStudySessions(nextSessions);
    showSaveStatus('Saving…');
    try {
      await setDoc(sessionRef, { ...safeSession, studyDate: Timestamp.fromDate(parseDateKey(safeSession.dateKey)), updatedAt: serverTimestamp(), ...(existingSession ? {} : { createdAt: serverTimestamp() }) }, { merge: !!existingSession });
      await syncStudyHabitForDates(nextSessions, affectedDates);
      showSaveStatus('Study session saved', 1800);
    } catch (error) { setStudySessions(studySessions); showSaveStatus('Could not save'); throw error; }
  };
  const deleteStudySession = async (session) => {
    const nextSessions = studySessions.filter((item) => item.id !== session.id);
    setStudySessions(nextSessions);
    showSaveStatus('Deleting…');
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'study_sessions', session.id));
      await syncStudyHabitForDates(nextSessions, new Set([session.dateKey]));
      showSaveStatus('Study session deleted', 1800);
    } catch (error) { setStudySessions(studySessions); showSaveStatus('Could not delete'); throw error; }
  };

  const previewMode = import.meta.env.DEV && new URLSearchParams(window.location.search).get('studyPreview');
  if (previewMode) {
    const previewParams = new URLSearchParams(window.location.search);
    return <StudyPreview theme={previewParams.get('theme') === 'ledger' ? 'ledger' : 'ios'} screen={previewParams.get('screen') || 'sheet'} />;
  }

  if (authLoading) {
    return (
      <div className="app-shell loading-screen" data-theme={theme} data-color-mode={resolvedColorMode}>
        <div className="loading-mark"><img src="/icon-192.png" alt="" /></div>
        <p>Preparing your day…</p>
      </div>
    );
  }

  if (!user) {
    return <div className="app-shell" data-theme={theme} data-color-mode={resolvedColorMode}><Login /></div>;
  }

  if (!userName) {
    return <div className="app-shell" data-theme={theme} data-color-mode={resolvedColorMode}><NameModal onSave={handleSaveName} /></div>;
  }

  const currentDayNumber = Math.max(1, Math.round((parseDateKey(currentDate) - parseDateKey(startDate)) / 86400000) + 1);
  const activeQuote = quotes.find((quote) => quote.id === activeQuoteId) || null;

  return (
    <div className="app-shell" data-theme={theme} data-color-mode={resolvedColorMode}>
      <header className="app-header">
        <button className="brand" onClick={() => changeView('tracker')} aria-label="Go to today">
          <span className="brand-icon"><img src="/icon-192.png" alt="" /></span>
          <span>
            <strong><span className="brand-title">100 Days</span><span className="brand-day">Day {currentDayNumber}/100</span></strong>
            <small>Day {currentDayNumber} of 100</small>
          </span>
        </button>

        <nav className="desktop-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} className="nav-item" data-active={view === id} onClick={() => changeView(id)}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <span className="save-status">{saveStatus}</span>
          <span className="avatar" title={userName}>{userName.charAt(0).toUpperCase()}</span>
          <button className="icon-button" onClick={() => signOut(auth)} aria-label="Sign out" title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="app-main">
        {view === 'tracker' && (
          <TrackerView
            tasks={tasks}
            sections={sections}
            logs={logs}
            today={today}
            theme={theme}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            updateTask={updateTask}
            onAddTask={addTask}
            studySubjects={studySubjects}
            studySources={studySources}
            studySessions={studySessions}
            onSaveStudySession={saveStudySession}
            onDeleteStudySession={deleteStudySession}
            todayCardOrder={todayCardOrder}
            todayHabitCardOrder={todayHabitCardOrder}
            onAddStudySubject={addStudySubject}
            activeQuote={activeQuote}
            onSaveQuote={saveQuote}
          />
        )}
        {view === 'dashboard' && (
          <DashboardView tasks={tasks} logs={logs} startDate={startDate} userName={userName} today={today} studySessions={studySessions} studySubjects={studySubjects} weeklyStudyGoals={weeklyStudyGoals} insightsCardOrder={insightsCardOrder} quotes={quotes} activeQuoteId={activeQuoteId} onSelectQuote={selectQuote} />
        )}
        {view === 'settings' && (
          <SettingsView
            tasks={tasks}
            sections={sections}
            theme={theme}
            colorMode={colorMode}
            onThemeChange={changeTheme}
            onColorModeChange={changeColorMode}
            onAddTask={addTask}
            onAddSection={addSection}
            onRemoveSection={removeSection}
            onRemoveTask={removeTask}
            onRemoveDefaultTasks={removeDefaultTasks}
            onRestoreDefaults={restoreDefaultTasks}
            studySubjects={studySubjects}
            studySources={studySources}
            weeklyStudyGoals={weeklyStudyGoals}
            onSaveStudySettings={saveStudySettings}
            todayCardOrder={todayCardOrder}
            todayHabitCardOrder={todayHabitCardOrder}
            insightsCardOrder={insightsCardOrder}
            sections={sections}
            onSaveCardOrder={saveCardOrder}
          />
        )}
      </main>

      <nav className="mobile-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} className="mobile-nav-item" data-active={view === id} onClick={() => changeView(id)}>
            <Icon size={21} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
