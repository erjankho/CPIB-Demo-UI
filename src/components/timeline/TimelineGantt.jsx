import React, { useEffect, useMemo, useRef, useState } from 'react';
import { entityById } from '../../data/entities.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const LABEL_COL_WIDTH = 210;
const EVENT_ROW_HEIGHT = 32;
const HEADER_HEIGHT = 58;

const ZOOM_LEVELS = [
  { id: 'fit', label: 'Fit', hint: 'Fit the full investigation span', labelWidth: 106 },
  { id: 'standard', label: 'Standard', pxPerDay: 8, labelWidth: 146 },
  { id: 'detail', label: 'Detail', pxPerDay: 14, labelWidth: 210 },
];

const CATEGORY_META = {
  Corporate: { icon: '🏢', order: 1 },
  Communication: { icon: '💬', order: 2 },
  Meeting: { icon: '🤝', order: 3 },
  Transaction: { icon: '↔', order: 4 },
  'System event': { icon: '⌘', order: 5 },
  Procurement: { icon: '⚑', order: 6 },
  Financial: { icon: '¤', order: 7 },
  Statement: { icon: '📝', order: 8 },
  'Case admin': { icon: '🗂', order: 9 },
};

/**
 * Investigation-first horizontal timeline.
 *
 * - Default category swimlanes avoid duplicating one event across every actor.
 * - Fit/Standard/Detail zoom keeps long investigations readable.
 * - Nearby events pack into vertical slots instead of labels overlapping.
 * - Selecting an event is persistent; the parent renders its property inspector.
 */
