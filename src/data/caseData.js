/**
 * ============================================================================
 *  DEMO DATA — FICTIONAL SCENARIO
 * ============================================================================
 *  Bribery scenario: high-value marine procurement, as described in
 *  "Demo and USP for CPIB.pptx" (slide 8 / slide 11 demo flow).
 *
 *  Every person, company, account, document and event below is INVENTED for
 *  demonstration purposes. Any resemblance to a real individual or company is
 *  unintended. No real organisation is implicated in any wrongdoing.
 * ============================================================================
 */

export const POLE_TYPES = {
  person: { key: 'person', code: 'P', label: 'Person', colour: '#4fc3f7' },
  organisation: { key: 'organisation', code: 'O', label: 'Organisation', colour: '#b388ff' },
  object: { key: 'object', code: 'O', label: 'Object / Evidence', colour: '#ffb74d' },
  location: { key: 'location', code: 'L', label: 'Location', colour: '#4db6ac' },
  event: { key: 'event', code: 'E', label: 'Event', colour: '#f06292' },
};

/** Edge confidence drives colour + line style in the graph and timeline. */
export const CONFIDENCE = {
  corroborated: {
    key: 'corroborated',
    label: 'Corroborated',
    colour: '#4ade80',
    hint: 'Supported by two or more independent evidence sources',
  },
  asserted: {
    key: 'asserted',
    label: 'Asserted',
    colour: '#94a3b8',
    hint: 'Stated in a single source, not yet independently supported',
  },
  disputed: {
    key: 'disputed',
    label: 'Disputed',
    colour: '#f87171',
    hint: 'Directly contradicted by another evidence source',
  },
};

export const SOURCE_KINDS = {
  whatsapp: { label: 'Chat export', icon: '💬' },
  statement: { label: 'Statement', icon: '📝' },
  document: { label: 'Document', icon: '📄' },
  audio: { label: 'Audio', icon: '🎧' },
  video: { label: 'Video', icon: '🎬' },
  image: { label: 'Image', icon: '🖼️' },
  financial: { label: 'Financial record', icon: '🏦' },
};

/* ---------------------------------------------------------------------------
 *  CASE LIST — drives the Case Management Workbench
 * ------------------------------------------------------------------------ */

export const cases = [
  {
    id: 'CPIB/2026/0147',
    slug: 'harbour-crest',
    title: 'Operation Harbour Crest',
    summary:
      'Suspected corrupt gratification in the award of marine dredging contract T/2026/MD/0084 (SGD 48.6m) by the Maritime Infrastructure Authority to Seacrest Coastal & Marine Works.',
    offence: 'Prevention of Corruption Act, s.6(a) / s.6(b)',
    status: 'Under investigation',
    priority: 'High',
    classification: 'Official (Closed) — Sensitive',
    officer: 'IO Nadiah Rahman',
    officerInitials: 'NR',
    supervisor: 'SIO Daniel Chong',
    opened: '2026-07-22',
    lastActivity: '2026-09-28T16:42:00',
    stage: 4,
    contractValue: 48600000,
    isDemoCase: true,
    tags: ['Procurement', 'Shell company', 'Offshore', 'Multilingual audio'],
  },
  {
    id: 'CPIB/2026/0162',
    slug: 'blue-meridian',
    title: 'Operation Blue Meridian',
    summary:
      'Alleged kickbacks on facilities-management renewals across three statutory boards. Awaiting second tranche of banking records.',
    offence: 'Prevention of Corruption Act, s.6(a)',
    status: 'Evidence ingestion',
    priority: 'Medium',
    classification: 'Official (Closed) — Sensitive',
    officer: 'IO Faisal Omar',
    officerInitials: 'FO',
    supervisor: 'SIO Daniel Chong',
    opened: '2026-08-14',
    lastActivity: '2026-09-27T11:05:00',
    stage: 2,
    contractValue: 7400000,
    tags: ['Facilities', 'Kickback'],
  },
  {
    id: 'CPIB/2026/0118',
    slug: 'granite-ledger',
    title: 'Operation Granite Ledger',
    summary:
      'Falsified consultancy invoices routed through two intermediaries. Statement analysis complete; preparing investigation paper.',
    offence: 'Penal Code s.477A / PCA s.6(c)',
    status: 'Pending supervisor review',
    priority: 'High',
    classification: 'Official (Closed) — Sensitive',
    officer: 'IO Priya Menon',
    officerInitials: 'PM',
    supervisor: 'SIO Daniel Chong',
    opened: '2026-05-30',
    lastActivity: '2026-09-26T09:18:00',
    stage: 5,
    contractValue: 2150000,
    tags: ['Invoicing', 'Intermediary'],
  },
  {
    id: 'CPIB/2025/0903',
    slug: 'silver-quay',
    title: 'Operation Silver Quay',
    summary:
      'Concluded. Two charges proceeded with; retained as reference case for cross-case comparison of shell-company typologies.',
    offence: 'Prevention of Corruption Act, s.6(b)',
    status: 'Closed',
    priority: 'Low',
    classification: 'Official (Closed)',
    officer: 'IO Nadiah Rahman',
    officerInitials: 'NR',
    supervisor: 'SIO Daniel Chong',
    opened: '2025-11-03',
    lastActivity: '2026-06-12T15:30:00',
    stage: 5,
    contractValue: 12900000,
    tags: ['Reference case', 'Shell company'],
  },
];

/** The five-step investigation journey from slide 6 of the deck. */
export const journeySteps = [
  { id: 1, label: 'Start the case', detail: 'Isolated evidence box created; chats, statements and media uploaded.' },
  { id: 2, label: 'Build the case graph', detail: 'People, companies, objects, locations and events extracted from raw text.' },
  { id: 3, label: 'Investigate', detail: 'Graph traversal and keyword search answer relationship questions with citations.' },
  { id: 4, label: 'Verify the facts', detail: 'Citations checked, entity merges approved, statements compared for discrepancies.' },
  { id: 5, label: 'Prepare the conclusion', detail: 'Cited summary of supported facts and open discrepancies for the Case Supervisor.' },
];
