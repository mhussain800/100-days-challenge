import React, { useState } from 'react';

export default function NameModal({ onSave }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) onSave(name.trim());
  };

  return (
    <div className="fixed inset-0 bg-[#2c2b2a]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#fdfbf7] p-8 rounded shadow-2xl w-full max-w-sm border border-[#e5e0d3]">
        <h2 className="text-2xl italic font-serif text-[#2c2b2a] mb-2">Welcome to the Ledger</h2>
        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-6">How should we address you?</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full border-b-2 border-gray-300 py-2 bg-transparent focus:border-gray-800 outline-none transition font-mono text-lg"
            autoFocus
            required
          />
          <button 
            type="submit" 
            className="w-full bg-[#2c2b2a] text-[#fdfbf7] py-3 rounded font-mono uppercase tracking-widest text-sm hover:bg-[#1a1918] transition"
          >
            Begin Journey
          </button>
        </form>
      </div>
    </div>
  );
}