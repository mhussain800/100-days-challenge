import React from 'react';

export default function TodoList({ date, logs, updateLog }) {
  const savedTodos = logs[date]?.todos?.list || [
    { id: 1, text: '', checked: false },
    { id: 2, text: '', checked: false },
    { id: 3, text: '', checked: false }
  ];

  const handleUpdate = (newTodos) => {
    updateLog(date, 'todos', newTodos);
  };

  const toggleCheck = (id) => {
    handleUpdate(savedTodos.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  const updateText = (id, text) => {
    handleUpdate(savedTodos.map(t => t.id === id ? { ...t, text } : t));
  };

  const addTodo = () => {
    handleUpdate([...savedTodos, { id: Date.now(), text: '', checked: false }]);
  };

  return (
    <div className="mt-8 mb-6 bg-white rounded p-5 border border-[#e5e0d3] shadow-sm">
      <h3 className="text-xl italic font-serif text-[#2c2b2a] mb-4 border-b border-[#e5e0d3] pb-2">
        Daily To-Do List
      </h3>
      
      <div className="space-y-3">
        {savedTodos.map((todo) => (
          // Changed to items-start and added mt-2 to keep checkbox aligned with top line of text
          <div key={todo.id} className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={todo.checked}
              onChange={() => toggleCheck(todo.id)}
              className="mt-2 w-6 h-6 accent-[#2c2b2a] rounded cursor-pointer shrink-0"
            />
            {/* Swapped input for an auto-expanding textarea */}
            <textarea
              value={todo.text}
              onChange={(e) => updateText(todo.id, e.target.value)}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              placeholder="Task..."
              rows={1}
              className={`flex-1 bg-transparent border-b border-dashed border-[#e5e0d3] focus:border-[#2c2b2a] outline-none text-[#2c2b2a] text-lg px-1 py-1 transition-all resize-none overflow-hidden min-h-[36px] ${
                todo.checked ? 'line-through opacity-40 italic' : ''
              }`}
            />
          </div>
        ))}
      </div>

      <button
        onClick={addTodo}
        className="mt-5 text-sm font-bold font-mono text-[#64748b] hover:text-[#2c2b2a] flex items-center gap-1 transition-colors"
      >
        + Add new task
      </button>
    </div>
  );
}