import { useEffect, useRef, useState } from 'react';
import {
  CalendarCheck,
  ChartNoAxesColumnIncreasing,
  LogOut,
  Settings,
} from 'lucide-react';

import { DEFAULT_SECTIONS, DEFAULT_TASKS, normalizeSections, normalizeTasks } from './data/tasks';
import { getToday, parseDateKey } from './utils/helpers';

import Login from './components/auth/Login';
import NameModal from './components/auth/NameModal';
import TrackerView from './components/tracker/TrackerView';
import DashboardView from './components/dashboard/DashboardView';
import SettingsView from './components/settings/SettingsView';

import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';

const VALID_THEMES = new Set(['ios', 'ledger']);
const VALID_COLOR_MODES = new Set(['light', 'dark', 'system']);
const DEFAULT_THEME = 'ios';
const DEFAULT_COLOR_MODE = 'system';

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
  const resolvedColorMode = colorMode === 'system' ? (systemDark ? 'dark' : 'light') : colorMode;

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
        localStorage.setItem('challenge_theme', DEFAULT_THEME);
        localStorage.setItem('challenge_color_mode', DEFAULT_COLOR_MODE);
        return;
      }

      const preferences = docSnap.data();
      const savedTasks = normalizeTasks(preferences.tasks);
      setTasks(savedTasks);
      setSections(normalizeSections(preferences.sections, savedTasks));

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
  } = {}) => {
    const safeTasks = normalizeTasks(nextTasks);
    const safeTheme = VALID_THEMES.has(nextTheme) ? nextTheme : DEFAULT_THEME;
    const safeColorMode = VALID_COLOR_MODES.has(nextColorMode) ? nextColorMode : DEFAULT_COLOR_MODE;
    const safeSections = normalizeSections(nextSections, safeTasks);

    setTasks(safeTasks);
    setSections(safeSections);
    setTheme(safeTheme);
    setColorMode(safeColorMode);
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
        updatedAt: Date.now(),
      }, { merge: true });
      showSaveStatus('Saved', 1800);
    } catch (error) {
      console.error('Preferences save error:', error);
      showSaveStatus('Could not save');
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

  return (
    <div className="app-shell" data-theme={theme} data-color-mode={resolvedColorMode}>
      <header className="app-header">
        <button className="brand" onClick={() => setView('tracker')} aria-label="Go to today">
          <span className="brand-icon"><img src="/icon-192.png" alt="" /></span>
          <span>
            <strong><span className="brand-title">100 Days</span><span className="brand-day">Day {currentDayNumber}/100</span></strong>
            <small>Day {currentDayNumber} of 100</small>
          </span>
        </button>

        <nav className="desktop-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} className="nav-item" data-active={view === id} onClick={() => setView(id)}>
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
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            updateTask={updateTask}
            onAddTask={addTask}
          />
        )}
        {view === 'dashboard' && (
          <DashboardView tasks={tasks} logs={logs} startDate={startDate} userName={userName} today={today} />
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
          />
        )}
      </main>

      <nav className="mobile-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} className="mobile-nav-item" data-active={view === id} onClick={() => setView(id)}>
            <Icon size={21} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
