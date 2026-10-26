import React, { useMemo, useRef, useState, useCallback } from 'react';
import { useForceLayout } from './useForceLayout.js';
import { POLE_TYPES, CONFIDENCE } from '../../data/caseData.js';

/**
 * SVG force-directed graph canvas with pan/zoom, node selection and
 * highlight-path support (used by the Co-Pilot "view in graph" action).
 */
export function GraphCanvas({ nodes, links, selectedId, onSelect, highlightPath }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 800, height: 540 });
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const dragState = useRef(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let frame = null;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      // Round to avoid restarting the force simulation on sub-pixel jitter
      // from ResizeObserver feedback loops (observed as the graph slowly
      // drifting/"sliding" as it kept re-centering on tiny size deltas).
      const next = { width: Math.max(Math.round(width), 200), height: Math.max(Math.round(height), 200) };
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setSize((prev) => (prev.width === next.width && prev.height === next.height ? prev : next));
      });
    });
    obs.observe(el);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      obs.disconnect();
    };
  }, []);

  const positions = useForceLayout(nodes, links, { width: size.width, height: size.height, enabled: true });

  const highlightSet = useMemo(() => new Set(highlightPath ?? []), [highlightPath]);
  const highlightEdgeKeys = useMemo(() => {
    if (!highlightPath || highlightPath.length < 2) return new Set();
    const keys = new Set();
    for (let i = 0; i < highlightPath.length - 1; i++) {
      keys.add(`${highlightPath[i]}>${highlightPath[i + 1]}`);
      keys.add(`${highlightPath[i + 1]}>${highlightPath[i]}`);
    }
    return keys;
  }, [highlightPath]);

  function onWheel(e) {
    e.preventDefault();
    const delta = -e.deltaY * 0.0012;
    setTransform((t) => {
      const k = Math.min(2.6, Math.max(0.35, t.k + delta * t.k));
      return { ...t, k };
    });
  }

  function onPointerDown(e) {
    dragState.current = { startX: e.clientX, startY: e.clientY, origin: { ...transform } };
  }
  function onPointerMove(e) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setTransform((t) => ({ ...t, x: dragState.current.origin.x + dx, y: dragState.current.origin.y + dy }));
  }
  function onPointerUp() {
    dragState.current = null;
  }

  const resetView = useCallback(() => setTransform({ x: 0, y: 0, k: 1 }), []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        flex: '1 1 auto',
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
        background: 'var(--bg-0)',
        borderRadius: 10,
      }}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <svg width={size.width} height={size.height} style={{ cursor: dragState.current ? 'grabbing' : 'grab' }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong)" />
          </marker>
        </defs>
        <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}>
          {/* edges */}
          {links.map((l) => {
            const sp = positions[l.source];
            const tp = positions[l.target];
            if (!sp || !tp) return null;
            const meta = CONFIDENCE[l.confidence] ?? CONFIDENCE.asserted;
            const isHighlighted = highlightEdgeKeys.has(`${l.source}>${l.target}`);
            const midX = (sp.x + tp.x) / 2;
            const midY = (sp.y + tp.y) / 2;
            return (
              <g key={l.id} opacity={highlightPath && !isHighlighted ? 0.15 : 1}>
                <line
                  x1={sp.x}
                  y1={sp.y}
                  x2={tp.x}
                  y2={tp.y}
                  stroke={isHighlighted ? 'var(--accent)' : meta.colour}
                  strokeWidth={isHighlighted ? 2.6 : 1.4}
                  strokeDasharray={l.confidence === 'disputed' ? '5 3' : undefined}
                  markerEnd="url(#arrow)"
                />
                <text
                  x={midX}
                  y={midY}
                  fontSize={9.5}
                  fill="var(--text-muted)"
                  textAnchor="middle"
                  style={{ paintOrder: 'stroke', stroke: 'var(--bg-0)', strokeWidth: 3 }}
                >
                  {l.label}
                </text>
              </g>
            );
          })}

          {/* nodes */}
          {nodes.map((n) => {
            const p = positions[n.id];
            if (!p) return null;
            const typeMeta = POLE_TYPES[n.type] ?? POLE_TYPES.object;
            const isSelected = n.id === selectedId;
            const isDimmed = highlightPath && !highlightSet.has(n.id);
            const r = n.type === 'person' || n.type === 'organisation' ? 16 : 12;
            return (
              <g
                key={n.id}
                transform={`translate(${p.x} ${p.y})`}
                opacity={isDimmed ? 0.25 : 1}
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(n.id);
                }}
              >
                <circle
                  r={r}
                  fill={isSelected ? typeMeta.colour : 'var(--bg-2)'}
                  stroke={typeMeta.colour}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <text textAnchor="middle" dy={4} fontSize={10} fontWeight={700} fill={isSelected ? '#06151c' : typeMeta.colour}>
                  {typeMeta.code}
                </text>
                <text
                  textAnchor="middle"
                  y={r + 13}
                  fontSize={10.5}
                  fontWeight={600}
                  fill="var(--text-primary)"
                  style={{ paintOrder: 'stroke', stroke: 'var(--bg-0)', strokeWidth: 3 }}
                >
                  {truncate(n.label, 24)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button className="icon-btn" onClick={() => setTransform((t) => ({ ...t, k: Math.min(2.6, t.k + 0.2) }))} title="Zoom in">
          +
        </button>
        <button className="icon-btn" onClick={() => setTransform((t) => ({ ...t, k: Math.max(0.35, t.k - 0.2) }))} title="Zoom out">
          −
        </button>
        <button className="icon-btn" onClick={resetView} title="Reset view">
          ⤾
        </button>
      </div>
    </div>
  );
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
