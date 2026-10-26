/**
 * Graph edges connecting POLE entities for Operation Harbour Crest.
 * `confidence` is one of 'corroborated' | 'asserted' | 'disputed' and
 * drives colour/line-style in the Graph Explorer and discrepancy flags
 * in Statement Analysis.
 */

export const relationships = [
  {
    id: 'r1',
    source: 'p-david',
    target: 'o-mia',
    label: 'is Deputy Director of',
    confidence: 'corroborated',
    cites: ['s-doc-tec'],
  },
  {
    id: 'r2',
    source: 'p-david',
    target: 'ev-award',
    label: 'chaired evaluation for',
    confidence: 'corroborated',
    cites: ['s-doc-tec'],
  },
  {
    id: 'r3',
    source: 'o-seacrest',
    target: 'ev-award',
    label: 'was awarded',
    confidence: 'corroborated',
    cites: ['s-doc-tec'],
  },
  {
    id: 'r4',
    source: 'p-kenneth',
    target: 'o-seacrest',
    label: 'is Business Development Director of',
    confidence: 'corroborated',
    cites: ['s-stmt-kenneth'],
  },
  {
    id: 'r5',
    source: 'p-kenneth',
    target: 'o-horizon',
    label: 'operated exclusively at the direction of (per director)',
    confidence: 'corroborated',
    cites: ['s-stmt-serene', 's-wa-02'],
  },
  {
    id: 'r6',
    source: 'p-serene',
    target: 'o-horizon',
    label: 'is sole director of',
    confidence: 'corroborated',
    cites: ['s-doc-acra'],
  },
  {
    id: 'r7',
    source: 'o-seacrest',
    target: 'o-horizon',
    label: 'paid SGD 420,000 to',
    confidence: 'corroborated',
    cites: ['s-fin-01'],
  },
  {
    id: 'r8',
    source: 'o-horizon',
    target: 'obj-watch',
    label: 'purchased',
    confidence: 'corroborated',
    cites: ['s-doc-invoice'],
  },
  {
    id: 'r9',
    source: 'obj-watch',
    target: 'loc-jalan-kempas',
    label: 'delivered to',
    confidence: 'corroborated',
    cites: ['s-doc-invoice'],
  },
  {
    id: 'r10',
    source: 'p-david',
    target: 'loc-jalan-kempas',
    label: 'resides at / signed for delivery',
    confidence: 'disputed',
    cites: ['s-doc-invoice', 's-stmt-david'],
    dispute: {
      forCites: ['s-doc-invoice'],
      againstCites: ['s-stmt-david'],
      note: 'Delivery slip signed "D TAN"; David Tan\u2019s statement categorically denies receiving the item.',
    },
  },
  {
    id: 'r11',
    source: 'o-horizon',
    target: 'obj-f1',
    label: 'purchased',
    confidence: 'corroborated',
    cites: ['s-doc-f1'],
  },
  {
    id: 'r12',
    source: 'p-david',
    target: 'obj-f1',
    label: 'named guest on booking',
    confidence: 'disputed',
    cites: ['s-doc-f1', 's-stmt-david'],
    dispute: {
      forCites: ['s-doc-f1'],
      againstCites: ['s-stmt-david'],
      note: 'Booking lists "TAN BOON KIAT DAVID" as a guest; statement denies receiving any item of value.',
    },
  },
  {
    id: 'r13',
    source: 'p-rachel',
    target: 'obj-f1',
    label: 'named guest on booking',
    confidence: 'corroborated',
    cites: ['s-doc-f1'],
  },
  {
    id: 'r14',
    source: 'p-david',
    target: 'obj-benchmark',
    label: 'exported without second approver',
    confidence: 'corroborated',
    cites: ['s-doc-access', 's-stmt-evelyn'],
  },
  {
    id: 'r15',
    source: 'obj-benchmark',
    target: 'ev-export',
    label: 'exported during',
    confidence: 'corroborated',
    cites: ['s-doc-access'],
  },
  {
    id: 'r16',
    source: 'ev-export',
    target: 'ev-rescore',
    label: 'preceded',
    confidence: 'asserted',
    cites: ['s-doc-tec'],
  },
  {
    id: 'r17',
    source: 'ev-rescore',
    target: 'ev-award',
    label: 'led to',
    confidence: 'asserted',
    cites: ['s-doc-tec'],
  },
  {
    id: 'r18',
    source: 'p-david',
    target: 'ev-rescore',
    label: 'approved revision as chair',
    confidence: 'corroborated',
    cites: ['s-doc-tec'],
  },
  {
    id: 'r19',
    source: 'p-marcus',
    target: 'ev-rescore',
    label: 'flagged as unusual',
    confidence: 'corroborated',
    cites: ['s-stmt-marcus'],
  },
  {
    id: 'r20',
    source: 'p-evelyn',
    target: 'p-david',
    label: 'reports procurement benchmark access of',
    confidence: 'corroborated',
    cites: ['s-stmt-evelyn'],
  },
  {
    id: 'r21',
    source: 'p-evelyn',
    target: 'p-kenneth',
    label: 'names as contact of David Tan',
    confidence: 'corroborated',
    cites: ['s-stmt-evelyn'],
  },
  {
    id: 'r22',
    source: 'p-david',
    target: 'p-kenneth',
    label: 'met privately with',
    confidence: 'disputed',
    cites: ['s-audio-01', 's-stmt-david'],
    dispute: {
      forCites: ['s-audio-01', 's-stmt-evelyn'],
      againstCites: ['s-stmt-david'],
      note: 'Voice-identified in a recorded meeting on 18 Mar 2026; statement denies ever meeting privately.',
    },
  },
  {
    id: 'r23',
    source: 'p-david',
    target: 'loc-carpark',
    label: 'present at (voice-identified)',
    confidence: 'corroborated',
    cites: ['s-audio-01'],
  },
  {
    id: 'r24',
    source: 'p-kenneth',
    target: 'loc-carpark',
    label: 'present at (voice-identified)',
    confidence: 'corroborated',
    cites: ['s-audio-01'],
  },
  {
    id: 'r25',
    source: 'o-horizon',
    target: 'obj-remit1',
    label: 'remitted',
    confidence: 'corroborated',
    cites: ['s-fin-02'],
  },
  {
    id: 'r26',
    source: 'obj-remit1',
    target: 'o-pinnacle',
    label: 'received by',
    confidence: 'corroborated',
    cites: ['s-fin-02'],
  },
  {
    id: 'r27',
    source: 'o-pinnacle',
    target: 'loc-labuan',
    label: 'registered in',
    confidence: 'corroborated',
    cites: ['s-fin-02'],
  },
  {
    id: 'r28',
    source: 'p-serene',
    target: 'obj-remit1',
    label: 'authorised',
    confidence: 'corroborated',
    cites: ['s-fin-02', 's-stmt-serene'],
  },
  {
    id: 'r29',
    source: 'p-kenneth',
    target: 'obj-remit1',
    label: 'instructed (nature disputed)',
    confidence: 'disputed',
    cites: ['s-stmt-serene', 's-stmt-kenneth'],
    dispute: {
      forCites: ['s-stmt-serene'],
      againstCites: ['s-stmt-kenneth'],
      note: 'Director states Lau instructed the remittance for an unknown beneficiary; Lau states it was a personal loan repayment of RM 50,000, not RM 150,000.',
    },
  },
  {
    id: 'r30',
    source: 'p-kenneth',
    target: 'p-serene',
    label: 'directs',
    confidence: 'corroborated',
    cites: ['s-stmt-serene', 's-wa-02'],
  },
];

