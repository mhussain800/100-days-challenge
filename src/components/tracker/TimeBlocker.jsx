import React, { useState } from 'react';

// Vintage-inspired color palette for the updated categories
const TIME_CATEGORIES = [
  { id: 'sleep', label: 'Sleep', color: '#7c7287' },           // Muted Purple
  { id: 'worship', label: 'Religion & Prayer', color: '#84937d' }, // Sage Green
  { id: 'work', label: 'Work', color: '#6e7f91' },             // Slate Blue
  { id: 'study', label: 'Study', color: '#5c838a' },           // Deep Teal
  { id: 'exercise', label: 'Exercise/Gym', color: '#a67c6d' },   // Terracotta
  { id: 'social_media', label: 'Social Media/Screen Time', color: '#c48f6a' }, // Soft Amber
  { id: 'social', label: 'Social', color: '#a87c82' },         // Dusty Rose
  { id: 'family', label: 'Family', color: '#9c6f76' },         // Deep Rose
  { id: 'friends', label: 'Friends', color: '#bd8491' },       // Soft Pink
  { id: 'read', label: 'Read', color: '#8b999c' },             // Muted Slate
  { id: 'bored', label: 'Bored/Doing Nothing', color: '#baa290' }, // Soft Taupe
  { id: 'chores', label: 'Chores', color: '#94a1a6' },         // Light Steel Gray
  { id: 'waste', label: 'Waste of Time & Life', color: '#3d3c3c' } // Charcoal Gray
];

export default function TimeBlocker({ date, logs, updateLog }) {
  // Load saved 24-hour array or create a blank one
  const rawData = logs[date]?.timeBlocks?.list || logs[date]?.timeBlocks;
  const blocks = Array.isArray(rawData) ? rawData : Array(24).fill(null);
  
  // Keep track of which hours the user is currently selecting
  const [selectedHours, setSelectedHours] = useState([]);

  const toggleHour = (hour) => {
    if (selectedHours.includes(hour)) {
      setSelectedHours(selectedHours.filter(h => h !== hour));
    } else {
      setSelectedHours([...selectedHours, hour]);
    }
  };

  const assignCategory = (categoryId) => {
    if (selectedHours.length === 0) return;
    
    const newBlocks = [...blocks];
    selectedHours.forEach(hour => {
      newBlocks[hour] = categoryId;
    });
    
    updateLog(date, 'timeBlocks', newBlocks);
    setSelectedHours([]); // Clear selection after assigning
  };

  const clearSelection = () => {
    assignCategory(null);
  };

  // Helper to format 24h to 12h for the tooltips and labels
  const formatHourText = (idx) => {
    if (idx === 0) return '12A';
    if (idx < 12) return `${idx}A`;
    if (idx === 12) return '12P';
    return `${idx - 12}P`;
  };

  return (
    <div className="mt-8 mb-6 bg-white rounded p-5 border border-[#e5e0d3] shadow-sm">
      <h3 className="text-xl italic font-serif text-[#2c2b2a] mb-5 border-b border-[#e5e0d3] pb-2">
        Daily Time Log
      </h3>

      <div className="relative pt-6"> {/* Added padding-top to make room for the top row */}
        
        {/* Row 1: Even Hours ABOVE the Bar */}
        <div className="flex w-full text-[9px] font-mono text-gray-500 mb-1.5 select-none">
          {Array.from({ length: 24 }).map((_, idx) => (
            <div key={`top-${idx}`} className="flex-1 text-center font-bold">
              {idx % 2 === 0 ? formatHourText(idx).replace('A', ' AM').replace('P', ' PM') : ''}
            </div>
          ))}
        </div>

        {/* The Single 24-Hour Interactive Bar */}
        <div className="flex w-full h-11 border-2 border-[#2c2b2a] rounded-sm overflow-hidden bg-[#fdfbf7]">
          {blocks.map((catId, index) => {
            const category = TIME_CATEGORIES.find(c => c.id === catId);
            const isSelected = selectedHours.includes(index);
            
            return (
              <div 
                key={index}
                onClick={() => toggleHour(index)}
                className={`flex-1 border-r border-[#e5e0d3] last:border-0 cursor-pointer transition-all relative group
                  ${isSelected ? 'bg-gray-300 opacity-80' : ''}
                `}
                style={{ backgroundColor: !isSelected && category ? category.color : undefined }}
              >
                {/* Tooltip on hover/tap */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#2c2b2a] text-[#fdfbf7] text-[10px] font-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                  {formatHourText(index).replace('A', ' AM').replace('P', ' PM')} - {category ? category.label : 'Empty'}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Row 2: Odd Hours BELOW the Bar */}
        <div className="flex w-full text-[9px] font-mono text-gray-500 mt-1.5 select-none">
          {Array.from({ length: 24 }).map((_, idx) => (
            <div key={`bottom-${idx}`} className="flex-1 text-center">
              {idx % 2 !== 0 ? formatHourText(idx).replace('A', ' AM').replace('P', ' PM') : ''}
            </div>
          ))}
        </div>

      </div>

      {/* Action Buttons */}
      <div className={`mt-5 transition-opacity duration-300 ${selectedHours.length > 0 ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <p className="text-xs font-mono text-[#2c2b2a] mb-2 uppercase tracking-wider">
          Assign selected hours ({selectedHours.length}) to:
        </p>
        <div className="flex flex-wrap gap-2">
          {TIME_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => assignCategory(cat.id)}
              className="px-3 py-1.5 text-xs font-bold text-white rounded-sm shadow-sm hover:scale-105 transition-transform"
              style={{ backgroundColor: cat.color }}
            >
              {cat.label}
            </button>
          ))}
          <button
            onClick={clearSelection}
            className="px-3 py-1.5 text-xs font-bold text-[#2c2b2a] border border-[#2c2b2a] rounded-sm hover:bg-gray-100 transition-colors"
          >
            Clear Selected
          </button>
        </div>
      </div>
    </div>
  );
}