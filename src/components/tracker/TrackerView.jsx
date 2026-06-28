import React from 'react';
import TaskRow from './TaskRow';
import TodoList from './TodoList';
import TimeBlocker from './TimeBlocker';

export default function TrackerView({ tasks, logs, currentDate, updateTask }) {
  const currentLog = logs[currentDate] || {};
  const grouped = tasks.reduce((acc, task) => {
    (acc[task.category] = acc[task.category] || []).push(task);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4 items-start">
      {Object.entries(grouped).map(([category, catTasks]) => (
        <div key={category} className="border border-[#e5e0d3] rounded bg-white shadow-sm overflow-hidden">
          <h2 className="bg-[#f2efe6] px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-gray-600 border-b border-[#e5e0d3]">{category}</h2>
          <div className="divide-y divide-dotted divide-[#e5e0d3]">
            {catTasks.map(task => (
              <TaskRow key={task.id} task={task} value={currentLog[task.id] || {}} onChange={(field, val) => updateTask(task.id, field, val)} />
            ))}
          </div>
        </div>
      ))}
      
      <TimeBlocker date={currentDate} logs={logs} updateLog={(date, field, val) => updateTask(field, 'list', val)} />
      {/* FIX: Mapped updateLog to use your existing updateTask function */}
      <TodoList 
        date={currentDate} 
        logs={logs} 
        updateLog={(_, __, newTodos) => updateTask('todos', 'list', newTodos)} 
      />
    </div>
  );
}