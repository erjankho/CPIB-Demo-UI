import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { timelineEvents } from '../../data/timeline.js';
import { entityById } from '../../data/entities.js';
import { sourceById } from '../../data/sources.js';
import { Badge } from '../common/Badge.jsx';
import { TimelineGantt } from './TimelineGantt.jsx';
import { TimelineInspector } from './TimelineInspector.jsx';

const CATEGORIES = [...new Set(timelineEvents.map((event) => event.category))];

export function Timeline() {
  const { openEvidence, jumpToGraph } = useApp();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [disputedOnly, setDisputedOnly] = useState(false);
  const [actorFilter, setActorFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [view, setView] = useState('gantt'); // 'gantt' | 'list'
  const [selectedEventId, setSelectedEventId] = useState(null);

  const sorted = useMemo(
    () => [...timelineEvents].sort((a, b) => new Date(a.datetime) - new Date(b.datetime)),
    [],
  );

  const months = useMemo(() => {
    const set = new Set(sorted.map((event) => monthKey(event.datetime)));
    return [...set];
  }, [sorted]);

  const actors = useMemo(() => {
    const set = new Set(sorted.flatMap((event) => event.actors));
    return [...set].map((id) => entityById[id]).filter(Boolean);
  }, [sorted]);

  const filtered = useMemo(() => {
    return sorted.filter((event) => {
      if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;
      if (disputedOnly && !event.isDispute) return false;
      if (actorFilter !== 'all' && !event.actors.includes(actorFilter)) return false;
      if (selectedMonth !== 'all' && monthKey(event.datetime) !== selectedMonth) return false;
      return true;
    });
  }, [sorted, categoryFilter, disputedOnly, actorFilter, selectedMonth]);

  const selectedEvent = filtered.find((event) => event.id === selectedEventId) ?? null;
  const disputeCount = sorted.filter((event) => event.isDispute).length;

  // A selection should never remain open if the event is removed by a filter.
  useEffect(() => {
    if (selectedEventId && !filtered.some((event) => event.id === selectedEventId)) setSelectedEventId(null);
  }, [filtered, selectedEventId]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Evidence Timeline</h1>
          <p className="page-subtitle">
            Investigation events plotted across a shared calendar. Select a Gantt event to inspect its extracted fact,
            connected entities and source evidence without leaving the timeline.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="flex gap-10 wrap items-center">
          <select className="select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select className="select" value={actorFilter} onChange={(event) => setActorFilter(event.target.value)}>
            <option value="all">All actors</option>
            {actors.map((actor) => (
              <option key={actor.id} value={actor.id}>
                {actor.label}
              </option>
            ))}
          </select>

          <select className="select" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
            <option value="all">All months</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {monthLabel(month)}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-6" style={{ fontSize: 12.5, cursor: 'pointer' }}>
            <input type="checkbox" checked={disputedOnly} onChange={(event) => setDisputedOnly(event.target.checked)} />
            Disputed only
            <Badge tone="danger">{disputeCount}</Badge>
          </label>

          <span className="text-muted" style={{ fontSize: 12, marginLeft: 'auto' }}>
            Showing {filtered.length} of {sorted.length} events
          </span>

          {selectedEvent && (
            <button className="btn btn-sm" onClick={() => setSelectedEventId(null)}>
              ✕ Close properties
            </button>
          )}

          <div className="persona-switch" role="tablist" aria-label="Timeline view">
            <button className={view === 'gantt' ? 'active' : ''} onClick={() => setView('gantt')}>
              📊 Gantt
            </button>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
              📋 List
            </button>
          </div>
        </div>
      </div>

      {view === 'gantt' ? (
        <div
          className="grid"
          style={{
            gridTemplateColumns: selectedEvent ? 'minmax(0, 1fr) 370px' : 'minmax(0, 1fr)',
            alignItems: 'stretch',
          }}
        >
          <div className="card" style={{ padding: 0, height: '58vh', minHeight: 440, overflow: 'hidden' }}>
            <TimelineGantt
              events={filtered}
              selectedEventId={selectedEventId}
              onSelectEvent={setSelectedEventId}
            />
          </div>
          {selectedEvent && (
            <TimelineInspector
              event={selectedEvent}
              onClose={() => setSelectedEventId(null)}
              onOpenEvidence={openEvidence}
              onJumpToGraph={jumpToGraph}
            />
          )}
        </div>
      ) : (
        <div
          className="grid"
          style={{
            gridTemplateColumns: selectedEvent ? 'minmax(0, 1fr) 370px' : 'minmax(0, 1fr)',
            alignItems: 'start',
          }}
        >
          <div className="card">
            <div style={{ position: 'relative', paddingLeft: 28 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 9,
                  top: 6,
                  bottom: 6,
                  width: 2,
                  background: 'var(--border-subtle)',
                }}
              />
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  No events match your filters.
                </div>
              ) : (
                filtered.map((event) => (
                  <TimelineRow
                    key={event.id}
                    event={event}
                    selected={selectedEventId === event.id}
                    onSelect={() => setSelectedEventId(event.id)}
                    onOpenEvidence={openEvidence}
                    onJumpToGraph={jumpToGraph}
                  />
                ))
              )}
            </div>
          </div>
          {selectedEvent && (
            <TimelineInspector
              event={selectedEvent}
              onClose={() => setSelectedEventId(null)}
              onOpenEvidence={openEvidence}
              onJumpToGraph={jumpToGraph}
            />
          )}
        </div>
      )}
    </div>
  );
}

