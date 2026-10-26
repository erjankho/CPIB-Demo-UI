/**
 * Human-in-the-loop entity merge suggestions and statement discrepancy flags.
 * "AI suggests, humans approve" — per slide 3 / slide 11 of the deck.
 */

export const mergeSuggestions = [
  {
    id: 'm1',
    kind: 'entity-merge',
    status: 'pending',
    confidence: 0.93,
    entityA: { label: 'David Tan', source: 'EX-01 WhatsApp export', sourceId: 's-wa-01' },
    entityB: { label: 'DTANBK', source: 'DC-03 Procurement access log', sourceId: 's-doc-access' },
    resolvedId: 'p-david',
    rationale:
      'Same device custody chain, matching shift schedule, and the username DTANBK resolves to David Tan Boon Kiat in the MIA staff directory extract.',
    recommendation: 'approve',
  },
  {
    id: 'm2',
    kind: 'entity-merge',
    status: 'pending',
    confidence: 0.88,
    entityA: { label: 'D TAN', source: 'DC-04 Courier delivery record', sourceId: 's-doc-invoice' },
    entityB: { label: 'TAN BOON KIAT DAVID', source: 'DC-05 Paddock Club booking', sourceId: 's-doc-f1' },
    resolvedId: 'p-david',
    rationale: 'Matching delivery address (42 Jalan Kempas) and signature pattern previously confirmed against David Tan\u2019s IC signature on file.',
    recommendation: 'approve',
  },
  {
    id: 'm3',
    kind: 'entity-merge',
    status: 'pending',
    confidence: 0.81,
    entityA: { label: 'Mr Kenneth', source: 'ST-01 Evelyn Lim statement', sourceId: 's-stmt-evelyn' },
    entityB: { label: 'Kenneth Lau Wei Ming', source: 'ST-05 Accused statement', sourceId: 's-stmt-kenneth' },
    resolvedId: 'p-kenneth',
    rationale: 'Only one "Kenneth" appears across all Seacrest-linked correspondence in this case; role and company match.',
    recommendation: 'approve',
  },
  {
    id: 'm4',
    kind: 'entity-merge',
    status: 'pending',
    confidence: 0.47,
    entityA: { label: 'HC', source: 'EX-01 WhatsApp export', sourceId: 's-wa-01' },
    entityB: { label: 'Horizon Crest Advisory Pte Ltd', source: 'DC-01 ACRA extract', sourceId: 's-doc-acra' },
    resolvedId: 'o-horizon',
    rationale:
      'Low confidence: "HC" is a common abbreviation and could also refer to "Harbourfront Centre", which appears elsewhere in the evidence set as a location.',
    recommendation: 'review',
  },
  {
    id: 'm5',
    kind: 'entity-merge',
    status: 'rejected',
    confidence: 0.33,
    entityA: { label: 'Serene', source: 'ST-04 Serene Goh statement', sourceId: 's-stmt-serene' },
    entityB: { label: 'Serena Koh', source: 'EX-02 WhatsApp export (contact name)', sourceId: 's-wa-02' },
    resolvedId: null,
    rationale: 'Different surname spelling and no matching phone number or NRIC fragment. Likely a distinct individual; do not merge.',
    recommendation: 'reject',
    resolution: { decision: 'rejected', by: 'IO Nadiah Rahman', at: '2026-08-20T09:00:00', note: 'Confirmed distinct contact via phone-book export cross-check.' },
  },
  {
    id: 'm6',
    kind: 'entity-merge',
    status: 'approved',
    confidence: 0.96,
    entityA: { label: 'Evelyn Lim', source: 'ST-01 Statement header', sourceId: 's-stmt-evelyn' },
    entityB: { label: 'Evelyn Lim Shu Hui', source: 'MIA staff directory extract', sourceId: 's-stmt-evelyn' },
    resolvedId: 'p-evelyn',
    rationale: 'Exact full-name match against staff directory, same employee ID referenced in statement header.',
    recommendation: 'approve',
    resolution: { decision: 'approved', by: 'IO Nadiah Rahman', at: '2026-08-06T10:12:00' },
  },
];

/**
 * Cross-statement discrepancy flags — "Statement Analysis" module.
 * Each entry compares what different sources say about the same fact.
 */
export const discrepancies = [
  {
    id: 'd1',
    topic: 'Did David Tan and Kenneth Lau ever meet privately?',
    statements: [
      { entityId: 'p-evelyn', label: 'Evelyn Lim (witness)', position: 'Names Kenneth as David Tan\u2019s contact on at least 4 occasions.', sourceId: 's-stmt-evelyn', stance: 'supports' },
      { entityId: 'p-kenneth', label: 'Audio recording (both subjects, voice-ID)', position: 'Captures a private carpark meeting between the two, 18 Mar 2026.', sourceId: 's-audio-01', stance: 'supports' },
      { entityId: 'p-david', label: 'David Tan (accused)', position: 'States he was never present at any meeting with Kenneth Lau outside official proceedings.', sourceId: 's-stmt-david', stance: 'contradicts' },
    ],
    severity: 'high',
  },
  {
    id: 'd2',
    topic: 'Amount and purpose of the Labuan remittance',
    statements: [
      { entityId: 'p-serene', label: 'Serene Goh (director)', position: 'RM 150,000 remitted to Pinnacle Harbour; did not know the beneficiary.', sourceId: 's-fin-02', stance: 'supports' },
      { entityId: 'p-kenneth', label: 'Kenneth Lau (accused)', position: 'Says the remittance was RM 50,000 and a personal loan repayment, unrelated to the tender.', sourceId: 's-stmt-kenneth', stance: 'contradicts' },
    ],
    severity: 'high',
  },
  {
    id: 'd3',
    topic: 'Receipt of the wristwatch and F1 passes',
    statements: [
      { entityId: 'obj-watch', label: 'Courier delivery record', position: 'Delivered to 42 Jalan Kempas, signed "D TAN".', sourceId: 's-doc-invoice', stance: 'supports' },
      { entityId: 'obj-f1', label: 'Paddock Club booking', position: 'Lists David Tan and spouse as named guests.', sourceId: 's-doc-f1', stance: 'supports' },
      { entityId: 'p-david', label: 'David Tan (accused)', position: 'Categorically denies receiving any watch or item of value.', sourceId: 's-stmt-david', stance: 'contradicts' },
    ],
    severity: 'high',
  },
  {
    id: 'd4',
    topic: 'Was the technical re-scoring justified?',
    statements: [
      { entityId: 'p-marcus', label: 'Marcus Ong (TEC secretary)', position: 'No new submission was received; re-scoring was unusual.', sourceId: 's-stmt-marcus', stance: 'supports' },
      { entityId: 'p-david', label: 'TEC revision log', position: 'Revision 2 changed weighting 40% \u2192 55% with David Tan as approver.', sourceId: 's-doc-tec', stance: 'neutral' },
    ],
    severity: 'medium',
  },
];
