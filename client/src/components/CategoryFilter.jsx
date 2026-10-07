import React from 'react';

const CATEGORIES = [
  { id: 'All', label: 'All Crackers', emoji: '🌟' },
  { id: 'Sparklers', label: 'Sparklers (மத்தாப்பு)', emoji: '✨' },
  { id: 'Flower Pots', label: 'Flower Pots (பூந்தொட்டி)', emoji: '🪴' },
  { id: 'Chakra', label: 'Ground Chakra (சக்கரம்)', emoji: '🌀' },
  { id: 'Rockets', label: 'Rockets (ராக்கெட்)', emoji: '🚀' },
  { id: 'Sound Crackers', label: 'Sound Crackers (வெடி)', emoji: '💥' },
  { id: 'Garlands', label: 'Garlands (சரவெடி)', emoji: '🧨' },
  { id: 'Sky Shots', label: 'Sky Shots (வானவெடி)', emoji: '🎆' },
  { id: 'Kids Special', label: 'Kids Special', emoji: '🍿' },
  { id: 'Gift Box', label: 'Gift Box', emoji: '🎁' }
];

export default function CategoryFilter({ activeCategory, onSelectCategory, counts }) {
  return (
    <div className="category-strip shadow-sm">
      {CATEGORIES.map(cat => {
        const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();
        const count = counts?.[cat.id] || 0;
        return (
          <button
            key={cat.id}
            type="button"
            className={`cat-pill ${isActive ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
            {cat.id !== 'All' && count > 0 && (
              <span className={`badge rounded-pill ${isActive ? 'bg-light text-dark' : 'bg-secondary bg-opacity-25 text-dark'}`} style={{ fontSize: '0.7rem' }}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
