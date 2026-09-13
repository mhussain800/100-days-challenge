import { ArrowDown, ArrowUp, LayoutDashboard, RotateCcw } from 'lucide-react';
import { DEFAULT_INSIGHTS_CARD_ORDER, DEFAULT_TODAY_CARD_ORDER, getDefaultTodayHabitCardOrder } from '../../data/layout';
import { DEFAULT_SECTIONS } from '../../data/tasks';

const TODAY_CARDS = {
  effort: { title: 'Today’s effort', description: 'Your daily effort check-in' },
  habits: { title: 'Daily habits', description: 'Your task sections and check-ins' },
  quote: { title: 'Today’s quote', description: 'Your learning reminder card' },
  study: { title: 'Study log', description: 'Sessions and subject totals' },
  time: { title: 'Daily time log', description: 'Your 24-hour activity timeline' },
  todos: { title: 'To-do list', description: 'Your daily reminders' },
};

const INSIGHTS_CARDS = {
  hero: { title: 'Greeting', description: 'Your personal Insights welcome' },
  summary: { title: 'Daily summary', description: 'Done today, tasks, streak and days logged' },
  salah: { title: 'Salah consistency', description: 'Prayer trend chart' },
  effort: { title: 'Daily effort', description: 'Your day-by-day effort trend' },
  study: { title: 'Study insights', description: 'Study time, goals and consistency' },
  studyGoals: { title: 'Subject goal progress', description: 'This week’s progress toward each study goal' },
  time: { title: 'Where your time goes', description: '30-day time overview' },
  weekly: { title: 'Weekly time', description: '7-day activity chart' },
  quotes: { title: 'Saved quotes', description: 'Your learning reminder library' },
};

function OrderList({ title, order, cards, onMove, onReset }) {
  return (
    <div className="card-order-group">
      <div className="card-order-group-heading"><strong>{title}</strong><button type="button" className="text-button" onClick={onReset}><RotateCcw size={14} /> Reset</button></div>
      <div className="card-order-list">
        {order.map((id, index) => {
          const card = cards[id];
          return (
            <div className="card-order-row" key={id}>
              <span className="card-order-number">{index + 1}</span>
              <span><strong>{card.title}</strong><small>{card.description}</small></span>
              <div className="card-order-actions">
                <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label={`Move ${card.title} up`}><ArrowUp size={15} /></button>
                <button type="button" onClick={() => onMove(index, 1)} disabled={index === order.length - 1} aria-label={`Move ${card.title} down`}><ArrowDown size={15} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CardOrderSettings({ todayCardOrder, todayHabitCardOrder, insightsCardOrder, sections, tasks, onChange }) {
  const move = (scope, order, index, amount) => {
    const target = index + amount;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ [scope]: next });
  };

  const sectionCards = Object.fromEntries(sections.map((section) => [section, {
    title: section,
    description: `${tasks.filter((task) => task.category === section).length} active task${tasks.filter((task) => task.category === section).length === 1 ? '' : 's'}`,
  }]));
  const defaultSectionOrder = [
    ...DEFAULT_SECTIONS.filter((defaultSection) => sections.some((section) => section.toLocaleLowerCase() === defaultSection.toLocaleLowerCase())),
    ...sections.filter((section) => !DEFAULT_SECTIONS.some((defaultSection) => defaultSection.toLocaleLowerCase() === section.toLocaleLowerCase())),
  ];

  return (
    <section className="settings-section card-order-settings">
      <div className="section-title-row">
        <div className="section-icon"><LayoutDashboard size={20} /></div>
        <div><h2>Card order</h2><p>Choose the sequence of cards on Today and Insights. The 100-day streak widgets stay fixed in Insights.</p></div>
      </div>
      <div className="card-order-grid">
        <div className="card-order-today-groups">
          <OrderList title="Today cards" order={todayCardOrder} cards={TODAY_CARDS} onMove={(index, amount) => move('todayCardOrder', todayCardOrder, index, amount)} onReset={() => onChange({ todayCardOrder: DEFAULT_TODAY_CARD_ORDER })} />
          <OrderList title="Daily habit sections" order={todayHabitCardOrder} cards={sectionCards} onMove={(index, amount) => move('todayHabitCardOrder', todayHabitCardOrder, index, amount)} onReset={() => onChange({ sections: defaultSectionOrder, todayHabitCardOrder: getDefaultTodayHabitCardOrder(defaultSectionOrder) })} />
        </div>
        <OrderList title="Insights" order={insightsCardOrder} cards={INSIGHTS_CARDS} onMove={(index, amount) => move('insightsCardOrder', insightsCardOrder, index, amount)} onReset={() => onChange({ insightsCardOrder: DEFAULT_INSIGHTS_CARD_ORDER })} />
      </div>
    </section>
  );
} 
