import React from 'react';

export default function TaskRow({ task, value, onChange }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 hover:bg-[#faf9f5] group transition-colors min-h-[40px]">
      {/* FIX: Removed 'truncate' and added 'break-words whitespace-normal' */}
      <span className="text-[17px] leading-tight break-words whitespace-normal pr-2 w-1/2" title={task.label}>
        {task.label}
      </span>
      <div className="flex items-center gap-2 justify-end w-1/2">
        {task.type === 'bool' && (
          <input type="checkbox" checked={!!value.checked} onChange={(e) => onChange('checked', e.target.checked)} className="w-4 h-4 accent-gray-800 cursor-pointer" />
        )}
        {task.type.startsWith('bool_') && (
          <div className="flex items-center gap-2 w-full justify-end">
            {value.checked && (
              <>
                {task.type === 'bool_select' && (
                  <select value={value.val || task.options[0]} onChange={(e) => onChange('val', e.target.value)} className="font-mono text-xs cursor-pointer border-b border-transparent hover:border-gray-300 w-full text-gray-900 font-bold">
                    {task.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                )}
                {(task.type === 'bool_num' || task.type === 'bool_text') && (
                  <input type={task.type === 'bool_num' ? 'number' : 'text'} value={value.val || ''} onChange={(e) => onChange('val', e.target.value)} placeholder={task.placeholder || '...'} className="w-full min-w-[50px] font-mono text-xs border-b border-gray-300 focus:border-gray-800 transition px-1 text-right" />
                )}
                {task.type === 'bool_time' && (
                  <input type="time" value={value.val || ''} onChange={(e) => onChange('val', e.target.value)} className="w-[85px] font-mono text-xs border-b border-gray-300 focus:border-gray-800 transition px-1" />
                )}
                {task.type === 'bool_time_slept' && (
                  <div className="flex items-center gap-1 w-full justify-end">
                    <span className="text-[10px] text-gray-400 font-mono">Slept:</span>
                    <input type="time" value={value.val || ''} onChange={(e) => onChange('val', e.target.value)} className="font-mono text-xs w-[85px] border-b border-gray-300 focus:border-gray-800 transition" />
                  </div>
                )}
              </>
            )}
            <input type="checkbox" checked={!!value.checked} onChange={(e) => onChange('checked', e.target.checked)} className="w-4 h-4 accent-gray-800 cursor-pointer flex-shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}