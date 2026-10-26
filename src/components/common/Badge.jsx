import React from 'react';
import { CONFIDENCE } from '../../data/caseData.js';

/** Generic colour-coded badge. `tone` one of neutral|success|danger|warning|accent */
export function Badge({ tone = 'neutral', children, dot }) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <span className="badge-dot" style={{ background: dot }} />}
      {children}
    </span>
  );
}

const CONFIDENCE_TONE = {
  corroborated: 'success',
  asserted: 'neutral',
  disputed: 'danger',
};

/** Badge pre-wired to a confidence level from CONFIDENCE in caseData.js */
export function ConfidenceBadge({ level }) {
  const meta = CONFIDENCE[level];
  if (!meta) return null;
  return (
    <Badge tone={CONFIDENCE_TONE[level] ?? 'neutral'} dot={meta.colour}>
      {meta.label}
    </Badge>
  );
}

export function Chip({ children }) {
  return <span className="chip">{children}</span>;
}
