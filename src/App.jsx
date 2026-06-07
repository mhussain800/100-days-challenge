import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronLeft, ChevronRight, Activity, LogOut } from 'lucide-react';

// Data & Helpers
import { TASKS } from './data/tasks';
import { getToday } from './utils/helpers';

// Components
import Login from './components/auth/Login';
import NameModal from './components/auth/NameModal';
import TrackerView from './components/tracker/TrackerView';
import DashboardView from './components/dashboard/DashboardView';

// Firebase Connection
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null); 
  const [userName, setUserName] = useState(null); 
  
  const [logs, setLogs] = useState({});
  const [currentDate, setCurrentDate] = useState(getToday());
  const [view, setView] = useState('tracker'); 
  const [startDate, setStartDate] = useState(getToday()); 
  const [saveStatus, setSaveStatus] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  
  const saveTimeoutRef = useRef(null);

  // 1. Listen for User Login / Logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch the user's name from Firestore
        const profileRef = doc(db, 'users', currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists() && profileSnap.data().name) {
          setUserName(profileSnap.data().name);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Listen to Firestore for Real-time Data Sync
  useEffect(() => {
    if (!user) return;

    const logsRef = doc(db, 'users', user.uid, 'challenge_data', 'logs');
    
    const unsubscribe = onSnapshot(logsRef, (docSnap) => {
      if (docSnap.exists()) {
        const fetchedLogs = docSnap.data().records || {};
        setLogs(fetchedLogs);
        
        if (Object.keys(fetchedLogs).length > 0) {
          setStartDate(Object.keys(fetchedLogs).sort()[0]);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Save User Name to Firestore
  const handleSaveName = async (name) => {
    setUserName(name);
    if (user) {
      const profileRef = doc(db, 'users', user.uid);
      await setDoc(profileRef, { name: name }, { merge: true });
    }
  };

  // 4. Update Tasks and Save to Firestore
  const updateTask = (taskId, field, value) => {
    const currentDayData = logs[currentDate] || {};
    const updatedTask = { ...(currentDayData[taskId] || {}), [field]: value };
    const updatedDay = { ...currentDayData, [taskId]: updatedTask, timestamp: Date.now() };
    
    // Optimistic UI update (feels instant to the user)
    const newLogs = { ...logs, [currentDate]: updatedDay };
    setLogs(newLogs);
    
    // Cloud Save Sync
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus('Saving...');
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const logsRef = doc(db, 'users', user.uid, 'challenge_data', 'logs');
        await setDoc(logsRef, { records: newLogs }, { merge: true });
        setSaveStatus('Saved');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        console.error("Save Error:", error);
        setSaveStatus('Error saving');
      }
    }, 500);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center font-serif text-xl italic text-[#2c2b2a]">Loading Ledger...</div>;
  }

  if (!user) return <Login />;
  
  if (user && !userName) return <NameModal onSave={handleSaveName} />;

  const currentDayNumber = Math.floor((new Date(currentDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#2c2b2a] font-serif selection:bg-[#d4cfc1] overflow-x-hidden flex flex-col">
      <header className="px-2 md:px-4 py-2 border-b border-[#e5e0d3] flex items-center justify-between sticky top-0 bg-[#fdfbf7]/95 backdrop-blur z-10 shadow-sm">
        <div className="flex items-baseline gap-2 md:gap-4 shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold italic tracking-tight">Day {currentDayNumber < 1 ? 1 : currentDayNumber}/100</h1>
          <span className="text-sm text-gray-500 font-mono tracking-widest uppercase hidden lg:inline">
            Welcome, {userName}
          </span>
          <span className="text-xs text-gray-400 font-mono tracking-widest uppercase hidden md:inline">{saveStatus}</span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {view === 'tracker' && (
            <div className="flex items-center gap-1 md:gap-2 bg-[#f2efe6] rounded-full px-1 md:px-2 py-1 border border-[#e5e0d3]">
              <button onClick={() => {
                const d = new Date(currentDate); d.setDate(d.getDate() - 1);
                setCurrentDate(d.toISOString().split('T')[0]);
              }} className="p-1 hover:bg-[#e5e0d3] rounded-full transition"><ChevronLeft size={16} /></button>
              
              <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="font-mono text-xs md:text-sm bg-transparent border-none outline-none text-center w-[110px] md:w-auto" />
              
              <button onClick={() => {
                const d = new Date(currentDate); d.setDate(d.getDate() + 1);
                setCurrentDate(d.toISOString().split('T')[0]);
              }} className="p-1 hover:bg-[#e5e0d3] rounded-full transition"><ChevronRight size={16} /></button>
            </div>
          )}

          <button onClick={() => setView(v => v === 'tracker' ? 'dashboard' : 'tracker')} className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 bg-[#2c2b2a] text-[#fdfbf7] rounded text-xs md:text-sm tracking-wide font-mono hover:bg-[#1a1918] transition whitespace-nowrap">
            {view === 'tracker' ? <><Activity size={14}/> <span className="hidden sm:inline">Dashboard</span></> : <><Check size={14}/> <span className="hidden sm:inline">Tracker</span></>}
          </button>
          
          <button onClick={handleLogout} className="p-1.5 hover:bg-[#e5e0d3] rounded transition text-gray-500 hover:text-red-600" title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 w-full max-w-[1600px] mx-auto">
        {view === 'tracker' 
          ? <TrackerView tasks={TASKS} logs={logs} currentDate={currentDate} updateTask={updateTask} />
          : <DashboardView tasks={TASKS} logs={logs} startDate={startDate} userName={userName} />
        }
      </main>
    </div>
  );
}