import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { entities, entityById } from '../../data/entities.js';
import { relationships, buildAdjacency, findPaths } from '../../data/relationships.js';
import { POLE_TYPES, CONFIDENCE } from '../../data/caseData.js';
import { GraphCanvas } from './GraphCanvas.jsx';
import { NodeDetailPanel } from './NodeDetailPanel.jsx';
import { Badge } from '../common/Badge.jsx';

export function GraphExplorer() {
  const { graphFocusPath, setGraphFocusPath } = useApp();
  const [typeFilters, setTypeFilters] = useState(() => new Set(Object.keys(POLE_TYPES)));
  const [confidenceFilters, setConfidenceFilters] = useState(() => new Set(Object.keys(CONFIDENCE)));
  const [selectedId, setSelectedId] = useState(graphFocusPath?.[0] ?? null);
  const [search, setSearch] = useState('');
  const [pathFrom, setPathFrom] = useState('');
  const [pathTo, setPathTo] = useState('');
  const [computedPaths, setComputedPaths] = useState(null);

  useEffect(() => {
    if (graphFocusPath && graphFocusPath.length) {
      setSelectedId(graphFocusPath[graphFocusPath.length - 1]);
    }
  }, [graphFocusPath]);

  const filteredEdges = useMemo(
    () => relationships.filter((r) => confidenceFilters.has(r.confidence)),
    [confidenceFilters],
  );

  const visibleEntityIds = useMemo(() => {
    const ids = new Set();
    for (const e of entities) {
      if (typeFilters.has(e.type)) ids.add(e.id);
    }
    return ids;
  }, [typeFilters]);

  const graphEdges = useMemo(
    () => filteredEdges.filter((r) => visibleEntityIds.has(r.source) && visibleEntityIds.has(r.target)),
    [filteredEdges, visibleEntityIds],
  );

  const graphNodes = useMemo(() => {
    const connected = new Set(graphEdges.flatMap((e) => [e.source, e.target]));
    return entities.filter((e) => visibleEntityIds.has(e.id) && (connected.has(e.id) || graphEdges.length === 0));
  }, [graphEdges, visibleEntityIds]);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return entities.filter((e) => e.label.toLowerCase().includes(q) || e.aliases?.some((a) => a.toLowerCase().includes(q))).slice(0, 8);
  }, [search]);

  const adjacency = useMemo(() => buildAdjacency(relationships), []);
  const relatedEdges = selectedId ? adjacency.get(selectedId) ?? [] : [];
  const selectedEntity = selectedId ? entityById[selectedId] : null;

  function toggleType(key) {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function toggleConfidence(key) {
    setConfidenceFilters((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function runPathfinder() {
    if (!pathFrom || !pathTo) return;
    const paths = findPaths(relationships, pathFrom, pathTo, 4);
    setComputedPaths(paths);
    if (paths.length > 0) {
      setGraphFocusPath(paths[0]);
    }
  }

  const activePath = graphFocusPath;

  return (
    <div className="page" style={{ maxWidth: 1480 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Graph Explorer — POLE Knowledge Graph</h1>
          <p className="page-subtitle">
            People, Organisations, Objects/Evidence, Locations and Events extracted from the case evidence. Click a
            node for cited facts; ask a two-entity question below to trace multi-hop connections.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="flex gap-14 wrap items-center">
          <div className="flex gap-6 items-center">
            <span className="text-muted" style={{ fontSize: 11.5 }}>
              TYPE
            </span>
            {Object.values(POLE_TYPES).map((t) => (
              <button
                key={t.key}
                className="chip"
                style={{
                  cursor: 'pointer',
                  opacity: typeFilters.has(t.key) ? 1 : 0.35,
                  borderColor: t.colour,
                  color: typeFilters.has(t.key) ? t.colour : 'var(--text-muted)',
                }}
                onClick={() => toggleType(t.key)}
              >
                {t.code} {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-6 items-center">
            <span className="text-muted" style={{ fontSize: 11.5 }}>
              CONFIDENCE
            </span>
            {Object.values(CONFIDENCE).map((c) => (
              <button
                key={c.key}
                className="chip"
                style={{
                  cursor: 'pointer',
                  opacity: confidenceFilters.has(c.key) ? 1 : 0.35,
                  borderColor: c.colour,
                  color: confidenceFilters.has(c.key) ? c.colour : 'var(--text-muted)',
                }}
                onClick={() => toggleConfidence(c.key)}
                title={c.hint}
              >
                {c.label}
              </button>
            ))}
          </div>
          {activePath && (
            <button className="btn btn-sm" onClick={() => setGraphFocusPath(null)}>
              ✕ Clear path highlight
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="flex gap-10 wrap items-center">
          <strong style={{ fontSize: 12.5 }}>Investigator asks:</strong>
          <select className="select" value={pathFrom} onChange={(e) => setPathFrom(e.target.value)} style={{ minWidth: 180 }}>
            <option value="">Select entity A…</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
          <span className="text-muted">connected to</span>
          <select className="select" value={pathTo} onChange={(e) => setPathTo(e.target.value)} style={{ minWidth: 180 }}>
            <option value="">Select entity B…</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
          <button className="btn btn-primary btn-sm" onClick={runPathfinder} disabled={!pathFrom || !pathTo}>
            Find paths
          </button>
          {computedPaths !== null && (
            <span className="text-secondary" style={{ fontSize: 12 }}>
              {computedPaths.length === 0
                ? 'No path found within 4 hops.'
                : `${computedPaths.length} path(s) found · shortest ${computedPaths[0].length - 1} hop(s)`}
            </span>
          )}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2.1fr 1fr', height: '58vh', minHeight: 460 }}>
        <div style={{ position: 'relative', height: '100%', minHeight: 0, minWidth: 0 }}>
          <div className="card" style={{ height: '100%', minHeight: 0, padding: 8, display: 'flex', flexDirection: 'column' }}>
            <GraphCanvas
              nodes={graphNodes}
              links={graphEdges}
              selectedId={selectedId}
              onSelect={setSelectedId}
              highlightPath={activePath}
            />
          </div>

          {search && (
            <div
              className="card"
              style={{
                position: 'absolute',
                top: 44,
                left: 16,
                width: 280,
                maxHeight: 260,
                overflowY: 'auto',
                zIndex: 5,
                padding: 8,
              }}
            >
              {searchResults.length === 0 ? (
                <div className="text-muted" style={{ fontSize: 12, padding: 6 }}>
                  No matches
                </div>
              ) : (
                searchResults.map((e) => (
                  <div
                    key={e.id}
                    className="list-row"
                    style={{ padding: '6px 8px' }}
                    onClick={() => {
                      setSelectedId(e.id);
                      setSearch('');
                    }}
                  >
                    <span style={{ fontSize: 12 }}>{e.label}</span>
                    <Badge tone="neutral">{POLE_TYPES[e.type]?.code}</Badge>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="search-input-wrap" style={{ position: 'absolute', top: 16, left: 16, width: 260 }}>
            <span className="search-icon">🔎</span>
            <input className="input" placeholder="Find entity…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div style={{ height: '100%', minHeight: 0 }}>
          <NodeDetailPanel
            entity={selectedEntity}
            relatedEdges={relatedEdges}
            entityById={entityById}
            onSelectEntity={setSelectedId}
            onClose={() => setSelectedId(null)}
          />
        </div>
      </div>
    </div>
  );
}
