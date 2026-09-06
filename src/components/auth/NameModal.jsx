import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function NameModal({ onSave }) {
  const [name, setName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (name.trim()) onSave(name.trim());
  };

  return (
    <div className="modal-backdrop onboarding-backdrop">
      <div className="onboarding-card">
        <span className="onboarding-icon"><Sparkles size={24} /></span>
        <span className="eyebrow">One last detail</span>
        <h1>What should we call you?</h1>
        <p>We&apos;ll use this to make your journey feel like your own.</p>
        <form onSubmit={handleSubmit}>
          <label className="field"><span>Your name</span><input className="form-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" autoFocus required /></label>
          <button className="primary-button" type="submit">Begin my journey <ArrowRight size={17} /></button>
        </form>
      </div>
    </div>
  );
}
