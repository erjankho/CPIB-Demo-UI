import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useIngestion } from '../../context/IngestionContext.jsx';
import { sources } from '../../data/sources.js';
import { SOURCE_KINDS } from '../../data/caseData.js';
import { Badge } from '../common/Badge.jsx';
import { StatTile } from '../common/StatTile.jsx';

const KIND_FILTERS = [
  { id: 'all', label: 'All items' },
  { id: 'whatsapp', label: 'Chat exports' },
  { id: 'statement', label: 'Statements' },
  { id: 'audio', label: 'Audio' },
  { id: 'video', label: 'Video' },
  { id: 'image', label: 'Images' },
  { id: 'document', label: 'Documents' },
  { id: 'financial', label: 'Financial' },
];

export function EvidenceBox() {
  const { openEvidence, activeCase, setActiveTab } = useApp();
  const { ingestedSources, jobs } = useIngestion();
  const [kind, setKind] = useState('all');

  // Newly ingested items for this case first, then the seeded evidence set.
  const caseIngested = useMemo(() => ingestedSources.filter((s) => s.caseId === activeCase.id), [ingestedSources, activeCase.id]);
  const allSources = useMemo(() => [...caseIngested, ...sources], [caseIngested]);
  const inFlight = jobs.filter((j) => j.caseId === activeCase.id && (j.status === 'queued' || j.status === 'processing')).length;

  const filters = KIND_FILTERS.filter((f) => f.id === 'all' || allSources.some((s) => s.kind === f.id));
  const filtered = kind === 'all' ? allSources : allSources.filter((s) => s.kind === kind);
  const languages = new Set(allSources.flatMap((s) => s.languages).filter((l) => l !== 'Not applicable'));
  const totalEntities = allSources.reduce((sum, s) => sum + s.entitiesExtracted, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Evidence Box — {activeCase.title}</h1>
          <p className="page-subtitle">
            Isolated per-case workspace. Upload chats, statements, documents and media; the Co-Pilot builds a case
            knowledge graph from the unstructured evidence automatically.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveTab('ingest')}>
          ⬆ Upload evidence
        </button>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: 20 }}>
        <StatTile
          label="Evidence items"
          value={allSources.length}
          footnote={caseIngested.length ? `${caseIngested.length} newly ingested` : 'Isolated to this case'}
        />
        <StatTile label="Entities extracted" value={totalEntities} footnote="People, orgs, objects, locations, events" />
        <StatTile label="Languages covered" value={languages.size} footnote={[...languages].join(', ')} />
        <StatTile
          label="Fully indexed"
          value={allSources.filter((s) => s.status === 'indexed' || s.status === 'transcribed').length}
          footnote="Ready for graph + keyword search"
        />
      </div>

      {inFlight > 0 && (
        <div className="card flex items-center justify-between gap-10" style={{ marginBottom: 16, borderColor: 'var(--accent)' }}>
          <span style={{ fontSize: 12.5 }}>
            {inFlight} item{inFlight === 1 ? ' is' : 's are'} still processing. They appear here once indexed.
          </span>
          <button className="btn btn-sm" onClick={() => setActiveTab('ingest')}>
            View processing status
          </button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Case evidence inventory</h2>
          <div className="flex gap-6 wrap">
            {filters.map((f) => (
              <button
                key={f.id}
                className="btn btn-sm"
                style={kind === f.id ? { background: 'var(--accent-dim)', borderColor: 'var(--accent)', color: 'var(--accent-strong)' } : {}}
                onClick={() => setKind(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {filtered.map((s) => {
            const meta = SOURCE_KINDS[s.kind] ?? { label: s.kind, icon: '📁' };
            return (
              <div key={s.id} className="list-row" onClick={() => openEvidence(s.id)} role="button" tabIndex={0}>
                <div style={{ flex: '0 0 50px', fontSize: 18 }}>{meta.icon}</div>
                <div style={{ flex: '0 0 70px' }}>
                  <Badge tone="accent">{s.ref}</Badge>
                </div>
                <div style={{ flex: '1 1 300px' }}>
                  <div className="flex items-center gap-6 wrap">
                    <strong style={{ fontSize: 13 }}>{s.title}</strong>
                    {s.isNew && <Badge tone="accent">New</Badge>}
                    {s.needsReview && <Badge tone="warning">Review</Badge>}
                  </div>
                  <div className="text-muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                    {s.custodian}
                  </div>
                </div>
                <div style={{ flex: '0 0 150px' }} className="text-secondary">
                  {s.languages.join(', ')}
                </div>
                <div style={{ flex: '0 0 200px' }} className="text-secondary">
                  {s.volume}
                </div>
                <div style={{ flex: '0 0 110px' }}>
                  <Badge tone={s.status === 'transcribed' ? 'success' : 'neutral'}>
                    {s.status === 'transcribed' ? 'Transcribed' : 'Indexed'}
                  </Badge>
                </div>
                <div style={{ flex: '0 0 90px' }} className="text-secondary">
                  {s.entitiesExtracted} entities
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
