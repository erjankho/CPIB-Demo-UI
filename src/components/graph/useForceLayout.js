import { useEffect, useRef, useState } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';

/**
 * Runs a d3-force simulation over the given nodes/links and returns live
 * positions. Nodes/links are mutated by d3 (x, y, vx, vy added) — we clone
 * on every tick into React state so components re-render.
 */
export function useForceLayout(nodes, links, { width, height, enabled = true }) {
  const [positions, setPositions] = useState({});
  const simRef = useRef(null);
  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  const nodeKey = nodes.map((n) => n.id).join(',');
  const linkKey = links.map((l) => l.id).join(',');

  // Rebuild the simulation only when the node/link SET changes (not on every
  // resize). Resizing just re-centers the existing simulation in place, so
  // nodes don't reset to the middle and re-drift outward on each tick —
  // which is what caused the graph to visually "slide" after layout.
  useEffect(() => {
    if (!enabled || nodes.length === 0) return;

    const nodeClones = nodes.map((n) => ({ ...n, ...(positionsRef.current[n.id] ?? {}) }));
    const nodeIndex = new Map(nodeClones.map((n) => [n.id, n]));
    const linkClones = links
      .filter((l) => nodeIndex.has(l.source) && nodeIndex.has(l.target))
      .map((l) => ({ ...l }));

    const sim = forceSimulation(nodeClones)
      .force(
        'link',
        forceLink(linkClones)
          .id((d) => d.id)
          .distance(130)
          .strength(0.5),
      )
      .force('charge', forceManyBody().strength(-320))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide(42))
      .alpha(1)
      .alphaDecay(0.04);

    simRef.current = sim;

    sim.on('tick', () => {
      const next = {};
      for (const n of nodeClones) {
        next[n.id] = { x: n.x, y: n.y };
      }
      setPositions(next);
    });

    return () => sim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeKey, linkKey, enabled]);

  // When the container resizes, just move the centering force — don't
  // rebuild/reset the whole simulation.
  useEffect(() => {
    const sim = simRef.current;
    if (!sim || !width || !height) return;
    sim.force('center', forceCenter(width / 2, height / 2));
    sim.alpha(Math.max(sim.alpha(), 0.3)).restart();
  }, [width, height]);

  return positions;
}
