import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useIngestion } from '../../context/IngestionContext.jsx';
import { sourceById } from '../../data/sources.js';
import { SOURCE_KINDS } from '../../data/caseData.js';
import { Badge } from './Badge.jsx';

export function EvidenceDrawer() {
  const { evidenceDrawer, closeEvidence } = useApp();
  const { ingestedSourceById } = useIngestion();
  if (!evidenceDrawer) return null;
  const source = sourceById[evidenceDrawer] ?? ingestedSourceById[evidenceDrawer];
  if (!source) return null;
  const kindMeta = SOURCE_KINDS[source.kind] ?? { label: source.kind, icon: '📁' };

  return (
    <div className="drawer-overlay" onClick={closeEvidence}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <div className="flex items-center gap-8" style={{ marginBottom: 6 }}>
              <Badge tone="accent">{source.ref}</Badge>
              <Badge tone="neutral">
                {kindMeta.icon} {kindMeta.label}
              </Badge>
              {source.status === 'transcribed' && <Badge tone="success">Transcribed</Badge>}
              {source.isNew && <Badge tone="accent">Newly ingested</Badge>}
            </div>
            <h3 style={{ margin: 0, fontSize: 15.5 }}>{source.title}</h3>
          </div>
          <button className="icon-btn" onClick={closeEvidence} aria-label="Close evidence panel">
            ✕
          </button>
        </div>
        <div className="drawer-body">
          <div className="section-label">Custody / provenance</div>
          <div className="kv-row">
            <span className="kv-key">Custodian</span>
            <span>{source.custodian}</span>
          </div>
          <div className="kv-row">
            <span className="kv-key">Languages</span>
            <span>{source.languages.join(', ')}</span>
          </div>
          <div className="kv-row">
            <span className="kv-key">Volume</span>
            <span>{source.volume}</span>
          </div>
          <div className="kv-row">
            <span className="kv-key">Ingested</span>
            <span className="mono">{new Date(source.ingestedAt).toLocaleString()}</span>
          </div>
          <div className="kv-row">
            <span className="kv-key">Entities extracted</span>
            <span>{source.entitiesExtracted}</span>
          </div>
          {source.sha256 && (
            <div className="kv-row" style={{ flexDirection: 'column', gap: 3 }}>
              <span className="kv-key">SHA-256</span>
              <span className="mono hash-text">{source.sha256}</span>
            </div>
          )}

          <div className="section-label">Cited excerpt</div>
          <div
            className="mono"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 12.5,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
            }}
          >
            {highlightExcerpt(source.excerpt, source.highlight)}
          </div>

          <div className="section-label">Chain of custody</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--text-secondary)' }}>
            <li>Seized / collected under production order, logged by IO.</li>
            <li>Hashed on ingestion; stored in isolated case evidence box.</li>
            <li>Indexed into case knowledge graph — read-only, source of truth remains the original file.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function highlightExcerpt(text, highlight) {
  if (!highlight) return text;
  const idx = text.indexOf(highlight);
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const after = text.slice(idx + highlight.length);
  return (
    <>
      {before}
      <mark style={{ background: 'rgba(251, 191, 36, 0.3)', color: 'inherit', padding: '0 2px', borderRadius: 3 }}>
        {highlight}
      </mark>
      {after}
    </>
  );
}
