import React from 'react';

const TIME_CATEGORIES = [
  { id: 'sleep', label: 'Sleep', color: '#7c7287' },
  { id: 'worship', label: 'Worship', color: '#84937d' },
  { id: 'work', label: 'Work/Study', color: '#6e7f91' },
  { id: 'exercise', label: 'Exercise', color: '#a67c6d' },
  { id: 'screen', label: 'Screen Time', color: '#b59a70' },
  { id: 'social', label: 'Social/Family', color: '#a87c82' },
  { id: 'read', label: 'Read/Relax', color: '#8b999c' }
];

export default function WeeklyGraph({ logs, today }) {
  // Get last 7 days in chronological order (left to right)
  const getPast7Days = () => {
    const dates = [];
    const baseDate = today ? new Date(today) : new Date();
    
    // Loop backwards so the oldest day is first (left side of graph)
    for (let i = 6; i >= 0; i--) { 
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const past7Dates = getPast7Days();

  // Helper to get day names like "Mon", "Tue"
  const getDayName = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Process data for the stacked columns
  const chartData = past7Dates.map(date => {
    const blocks = logs[date]?.timeBlocks?.list || logs[date]?.timeBlocks;
    const validBlocks = Array.isArray(blocks) ? blocks : [];
    
    const dayTotals = {};
    let totalTracked = 0;
    
    validBlocks.forEach(catId => {
      if (catId) {
        dayTotals[catId] = (dayTotals[catId] || 0) + 1;
        totalTracked++;
      }
    });

    const segments = Object.entries(dayTotals).map(([id, hours]) => {
      const category = TIME_CATEGORIES.find(c => c.id === id);
      return { 
        id, 
        hours, 
        color: category ? category.color : '#ccc',
        label: category ? category.label : 'Unknown' // <-- We added this line!
      };
    });

    return { date, dayName: getDayName(date), totalTracked, segments };
  });

  return (
    <div className="border border-[#e5e0d3] rounded bg-white shadow-sm p-5 max-w-xl mx-auto mt-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-serif italic text-[#2c2b2a]">Weekly Time Ledger</h2>
        <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-1">Last 7 Days</p>
      </div>

      {/* Graph Area */}
      <div className="relative h-48 w-full flex items-end justify-between px-2 pb-6 border-b border-dashed border-[#e5e0d3]">
        
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none z-0">
          {[24, 18, 12, 6, 0].map(h => (
            <div key={h} className="w-full border-t border-[#f2efe6] flex items-start">
              <span className="text-[9px] font-mono text-gray-300 -mt-2 bg-white pr-1">{h}h</span>
            </div>
          ))}
        </div>

        {/* The 7 Stacked Columns */}
        {chartData.map((day) => (
          <div key={day.date} className="relative flex flex-col justify-end w-10 sm:w-12 h-full z-10 group cursor-pointer">
            
            {/* Hover Tooltip (Total Hours) */}
            {day.totalTracked > 0 && (
              <span className="text-[10px] font-mono text-gray-500 text-center mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 w-full">
                {day.totalTracked}h
              </span>
            )}
            
            {/* Stacked Bar Logic (Scales to 24 hours max) */}
            {/* Note: Removed overflow-hidden so tooltips can break out of the box */}
            <div className="w-full flex flex-col justify-end rounded-t-sm" style={{ height: `${(day.totalTracked / 24) * 100}%` }}>
              {day.segments.map((seg, index) => (
                <div 
                  key={seg.id} 
                  // group/block allows the tooltip to trigger only when THIS specific color is hovered/tapped
                  className={`relative w-full transition-all hover:brightness-110 shadow-inner border-t border-white/20 group/block ${index === 0 ? 'rounded-t-sm' : ''}`}
                  style={{ height: `${(seg.hours / day.totalTracked) * 100}%`, backgroundColor: seg.color }}
                >
                  {/* The interactive tooltip that pops up */}
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#2c2b2a] text-[#fdfbf7] text-[10px] font-mono px-2 py-1 rounded opacity-0 group-hover/block:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md">
                    {seg.label}: {seg.hours}h
                  </div>
                </div>
              ))}
            </div>

            {/* X-Axis Day Label */}
            <span className="absolute -bottom-6 w-full text-center text-xs font-serif text-[#2c2b2a]">
              {day.dayName}
            </span>
          </div>
        ))}
      </div>
      
      {/* Visual Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {TIME_CATEGORIES.map(cat => (
          <div key={cat.id} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm shadow-sm" style={{ backgroundColor: cat.color }}></div>
            <span className="text-[10px] font-mono uppercase text-gray-500">{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}