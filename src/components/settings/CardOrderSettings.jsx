import { ArrowDown, ArrowUp, LayoutDashboard, RotateCcw } from 'lucide-react';
import { DEFAULT_INSIGHTS_CARD_ORDER, DEFAULT_TODAY_CARD_ORDER } from '../../data/layout';

const TODAY_CARDS = {
  habits: { title: 'Daily habits', description: 'Your task sections and check-ins' },
  study: { title: 'Study log', description: 'Sessions and subject totals' },
  time: { title: 'Daily time log', description: 'Your 24-hour activity timeline' },
  todos: { title: 'To-do list', description: 'Your daily reminders' },
};

const INSIGHTS_CARDS = {
  salah: { title: 'Salah consistency', description: 'Prayer trend chart' },
  effort: { title: 'Daily effort', description: 'Your day-by-day effort trend' },
  study: { title: 'Study insights', description: 'Study time, goals and consistency' },
  time: { title: 'Where your time goes', description: '30-day time overview' },
  weekly: { title: 'Weekly activity', description: 'Weekly habit activity chart' },
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

export default function CardOrderSettings({ todayCardOrder, insightsCardOrder, onChange }) {
  const move = (scope, order, index, amount) => {
    const target = index + amount;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ [scope]: next });
  };

  return (
    <section className="settings-section card-order-settings">
      <div className="section-title-row">
        <div className="section-icon"><LayoutDashboard size={20} /></div>
        <div><h2>Card order</h2><p>Choose the sequence of cards on Today and Insights.</p></div>
      </div>
      <div className="card-order-grid">
        <OrderList title="Today" order={todayCardOrder} cards={TODAY_CARDS} onMove={(index, amount) => move('todayCardOrder', todayCardOrder, index, amount)} onReset={() => onChange({ todayCardOrder: DEFAULT_TODAY_CARD_ORDER })} />
        <OrderList title="Insights" order={insightsCardOrder} cards={INSIGHTS_CARDS} onMove={(index, amount) => move('insightsCardOrder', insightsCardOrder, index, amount)} onReset={() => onChange({ insightsCardOrder: DEFAULT_INSIGHTS_CARD_ORDER })} />
      </div>
    </section>
  );
} 