/** Convenience: adjacency map entityId -> [{edge, otherId}] for BFS. */
export function buildAdjacency(edges) {
  const map = new Map();
  for (const edge of edges) {
    if (!map.has(edge.source)) map.set(edge.source, []);
    if (!map.has(edge.target)) map.set(edge.target, []);
    map.get(edge.source).push({ edge, otherId: edge.target });
    map.get(edge.target).push({ edge, otherId: edge.source });
  }
  return map;
}

/** Breadth-first shortest-path search between two entity ids. Returns an array of paths (edge+node ids) up to maxHops. */
export function findPaths(edges, fromId, toId, maxHops = 4) {
  const adjacency = buildAdjacency(edges);
  const paths = [];
  const queue = [[fromId]];
  const visitedPaths = new Set();

  while (queue.length) {
    const path = queue.shift();
    const current = path[path.length - 1];
    if (path.length - 1 > maxHops) continue;
    if (current === toId && path.length > 1) {
      const key = path.join('>');
      if (!visitedPaths.has(key)) {
        visitedPaths.add(key);
        paths.push(path);
      }
      continue;
    }
    const neighbours = adjacency.get(current) || [];
    for (const { otherId } of neighbours) {
      if (path.includes(otherId)) continue;
      queue.push([...path, otherId]);
    }
  }
  return paths.sort((a, b) => a.length - b.length).slice(0, 10);
}
