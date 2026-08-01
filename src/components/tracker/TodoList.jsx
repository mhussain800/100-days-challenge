import { Check, ListTodo, Plus, Trash2 } from 'lucide-react';

const blankTodos = () => [
  { id: 1, text: '', checked: false },
  { id: 2, text: '', checked: false },
  { id: 3, text: '', checked: false },
];

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
            <textarea
              value={todo.text}
              onChange={(event) => updateText(todo.id, event.target.value)}
              onInput={(event) => {
                event.currentTarget.style.height = 'auto';
                event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
              }}
              placeholder="What else needs your attention?"
              rows={1}
            />
            <button className="todo-remove" onClick={() => removeTodo(todo.id)} aria-label="Remove to-do"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>

      <button className="text-button add-todo" onClick={addTodo}><Plus size={15} /> Add to-do</button>
    </section>
  );
}