export function TimelineGantt({ events, selectedEventId, onSelectEvent }) {
  const rootRef = useRef(null);
  const labelsBodyRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(900);
  const [zoom, setZoom] = useState('fit');
  const [trackMode, setTrackMode] = useState('category');

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setViewportWidth(Math.max(480, Math.round(entry.contentRect.width) - LABEL_COL_WIDTH));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { minDate, maxDate } = useMemo(() => getRange(events), [events]);
  const spanDays = Math.max(1, Math.ceil((maxDate - minDate) / DAY_MS));
  const zoomMeta = ZOOM_LEVELS.find((level) => level.id === zoom) ?? ZOOM_LEVELS[0];
  const pxPerDay = zoom === 'fit' ? clamp(viewportWidth / spanDays, 3.5, 7) : zoomMeta.pxPerDay;
  const chartWidth = Math.max(viewportWidth, Math.ceil(spanDays * pxPerDay));
  const xFor = (dateMs) => ((dateMs - minDate) / DAY_MS) * pxPerDay;

  const lanes = useMemo(() => buildLanes(events, trackMode), [events, trackMode]);
  const renderedLanes = useMemo(
    () => layoutLanes(lanes, xFor, zoomMeta.labelWidth),
    // xFor changes whenever the time scale changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lanes, minDate, pxPerDay, zoomMeta.labelWidth],
  );
  const totalLaneHeight = renderedLanes.reduce((sum, lane) => sum + lane.height, 0);
  const months = useMemo(() => buildMonthSegments(minDate, maxDate), [minDate, maxDate]);
  const quarters = useMemo(() => buildQuarterSegments(minDate, maxDate), [minDate, maxDate]);
  const selectedEvent = events.find((event) => event.id === selectedEventId);

  if (events.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📅</div>
        No events match your filters.
      </div>
    );
  }

  function syncLaneLabels(event) {
    if (labelsBodyRef.current) labelsBodyRef.current.scrollTop = event.currentTarget.scrollTop;
  }

  return (
    <div ref={rootRef} className="flex flex-col" style={{ height: '100%', minHeight: 0 }}>
      <div
        className="flex items-center justify-between gap-8 wrap"
        style={{ minHeight: 44, padding: '7px 10px', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-8 wrap">
          <span className="text-muted" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4 }}>
            SWIMLANES
          </span>
          <div className="persona-switch" role="tablist" aria-label="Timeline track grouping">
            <button className={trackMode === 'category' ? 'active' : ''} onClick={() => setTrackMode('category')}>
              Investigation theme
            </button>
            <button className={trackMode === 'entity' ? 'active' : ''} onClick={() => setTrackMode('entity')}>
              Connected entity
            </button>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <span className="text-muted" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4 }}>
            SCALE
          </span>
          <div className="persona-switch" role="tablist" aria-label="Timeline scale">
            {ZOOM_LEVELS.map((level) => (
              <button
                key={level.id}
                className={zoom === level.id ? 'active' : ''}
                onClick={() => setZoom(level.id)}
                title={level.hint ?? `${level.label} time scale`}
              >
                {level.id === 'fit' ? '⤢ ' : ''}
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex" style={{ flex: '1 1 auto', minHeight: 0 }}>
        {/* Fixed entity/category labels. Vertical scroll is synchronized with the chart body. */}
        <aside
          style={{
            flex: `0 0 ${LABEL_COL_WIDTH}px`,
            minWidth: 0,
            borderRight: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            background: 'var(--bg-1)',
          }}
        >
          <div
            className="flex items-center"
            style={{ height: HEADER_HEIGHT, padding: '0 12px', borderBottom: '1px solid var(--border-subtle)' }}
          >
            <span className="text-muted" style={{ fontSize: 11, letterSpacing: 0.5, fontWeight: 700 }}>
              EVENT TRACK
            </span>
          </div>
          <div ref={labelsBodyRef} style={{ overflow: 'hidden', height: `calc(100% - ${HEADER_HEIGHT}px)` }}>
            {renderedLanes.map((lane) => (
              <div
                key={lane.id}
                className="flex items-center gap-8"
                style={{
                  height: lane.height,
                  padding: '0 11px',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: 12,
                  fontWeight: 650,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  background: lane.tint,
                }}
                title={lane.label}
              >
                <span aria-hidden="true">{lane.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{lane.label}</span>
                <span className="text-muted" style={{ marginLeft: 'auto', fontSize: 10.5 }}>
                  {lane.events.length}
                </span>
              </div>
            ))}
          </div>
        </aside>

        <div
          style={{ flex: '1 1 auto', minWidth: 0, overflow: 'auto', background: 'var(--bg-0)' }}
          onScroll={syncLaneLabels}
        >
          <div style={{ position: 'relative', width: chartWidth, minHeight: HEADER_HEIGHT + totalLaneHeight }}>
            {/* Two-level calendar header: quarter range, then individual months. */}
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 8,
                height: HEADER_HEIGHT,
                background: 'var(--bg-1)',
                borderBottom: '1px solid var(--border-strong)',
              }}
            >
              {quarters.map((quarter) => (
                <div
                  key={quarter.key}
                  className="text-muted"
                  style={{
                    position: 'absolute',
                    left: xFor(quarter.start),
                    top: 0,
                    height: 23,
                    width: Math.max(1, xFor(quarter.end) - xFor(quarter.start)),
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 8,
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    borderLeft: '1px solid var(--border-subtle)',
                    background: 'var(--bg-2)',
                  }}
                >
                  {quarter.label}
                </div>
              ))}
              {months.map((month) => (
                <div
                  key={month.key}
                  className="mono text-secondary"
                  style={{
                    position: 'absolute',
                    left: xFor(month.start),
                    top: 23,
                    height: 35,
                    width: Math.max(1, xFor(month.end) - xFor(month.start)),
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 7,
                    fontSize: 11,
                    borderLeft: '1px solid var(--border-subtle)',
                  }}
                >
                  {month.label}
                </div>
              ))}
            </div>

            {/* Month gridlines extend through all swimlanes. */}
            {months.map((month) => (
              <div
                key={`grid-${month.key}`}
                style={{
                  position: 'absolute',
                  left: xFor(month.start),
                  top: HEADER_HEIGHT,
                  bottom: 0,
                  width: 1,
                  background: 'var(--border-subtle)',
                }}
              />
            ))}

            {renderedLanes.map((lane) => (
              <TimelineLane
                key={lane.id}
                lane={lane}
                chartWidth={chartWidth}
                selectedEventId={selectedEventId}
                selectedEvent={selectedEvent}
                onSelectEvent={onSelectEvent}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineLane({ lane, chartWidth, selectedEventId, selectedEvent, onSelectEvent }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: HEADER_HEIGHT + lane.top,
        width: chartWidth,
        height: lane.height,
        borderBottom: '1px solid var(--border-subtle)',
        background: lane.tint,
      }}
    >
      {lane.layout.map(({ event, left, width, slot }) => {
        const selected = selectedEventId === event.id;
        const colour = eventColour(event);
        const hasMultipleSources = event.cites.length > 1;
        return (
          <button
            key={event.id}
            className="timeline-event-card"
            type="button"
            onClick={() => onSelectEvent(event.id)}
            title={`Inspect event: ${event.title}`}
            aria-pressed={selected}
            style={{
              position: 'absolute',
              left,
              top: 7 + slot * EVENT_ROW_HEIGHT,
              width,
              height: 25,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              textAlign: 'left',
              padding: '0 7px',
              borderRadius: 5,
              border: `1px solid ${selected ? 'var(--accent)' : colour}`,
              borderLeft: `4px solid ${colour}`,
              background: selected ? 'var(--accent-dim)' : 'var(--bg-2)',
              color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: selected ? '0 0 0 2px rgba(79, 195, 247, 0.2)' : undefined,
              cursor: 'pointer',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
              fontSize: 11.25,
              fontWeight: selected || event.highlight ? 700 : 600,
            }}
          >
            <span style={{ color: colour, fontSize: 10 }}>{event.isDispute ? '◆' : event.highlight ? '●' : '•'}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</span>
            {hasMultipleSources && <span className="text-muted" style={{ marginLeft: 'auto', fontSize: 10 }}>⌁{event.cites.length}</span>}
          </button>
        );
      })}
    </div>
  );
}

function getRange(events) {
  if (events.length === 0) {
    const today = startOfDay(Date.now());
    return { minDate: today, maxDate: today + DAY_MS };
  }
  const values = events.map((event) => new Date(event.datetime).getTime());
  const earliest = Math.min(...values);
  const latest = Math.max(...values);
  const start = startOfDay(earliest) - 5 * DAY_MS;
  const end = startOfDay(latest) + 10 * DAY_MS;
  return { minDate: start, maxDate: end };
}

function buildLanes(events, trackMode) {
  const map = new Map();

  for (const event of events) {
    const laneDefinitions = trackMode === 'category'
      ? [{ id: event.category, label: event.category, ...(CATEGORY_META[event.category] ?? { icon: '•', order: 99 }) }]
      : event.actors.length > 0
        ? event.actors.map((id) => {
            const entity = entityById[id];
            return {
              id,
              label: entity?.label ?? id,
              icon: entity ? entityIcon(entity.type) : '•',
              order: entity?.type === 'person' ? 1 : 2,
            };
          })
        : [{ id: '__case-admin__', label: 'Case admin / other', icon: '🗂', order: 99 }];

    for (const definition of laneDefinitions) {
      if (!map.has(definition.id)) map.set(definition.id, { ...definition, events: [] });
      map.get(definition.id).events.push(event);
    }
  }

  return [...map.values()]
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
    .map((lane, index) => ({
      ...lane,
      events: [...lane.events].sort((a, b) => new Date(a.datetime) - new Date(b.datetime)),
      tint: index % 2 === 0 ? 'transparent' : 'rgba(127, 127, 127, 0.035)',
    }));
}

function layoutLanes(lanes, xFor, labelWidth) {
  let cursor = 0;
  return lanes.map((lane) => {
    const slotEnds = [];
    const layout = lane.events.map((event) => {
      const left = xFor(new Date(event.datetime).getTime());
      const estimatedWidth = Math.min(labelWidth, Math.max(72, 30 + event.title.length * 5.5));
      let slot = slotEnds.findIndex((end) => end + 10 <= left);
      if (slot < 0) slot = slotEnds.length;
      slotEnds[slot] = left + estimatedWidth;
      return { event, left, width: estimatedWidth, slot };
    });
    const height = Math.max(44, 14 + slotEnds.length * EVENT_ROW_HEIGHT);
    const rendered = { ...lane, layout, top: cursor, height };
    cursor += height;
    return rendered;
  });
}

function buildMonthSegments(minDate, maxDate) {
  const segments = [];
  const start = new Date(minDate);
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor.getTime() < maxDate) {
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    segments.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      start: cursor.getTime(),
      end: Math.min(next.getTime(), maxDate),
      label: cursor.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return segments;
}

function buildQuarterSegments(minDate, maxDate) {
  const segments = [];
  const start = new Date(minDate);
  const quarterMonth = Math.floor(start.getMonth() / 3) * 3;
  const cursor = new Date(start.getFullYear(), quarterMonth, 1);
  while (cursor.getTime() < maxDate) {
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + 3, 1);
    segments.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      start: cursor.getTime(),
      end: Math.min(next.getTime(), maxDate),
      label: `Q${Math.floor(cursor.getMonth() / 3) + 1} ${cursor.getFullYear()}`,
    });
    cursor.setMonth(cursor.getMonth() + 3);
  }
  return segments;
}

function entityIcon(type) {
  if (type === 'person') return '👤';
  if (type === 'organisation') return '🏢';
  if (type === 'object') return '📦';
  if (type === 'location') return '📍';
  return '⚑';
}

function eventColour(event) {
  if (event.isDispute) return 'var(--danger)';
  if (event.confidence === 'corroborated') return 'var(--success)';
  return 'var(--text-muted)';
}

function startOfDay(time) {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
