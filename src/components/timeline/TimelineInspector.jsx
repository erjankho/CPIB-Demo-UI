import React from 'react';
import { entityById } from '../../data/entities.js';
import { sourceById } from '../../data/sources.js';
import { SOURCE_KINDS } from '../../data/caseData.js';
import { Badge, ConfidenceBadge, Chip } from '../common/Badge.jsx';

/** Persistent properties panel opened by selecting an event on the Gantt. */
export function TimelineInspector({ event, onClose, onOpenEvidence, onJumpToGraph }) {
  if (!event) {
    return (
      <aside className="card" style={{ height: '58vh', minHeight: 420, overflowY: 'auto' }}>
        <div className="empty-state">
          <div className="empty-icon">☝</div>
          <strong style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: 4 }}>Select a timeline event</strong>
          Click an event card to inspect its extracted properties, linked entities, source evidence and graph context.
        </div>
      </aside>
    );
  }

  const occurredAt = new Date(event.datetime);
  const linkedEntities = event.actors.map((id) => entityById[id]).filter(Boolean);
  const sources = event.cites.map((id) => sourceById[id]).filter(Boolean);

  return (
    <aside className="card" style={{ height: '58vh', minHeight: 420, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '14px 14px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          background: event.isDispute ? 'var(--danger-dim)' : 'var(--bg-1)',
        }}
      >
        <div className="flex items-start justify-between gap-8">
          <div className="flex gap-6 wrap">
            <Badge tone="neutral">{event.category}</Badge>
            <ConfidenceBadge level={event.confidence} />
            {event.isDispute && <Badge tone="danger">Disputed</Badge>}
            {event.highlight && <Badge tone="warning">Key event</Badge>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close event properties">
            ✕
          </button>
        </div>
        <h2 style={{ margin: '10px 0 4px', fontSize: 16, lineHeight: 1.3 }}>{event.title}</h2>
        <div className="mono text-secondary" style={{ fontSize: 11.5 }}>
          {occurredAt.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          {' · '}
          {occurredAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div style={{ padding: '14px', overflowY: 'auto' }}>
        <div className="section-label">Extracted event fact</div>
        <p style={{ margin: '0', fontSize: 12.75, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{event.description}</p>

        <div className="section-label">Properties</div>
        <div className="kv-row">
          <span className="kv-key">Event type</span>
          <span>{event.category}</span>
        </div>
        <div className="kv-row">
          <span className="kv-key">Confidence</span>
          <span>{formatConfidence(event.confidence)}</span>
        </div>
        <div className="kv-row">
          <span className="kv-key">Evidence sources</span>
          <span>{sources.length || 'None linked'}</span>
        </div>
        <div className="kv-row">
          <span className="kv-key">Linked entities</span>
          <span>{linkedEntities.length || 'None extracted'}</span>
        </div>

        <div className="section-label">Connected entities</div>
        {linkedEntities.length > 0 ? (
          <div className="flex gap-6 wrap">
            {linkedEntities.map((entity) => (
              <button
                key={entity.id}
                className="chip"
                style={{ cursor: 'pointer' }}
                title="Open this entity in Graph Explorer"
                onClick={() => onJumpToGraph([entity.id])}
              >
                {entityIcon(entity.type)} {entity.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-muted" style={{ fontSize: 12 }}>No entities were extracted for this case-administration event.</div>
        )}

        <div className="section-label">Linked source evidence</div>
        {sources.length > 0 ? (
          <div className="flex flex-col gap-8">
            {sources.map((source) => {
              const kind = SOURCE_KINDS[source.kind] ?? { icon: '📄', label: source.kind };
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => onOpenEvidence(source.id)}
                  className="list-row"
                  style={{
                    cursor: 'pointer',
                    padding: '9px',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    color: 'inherit',
                  }}
                >
                  <span style={{ fontSize: 16 }} aria-hidden="true">{kind.icon}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="flex items-center gap-6 wrap">
                      <Badge tone="accent">{source.ref}</Badge>
                      <span className="text-muted" style={{ fontSize: 10.5 }}>{kind.label}</span>
                    </span>
                    <span style={{ display: 'block', fontSize: 12, fontWeight: 650, marginTop: 4 }}>{source.title}</span>
                    <span
                      className="text-secondary"
                      style={{ display: 'block', fontSize: 11.25, lineHeight: 1.4, marginTop: 3, overflow: 'hidden', maxHeight: 47 }}
                    >
                      {source.excerpt}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-muted" style={{ fontSize: 12 }}>No source item is linked to this case-administration event.</div>
        )}

        {linkedEntities.length > 0 && (
          <>
            <div className="divider" />
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onJumpToGraph(event.actors)}>
              🕸️ Open graph context
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

function formatConfidence(level) {
  if (level === 'corroborated') return 'Corroborated across evidence';
  if (level === 'disputed') return 'Disputed by at least one source';
  return 'Asserted in a single source';
}

function entityIcon(type) {
  if (type === 'person') return '👤';
  if (type === 'organisation') return '🏢';
  if (type === 'object') return '📦';
  if (type === 'location') return '📍';
  return '⚑';
}
