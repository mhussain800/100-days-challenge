import { useState } from 'react';
import { BookmarkPlus, Plus } from 'lucide-react';

export default function TodayQuoteCard({ quote, onSaveQuote }) {
  const [draft, setDraft] = useState('');
  const [composerMode, setComposerMode] = useState(quote ? 'closed' : 'auto');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Quotes load after the initial Today render. In the initial auto mode, a
  // selected quote replaces the blank composer without a second render.
  const isComposing = !quote || composerMode === 'open';

  const saveQuote = async (event) => {
    event.preventDefault();
    if (!draft.trim()) {
      setError('Write the thought you want to remember.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSaveQuote(draft);
      setDraft('');
      setComposerMode('closed');
    } catch (saveError) {
      console.error('Quote save error:', saveError);
      setError('Could not save this quote. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="today-quote-card" aria-label="Today’s quote">
      {quote && !isComposing ? (
        <div className="today-quote-display">
          <p>{quote.text}</p>
          <button type="button" className="text-button today-quote-new" onClick={() => setComposerMode('open')}><Plus size={15} /> New</button>
        </div>
      ) : (
        <form className="today-quote-composer" onSubmit={saveQuote}>
          <label>
            <span className="sr-only">Today&apos;s quote</span>
            <textarea value={draft} maxLength="500" onChange={(event) => { setDraft(event.target.value); setError(''); }} placeholder="Something new you learned, a reminder, or a line to return to…" />
          </label>
          <div className="today-quote-actions">
            <span className="form-error" role="alert">{error}</span>
            {quote && <button type="button" className="secondary-button" onClick={() => { setComposerMode('closed'); setError(''); }}>Cancel</button>}
            <button type="submit" className="primary-button" disabled={saving}><BookmarkPlus size={16} /> {saving ? 'Saving…' : 'Save as today’s quote'}</button>
          </div>
        </form>
      )}
    </section>
  );
}