function TimelineRow({ event, selected, onSelect, onOpenEvidence, onJumpToGraph }) {
  const occurredAt = new Date(event.datetime);
  const dotColour = event.isDispute
    ? 'var(--danger)'
    : event.confidence === 'corroborated'
      ? 'var(--success)'
      : 'var(--text-muted)';

  return (
    <button
      type="button"
      onClick={onSelect}
      className="timeline-list-event"
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        marginBottom: 16,
        padding: '0 0 0 0',
        background: selected ? 'var(--accent-dim)' : 'transparent',
        border: selected ? '1px solid var(--accent)' : '1px solid transparent',
        borderRadius: 8,
        color: 'inherit',
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: -24,
          top: 9,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: dotColour,
          border: '2px solid var(--bg-1)',
          boxShadow: event.highlight ? `0 0 0 3px ${dotColour}33` : undefined,
        }}
      />
      <span style={{ display: 'block', padding: selected ? '10px' : '0' }}>
        <span className="flex items-center gap-8 wrap" style={{ marginBottom: 4 }}>
          <span className="mono text-secondary" style={{ fontSize: 11.5 }}>
            {occurredAt.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
            {' · '}
            {occurredAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </span>
          <Badge tone="neutral">{event.category}</Badge>
          {event.isDispute && <Badge tone="danger">Disputed</Badge>}
          {!event.isDispute && event.confidence === 'corroborated' && <Badge tone="success">Corroborated</Badge>}
          {event.highlight && <Badge tone="warning">Key event</Badge>}
        </span>
        <strong style={{ fontSize: 13.5 }}>{event.title}</strong>
        <span style={{ display: 'block', fontSize: 12.5, color: 'var(--text-secondary)', margin: '4px 0 6px', maxWidth: 760 }}>
          {event.description}
        </span>

        <span className="flex gap-6 wrap items-center">
          {event.actors.map((actorId) => {
            const actor = entityById[actorId];
            if (!actor) return null;
            return (
              <span
                key={actorId}
                className="chip"
                role="button"
                tabIndex={0}
                onClick={(clickEvent) => {
                  clickEvent.stopPropagation();
                  onJumpToGraph([actorId]);
                }}
                title="View in Graph Explorer"
              >
                👤 {actor.label}
              </span>
            );
          })}
          {event.cites.map((sourceId) => {
            const source = sourceById[sourceId];
            if (!source) return null;
            return (
              <span
                key={sourceId}
                className="chip"
                role="button"
                tabIndex={0}
                onClick={(clickEvent) => {
                  clickEvent.stopPropagation();
                  onOpenEvidence(sourceId);
                }}
              >
                {source.ref}
              </span>
            );
          })}
        </span>
      </span>
    </button>
  );
}

function monthKey(iso) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  const [year, month] = key.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
