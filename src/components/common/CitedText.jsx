import React from 'react';
import { useApp } from '../../context/AppContext.jsx';

/**
 * Renders a block of text containing superscript citation markers (¹ ² ³ ...)
 * as clickable links that open the Evidence drawer. `citations` is an array
 * of { marker: number, sourceId, label }.
 */
const SUPERSCRIPTS = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

export function CitedText({ text, citations = [] }) {
  const { openEvidence } = useApp();
  if (!citations.length) return <span>{text}</span>;

  const markerBySymbol = new Map(citations.map((c) => [SUPERSCRIPTS[c.marker - 1] ?? String(c.marker), c]));
  const pattern = new RegExp(`(${[...markerBySymbol.keys()].map(escapeRegExp).join('|')})`, 'g');
  const parts = text.split(pattern);

  return (
    <span>
      {parts.map((part, i) => {
        const cite = markerBySymbol.get(part);
        if (cite) {
          return (
            <sup
              key={i}
              className="citation-link"
              title={cite.label}
              onClick={() => openEvidence(cite.sourceId)}
            >
              [{cite.marker}]
            </sup>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Small inline list of citation chips shown beneath an answer or fact. */
export function CitationList({ citations = [] }) {
  const { openEvidence } = useApp();
  if (!citations.length) return null;
  return (
    <div className="flex gap-6 wrap" style={{ marginTop: 6 }}>
      {citations.map((c) => (
        <button
          key={c.marker ?? c.sourceId}
          className="chip"
          style={{ cursor: 'pointer' }}
          onClick={() => openEvidence(c.sourceId)}
        >
          {c.marker ? `[${c.marker}] ` : ''}
          {c.label}
        </button>
      ))}
    </div>
  );
}

/** Renders a list of citeable source ids as small ref chips (EX-01, ST-03, ...) */
export function SourceRefChips({ sourceIds = [], sourcesById }) {
  const { openEvidence } = useApp();
  if (!sourceIds.length) return null;
  return (
    <div className="flex gap-6 wrap">
      {sourceIds.map((id) => {
        const src = sourcesById[id];
        if (!src) return null;
        return (
          <button key={id} className="chip" style={{ cursor: 'pointer' }} onClick={() => openEvidence(id)}>
            {src.ref}
          </button>
        );
      })}
    </div>
  );
}
