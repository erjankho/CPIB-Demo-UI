import React from 'react';

export function StatTile({ label, value, footnote }) {
  return (
    <div className="stat-tile">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {footnote && <div className="stat-footnote">{footnote}</div>}
    </div>
  );
}
