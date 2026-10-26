import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { mergeSuggestions as initialMerges, discrepancies } from '../../data/factAudit.js';
import { Badge } from '../common/Badge.jsx';
import { StatTile } from '../common/StatTile.jsx';

const STANCE_TONE = { supports: 'success', contradicts: 'danger', neutral: 'neutral' };

export function FactAudit() {
  const { openEvidence } = useApp();
  const [merges, setMerges] = useState(initialMerges);

  function decide(id, decision) {
    setMerges((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: decision,
              resolution: { decision, by: 'IO Nadiah Rahman', at: new Date().toISOString() },
            }
          : m,
      ),
    );
  }

  const pending = merges.filter((m) => m.status === 'pending');
  const resolved = merges.filter((m) => m.status !== 'pending');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fact Audit</h1>
          <p className="page-subtitle">
            The AI suggests entity merges and surfaces cross-statement discrepancies. Investigators decide — every
            merge and every contradiction is approved or rejected by a human.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: 20 }}>
        <StatTile label="Pending merges" value={pending.length} footnote="Awaiting investigator decision" />
        <StatTile label="Approved" value={merges.filter((m) => m.status === 'approved').length} />
        <StatTile label="Rejected" value={merges.filter((m) => m.status === 'rejected').length} />
        <StatTile label="High-severity discrepancies" value={discrepancies.filter((d) => d.severity === 'high').length} />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h2 className="card-title">Suggested entity merges</h2>
          <span className="text-muted" style={{ fontSize: 12 }}>
            AI suggests · investigator approves
          </span>
        </div>

        <div className="flex flex-col gap-10">
          {pending.map((m) => (
            <MergeCard key={m.id} merge={m} onDecide={decide} onOpenEvidence={openEvidence} />
          ))}
          {pending.length === 0 && (
            <div className="empty-state" style={{ padding: 24 }}>
              All suggested merges have been reviewed.
            </div>
          )}
        </div>

        {resolved.length > 0 && (
          <>
            <div className="section-label">Resolved</div>
            <div className="flex flex-col gap-8">
              {resolved.map((m) => (
                <MergeCard key={m.id} merge={m} onDecide={decide} onOpenEvidence={openEvidence} resolved />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Statement Analysis — discrepancies</h2>
        </div>
        <div className="flex flex-col gap-14">
          {discrepancies.map((d) => (
            <div key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14 }}>
              <div className="flex items-center gap-8" style={{ marginBottom: 8 }}>
                <Badge tone={d.severity === 'high' ? 'danger' : 'warning'}>{d.severity === 'high' ? 'High severity' : 'Medium severity'}</Badge>
                <strong style={{ fontSize: 13.5 }}>{d.topic}</strong>
              </div>
              <div className="flex flex-col gap-6">
                {d.statements.map((s, i) => (
                  <div key={i} className="flex gap-10 items-center" style={{ fontSize: 12.5 }}>
                    <Badge tone={STANCE_TONE[s.stance]}>{s.stance}</Badge>
                    <span style={{ flex: 1 }}>
                      <strong>{s.label}:</strong> {s.position}
                    </span>
                    <button className="chip" style={{ cursor: 'pointer' }} onClick={() => openEvidence(s.sourceId)}>
                      View source
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MergeCard({ merge, onDecide, onOpenEvidence, resolved }) {
  const confidencePct = Math.round(merge.confidence * 100);
  const confidenceTone = merge.confidence >= 0.8 ? 'success' : merge.confidence >= 0.6 ? 'warning' : 'danger';

  return (
    <div className="card" style={{ background: 'var(--bg-2)', padding: 14 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <div className="flex items-center gap-8">
          <span className="mono" style={{ fontSize: 13 }}>
            "{merge.entityA.label}"
          </span>
          <span className="text-muted">↔</span>
          <span className="mono" style={{ fontSize: 13 }}>
            "{merge.entityB.label}"
          </span>
        </div>
        <Badge tone={confidenceTone}>{confidencePct}% match confidence</Badge>
      </div>

      <div className="flex gap-10 wrap text-secondary" style={{ fontSize: 11.5, marginBottom: 8 }}>
        <button className="chip" style={{ cursor: 'pointer' }} onClick={() => onOpenEvidence(merge.entityA.sourceId)}>
          {merge.entityA.source}
        </button>
        <button className="chip" style={{ cursor: 'pointer' }} onClick={() => onOpenEvidence(merge.entityB.sourceId)}>
          {merge.entityB.source}
        </button>
      </div>

      <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 10px' }}>{merge.rationale}</p>

      {resolved ? (
        <Badge tone={merge.status === 'approved' ? 'success' : 'danger'}>
          {merge.status === 'approved' ? '✓ Approved' : '✕ Rejected'} by {merge.resolution?.by}
        </Badge>
      ) : (
        <div className="flex gap-8">
          <button className="btn btn-success btn-sm" onClick={() => onDecide(merge.id, 'approved')}>
            ✓ Approve merge
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDecide(merge.id, 'rejected')}>
            ✕ Reject
          </button>
        </div>
      )}
    </div>
  );
}
