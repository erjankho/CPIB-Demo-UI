import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { POLE_TYPES } from '../../data/caseData.js';
import { sourceById } from '../../data/sources.js';
import { Badge } from '../common/Badge.jsx';

export function NodeDetailPanel({ entity, relatedEdges, entityById, onSelectEntity, onClose }) {
  const { openEvidence } = useApp();
  if (!entity) {
    return (
      <div className="card" style={{ height: '100%' }}>
        <div className="empty-state">
          <div className="empty-icon">🕸️</div>
          Select a node to inspect its attributes, cited facts and connections.
        </div>
      </div>
    );
  }

  const typeMeta = POLE_TYPES[entity.type] ?? POLE_TYPES.object;

  return (
    <div className="card" style={{ height: '100%', overflowY: 'auto' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <div className="flex items-center gap-8">
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: typeMeta.colour,
              color: '#06151c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {typeMeta.code}
          </span>
          <Badge tone="neutral">{typeMeta.label}</Badge>
          {entity.standing && <Badge tone="accent">{entity.standing}</Badge>}
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close detail panel">
          ✕
        </button>
      </div>

      <h3 style={{ margin: '0 0 2px', fontSize: 15.5 }}>{entity.label}</h3>
      {entity.subtitle && <div className="text-secondary" style={{ fontSize: 12.5 }}>{entity.subtitle}</div>}

      {entity.aliases?.length > 0 && (
        <div className="flex gap-6 wrap" style={{ marginTop: 8 }}>
          {entity.aliases.map((a) => (
            <span key={a} className="chip">
              {a}
            </span>
          ))}
        </div>
      )}

      {entity.attributes?.length > 0 && (
        <>
          <div className="section-label">Attributes</div>
          {entity.attributes.map(([k, v]) => (
            <div className="kv-row" key={k}>
              <span className="kv-key">{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </>
      )}

      {entity.facts?.length > 0 && (
        <>
          <div className="section-label">Cited facts</div>
          {entity.facts.map((f, i) => (
            <div className="fact-item" key={i}>
              <span className="fact-bullet">●</span>
              <div>
                <div>{f.text}</div>
                <div className="flex gap-6 wrap" style={{ marginTop: 4 }}>
                  {f.cites.map((cid) => {
                    const src = sourceById[cid];
                    if (!src) return null;
                    return (
                      <button key={cid} className="chip" style={{ cursor: 'pointer' }} onClick={() => openEvidence(cid)}>
                        {src.ref}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {relatedEdges?.length > 0 && (
        <>
          <div className="section-label">Connections ({relatedEdges.length})</div>
          <div className="flex flex-col gap-6">
            {relatedEdges.map(({ edge, otherId }) => {
              const other = entityById[otherId];
              if (!other) return null;
              const isOutgoing = edge.source === entity.id;
              return (
                <div
                  key={edge.id}
                  className="list-row"
                  style={{ padding: '7px 8px' }}
                  onClick={() => onSelectEntity(otherId)}
                >
                  <div style={{ fontSize: 12 }}>
                    {isOutgoing ? (
                      <>
                        <strong>{entity.label}</strong> {edge.label} <strong>{other.label}</strong>
                      </>
                    ) : (
                      <>
                        <strong>{other.label}</strong> {edge.label} <strong>{entity.label}</strong>
                      </>
                    )}
                  </div>
                  <Badge tone={edge.confidence === 'disputed' ? 'danger' : edge.confidence === 'corroborated' ? 'success' : 'neutral'}>
                    {edge.confidence}
                  </Badge>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
