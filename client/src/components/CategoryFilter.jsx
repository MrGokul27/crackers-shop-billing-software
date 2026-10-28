import React from 'react';

const CATEGORIES = [
  { id: 'All', label: 'All Crackers', emoji: '🌟' },
  { id: 'SINGLE SHOT CRACKERS', label: 'Single Shot Crackers', emoji: '💥' },
  { id: 'SPARKLERS', label: 'Sparklers', emoji: '✨' },
  { id: 'CHAKKARS', label: 'Chakkars', emoji: '🌀' },
  { id: 'TWINKLING STARS', label: 'Twinkling Stars', emoji: '⭐' },
  { id: 'CANDLES & LIGHTS', label: 'Candles & Lights', emoji: '🕯️' },
  { id: 'FLOWER POTS', label: 'Flower Pots', emoji: '🪴' },
  { id: 'ATOM BOMBS', label: 'Atom Bombs', emoji: '💣' },
  { id: 'LOOSE CRACKERS', label: 'Loose Crackers', emoji: '🧨' },
  { id: 'FANCY VARIETIES', label: 'Fancy Varieties', emoji: '🎇' },
  { id: 'TIN', label: 'Tin', emoji: '🥫' },
  { id: 'PEACOCK BIG', label: 'Peacock Big', emoji: '🦚' },
  { id: 'SHOTS', label: 'Shots', emoji: '🎆' },
  { id: '3 EFFECT SERIES', label: '3 Effect Series', emoji: '🌠' },
  { id: 'COLOUR SMOKE', label: 'Colour Smoke', emoji: '💨' },
  { id: 'GIFT BOXES', label: 'Gift Boxes', emoji: '🎁' },
  { id: 'ROCKETS', label: 'Rockets', emoji: '🚀' },
  { id: 'OTHERS', label: 'Others', emoji: '🏷️' }
];

export default function CategoryFilter({ activeCategory, onSelectCategory, counts }) {
  // Include any custom categories created via "Others" before the "Others" pill
  const customCategories = Object.keys(counts || {})
    .filter(catName =>
      catName &&
      !CATEGORIES.some(c => c.id.toLowerCase() === catName.toLowerCase())
    )
    .map(catName => ({
      id: catName,
      label: catName
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase()),
      emoji: '🏷️'
    }));

  const allCategories = [
    ...CATEGORIES.slice(0, -1),
    ...customCategories,
    CATEGORIES[CATEGORIES.length - 1]
  ];

  return (
    <div className="category-strip shadow-sm">
      {allCategories.map(cat => {
        const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();
        const matchingKey = Object.keys(counts || {}).find(
          k => k.toLowerCase() === cat.id.toLowerCase()
        );
        const count = matchingKey ? counts[matchingKey] : 0;
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
