import React from 'react';

// Syncing the exact same categories from TimeBlocker
const TIME_CATEGORIES = [
  { id: 'sleep', label: 'Sleep', color: '#7c7287' },
  { id: 'worship', label: 'Religion & Prayer', color: '#84937d' },
  { id: 'work', label: 'Work', color: '#6e7f91' },
  { id: 'study', label: 'Study', color: '#5c838a' },
  { id: 'exercise', label: 'Exercise/Gym', color: '#a67c6d' },
  { id: 'screen', label: 'Screen Time', color: '#b59a70' },
  { id: 'social_media', label: 'Social Media', color: '#c48f6a' },
  { id: 'social', label: 'Social', color: '#a87c82' },
  { id: 'family', label: 'Family', color: '#9c6f76' },
  { id: 'friends', label: 'Friends', color: '#bd8491' },
  { id: 'read', label: 'Read', color: '#8b999c' },
  { id: 'bored', label: 'Bored/Doing Nothing', color: '#baa290' },
  { id: 'chores', label: 'Chores', color: '#94a1a6' },
  { id: 'waste', label: 'Waste of Time & Life', color: '#3d3c3c' }
];

export default function TimeGraph({ logs, today }) {
  const getPast30Days = () => {
    const dates = [];
    const baseDate = today ? new Date(today) : new Date(); 
    for (let i = 0; i < 30; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const past30Dates = getPast30Days();
  
  const categoryTotals = {};
  TIME_CATEGORIES.forEach(cat => { categoryTotals[cat.id] = 0; });
  
  past30Dates.forEach(date => {
    const blocks = logs[date]?.timeBlocks?.list || logs[date]?.timeBlocks;
    if (Array.isArray(blocks)) {
      blocks.forEach(catId => {
        if (catId && categoryTotals[catId] !== undefined) {
          categoryTotals[catId] += 1;
        }
      });
    }
  });

  const chartData = TIME_CATEGORIES.map(cat => {
    const totalHours = categoryTotals[cat.id];
    const averageHours = totalHours / 30;
    return { ...cat, averageHours, totalHours };
  }).sort((a, b) => b.totalHours - a.totalHours);

  return (
    <div className="border border-[#e5e0d3] rounded bg-white shadow-sm p-5 max-w-xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif italic text-[#2c2b2a]">How we spend our time</h2>
        <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-1">30-Day Daily Averages</p>
      </div>

      <div className="space-y-4">
        {chartData.map((item) => {
          const percentageWidth = Math.min((item.averageHours / 12) * 100, 100);
          
          return (
            <div key={item.id} className="flex items-center text-sm">
              <div className="w-28 text-right font-serif text-[#2c2b2a] pr-3 truncate" title={item.label}>
                {item.label}
              </div>
              <div className="flex-1 bg-[#faf9f5] h-6 relative border-l border-gray-300">
                {item.totalHours > 0 && (
                  <div 
                    className="h-full transition-all duration-500 shadow-inner"
                    style={{ width: `${percentageWidth}%`, backgroundColor: item.color }}
                  />
                )}
              </div>
              <div className="w-16 pl-3 font-mono text-xs text-gray-500">
                {item.averageHours > 0 ? `${item.averageHours.toFixed(1)}h/d` : '0h'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex text-[10px] font-mono text-gray-400 mt-4 border-t border-dashed border-[#e5e0d3] pt-2">
        <div className="w-28"></div>
        <div className="flex-1 flex justify-between px-1">
          <span>0h</span><span>4h</span><span>8h</span><span>12h+</span>
        </div>
        <div className="w-16"></div>
      </div>
    </div>
  );
}