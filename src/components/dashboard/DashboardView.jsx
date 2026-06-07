import React, { useMemo } from 'react';
import SalahGraph from './SalahGraph';
import { getDaysArray, getToday } from '../../utils/helpers';

export default function DashboardView({ tasks, logs, startDate, userName }) {
  const days100 = useMemo(() => getDaysArray(startDate, 100), [startDate]);
  const today = getToday();

  const isCompleted = (task, dataObj) => {
    if (!dataObj) return false;
    switch(task.type) {
      case 'bool': return !!dataObj.checked;
      case 'bool_select': return !!dataObj.checked && (dataObj.val || task.options[0]) !== 'Qaza';
      default: return !!dataObj.checked;
    }
  };

  const getStreak = (task) => {
    let streak = 0;
    const sortedDays = Object.keys(logs).sort().reverse();
    for (let day of sortedDays) {
      if (day > today) continue; 
      if (isCompleted(task, logs[day]?.[task.id])) streak++;
      else if (day < today) break;
    }
    return streak;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-[#2c2b2a] text-[#fdfbf7] p-6 rounded shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-3xl italic mb-1">{userName}'s Dashboard</h2>
          <p className="font-mono text-sm opacity-80">Track your consistency across 100 days.</p>
        </div>
      </div>
      <SalahGraph logs={logs} days100={days100} today={today} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tasks.map(task => {
          const streak = getStreak(task);
          return (
            <div key={task.id} className="border border-[#e5e0d3] rounded bg-white p-4 flex flex-col hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg leading-tight w-2/3">{task.label}</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-[#2c2b2a]">{streak}</div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Streak</div>
                </div>
              </div>
              <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-[2px] mt-auto">
                {days100.map(day => {
                  const done = isCompleted(task, logs[day]?.[task.id]);
                  const isFuture = day > today;
                  let bgColor = done ? 'bg-[#4a4844]' : (!isFuture && day <= today ? 'bg-[#eab308]/20' : 'bg-[#f2efe6]');
                  return <div key={day} className={`w-full aspect-square rounded-[1px] ${bgColor} ${isFuture ? 'opacity-30' : ''}`} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}