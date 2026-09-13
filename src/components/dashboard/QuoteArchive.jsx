import { BookmarkCheck, History, Quote } from 'lucide-react';

const formatSavedDate = (value) => {
  const date = value?.toDate?.() || (typeof value === 'number' ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently saved';
};

export default function QuoteArchive({ quotes, activeQuoteId, onSelectQuote }) {
  return (
    <section className="quote-archive-card" aria-labelledby="quote-archive-title">
      <header className="quote-archive-header">
        <span className="quote-archive-icon"><History size={19} /></span>
        <span><span className="eyebrow">Learning library</span><h2 id="quote-archive-title">Saved quotes</h2><p>Choose any quote to show it on Today.</p></span>
      </header>

      {quotes.length ? (
        <div className="quote-archive-list">
          {quotes.map((quote) => {
            const active = quote.id === activeQuoteId;
            return (
              <button key={quote.id} type="button" className="quote-archive-row" data-active={active} onClick={() => onSelectQuote(quote.id)}>
                <Quote size={18} aria-hidden="true" />
                <span><strong>{quote.text}</strong><small>{formatSavedDate(quote.createdAt)}</small></span>
                <em>{active ? <><BookmarkCheck size={15} /> Showing today</> : 'Show today'}</em>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="quote-archive-empty"><Quote size={22} /><span><strong>Your quote library is ready</strong><small>Save a thought from Today and it will appear here.</small></span></div>
      )}
    </section>
  );
}
