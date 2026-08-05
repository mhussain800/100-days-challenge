import { Check, Copy, ListTodo, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { parseDateKey, toDateKey } from '../../utils/helpers';

const blankTodos = () => [
  { id: 1, text: '', checked: false },
  { id: 2, text: '', checked: false },
  { id: 3, text: '', checked: false },
];

const AutoResizeTextarea = ({ value, onChange, placeholder }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={1}
    />
  );
};

export default function TodoList({ date, logs, updateLog }) {
  const savedTodos = logs[date]?.todos?.list || blankTodos();
  const handleUpdate = (newTodos) => updateLog(date, 'todos', newTodos);

  const toggleCheck = (id) => {
    handleUpdate(savedTodos.map((todo) => todo.id === id ? { ...todo, checked: !todo.checked } : todo));
  };

  const updateText = (id, value) => {
    handleUpdate(savedTodos.map((todo) => todo.id === id ? { ...todo, text: value } : todo));
  };

  const addTodo = () => handleUpdate([...savedTodos, { id: Date.now(), text: '', checked: false }]);
  const removeTodo = (id) => handleUpdate(savedTodos.filter((todo) => todo.id !== id));

  const copyUnDoneFromYesterday = () => {
    const prevDateObj = parseDateKey(date);
    prevDateObj.setDate(prevDateObj.getDate() - 1);
    const prevDateKey = toDateKey(prevDateObj);
    
    const prevTodos = logs[prevDateKey]?.todos?.list || [];
    
    // STRICT check: must explicitly be undone (not true, not 'true') and must have text
    const unDoneTodos = prevTodos.filter(todo => {
      const isChecked = todo.checked === true || String(todo.checked) === 'true';
      const hasText = typeof todo.text === 'string' && todo.text.trim() !== '';
      return !isChecked && hasText;
    });
    
    if (unDoneTodos.length === 0) return;
    
    const currentTodos = savedTodos.filter(todo => (typeof todo.text === 'string' && todo.text.trim() !== '') || todo.checked === true); 
    const existingTexts = new Set(currentTodos.map(t => t.text.trim().toLowerCase()));

    const newTodos = [];
    unDoneTodos.forEach((todo, index) => {
      if (!existingTexts.has(todo.text.trim().toLowerCase())) {
        newTodos.push({
          id: Date.now() + index,
          text: todo.text,
          checked: false
        });
        existingTexts.add(todo.text.trim().toLowerCase());
      }
    });

    if (newTodos.length > 0) {
      handleUpdate([...currentTodos, ...newTodos]);
    }
  };

  return (
    <section className="tool-card todo-card">
      <header className="tool-card-header">
        <span className="tool-icon"><ListTodo size={19} /></span>
        <span><strong>Daily to-do</strong><small>Small wins outside your habits</small></span>
      </header>

      <div className="todo-list">
        {savedTodos.map((todo) => (
          <div key={todo.id} className="todo-row" data-complete={todo.checked}>
            <button
              className="todo-check"
              onClick={() => toggleCheck(todo.id)}
              aria-label={`${todo.checked ? 'Uncheck' : 'Complete'} ${todo.text || 'to-do'}`}
            >
              {todo.checked && <Check size={13} strokeWidth={3} />}
            </button>
            <AutoResizeTextarea
              value={todo.text}
              onChange={(value) => updateText(todo.id, value)}
              placeholder="What else needs your attention?"
            />
            <button className="todo-remove" onClick={() => removeTodo(todo.id)} aria-label="Remove to-do"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '13px' }}>
        <button className="text-button" onClick={addTodo}><Plus size={15} /> Add to-do</button>
        <button className="text-button" onClick={copyUnDoneFromYesterday}><Copy size={15} /> Copy un-done</button>
      </div>
    </section>
  );
}
