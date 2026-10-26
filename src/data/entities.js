/**
 * POLE entities (People, Organisations, Objects, Locations, Events) for
 * Operation Harbour Crest (fictional demo scenario).
 */

export const entities = [
  /* ---------------------------- People ---------------------------- */
  {
    id: 'p-david',
    type: 'person',
    label: 'David Tan Boon Kiat',
    subtitle: 'Deputy Director (Procurement), MIA · TEC Chair',
    standing: 'Subject',
    aliases: ['David Tan', 'DTANBK', 'D TAN', 'TAN BOON KIAT DAVID'],
    attributes: [
      ['Role', 'Deputy Director, Procurement'],
      ['Committee', 'Chair, Tender Evaluation Committee T/2026/MD/0084'],
      ['Service', '14 years'],
      ['Statement', 'Recorded 2026-08-12 (ST-03)'],
    ],
    facts: [
      { text: 'Chaired the evaluation committee that awarded contract T/2026/MD/0084.', cites: ['s-doc-tec'] },
      { text: 'Exported benchmark dataset BM-2026-04 at 23:41 with no second approver.', cites: ['s-doc-access'] },
      { text: 'Witness states he had unilateral ability to extract procurement benchmarks.', cites: ['s-stmt-evelyn'] },
      { text: 'Named as recipient of a wristwatch delivered to his residence, signed for in his name.', cites: ['s-doc-invoice'] },
      { text: 'Denies receiving any item of value, and denies meeting Kenneth Lau privately.', cites: ['s-stmt-david'] },
    ],
  },
  {
    id: 'p-kenneth',
    type: 'person',
    label: 'Kenneth Lau Wei Ming',
    subtitle: 'Business Development Director, Seacrest',
    standing: 'Subject',
    aliases: ['Kenneth Lau', 'Mr Kenneth', 'KL'],
    attributes: [
      ['Role', 'Business Development Director'],
      ['Employer', 'Seacrest Coastal & Marine Works Pte Ltd'],
      ['Devices seized', 'KL-03'],
      ['Statement', 'Recorded 2026-08-19 (ST-05)'],
    ],
    facts: [
      { text: 'Directed the activities of Horizon Crest Advisory while holding no formal office in it.', cites: ['s-stmt-serene', 's-wa-02'] },
      { text: 'Instructed the nominee director to invoice a wristwatch as advisory expenses.', cites: ['s-wa-02'] },
      { text: 'Identified by voice as SPEAKER_1 in the carpark recording of 18 Mar 2026.', cites: ['s-audio-01'] },
      { text: 'States the Labuan remittance was RM 50,000 and a personal loan repayment.', cites: ['s-stmt-kenneth'] },
    ],
  },
  {
    id: 'p-evelyn',
    type: 'person',
    label: 'Evelyn Lim Shu Hui',
    subtitle: 'Senior Manager (Finance & Contracts), MIA',
    standing: 'Witness',
    aliases: ['Evelyn Lim'],
    attributes: [
      ['Role', 'Senior Manager, Finance & Contracts'],
      ['Statement', 'Recorded 2026-08-05, 14:05 (ST-01)'],
    ],
    facts: [
      { text: 'States the subject had unilateral ability to extract internal procurement benchmarks.', cites: ['s-stmt-evelyn'] },
      { text: 'Named Kenneth Lau as David Tan\u2019s point of contact on at least four occasions.', cites: ['s-stmt-evelyn'] },
    ],
  },
  {
    id: 'p-marcus',
    type: 'person',
    label: 'Marcus Ong Jia Wei',
    subtitle: 'Procurement Executive, MIA · TEC Secretary',
    standing: 'Witness',
    aliases: ['Marcus Ong'],
    attributes: [
      ['Role', 'TEC Secretary'],
      ['Statement', 'Recorded 2026-08-07, 10:30 (ST-02)'],
    ],
    facts: [
      { text: 'Raised that the technical re-scoring was unusual as no new submission had been received.', cites: ['s-stmt-marcus', 's-doc-tec'] },
      { text: 'Was told the matter had been settled at a higher level.', cites: ['s-stmt-marcus'] },
    ],
  },
  {
    id: 'p-serene',
    type: 'person',
    label: 'Serene Goh Mei Ling',
    subtitle: 'Sole Director, Horizon Crest Advisory',
    standing: 'Witness',
    aliases: ['Serene Goh', 'GOH MEI LING, SERENE'],
    attributes: [
      ['Role', 'Nominee director (self-described)'],
      ['Statement', 'Recorded 2026-08-14, 11:00 (ST-04)'],
    ],
    facts: [
      { text: 'States she was sole director on paper only; Kenneth Lau directed the company.', cites: ['s-stmt-serene'] },
      { text: 'Signed the RM 150,000 remittance to Pinnacle Harbour on Kenneth Lau\u2019s instruction.', cites: ['s-stmt-serene', 's-fin-02'] },
    ],
  },
  {
    id: 'p-rachel',
    type: 'person',
    label: 'Rachel Tan Hui Ying',
    subtitle: 'Spouse of David Tan',
    standing: 'Person of interest',
    aliases: ['TAN HUI YING RACHEL'],
    attributes: [['Relationship', 'Spouse of subject David Tan']],
    facts: [
      { text: 'Listed as a guest on the Paddock Club booking billed to Horizon Crest.', cites: ['s-doc-f1'] },
    ],
  },

  /* ------------------------- Organisations ------------------------- */
  {
    id: 'o-mia',
    type: 'organisation',
    label: 'Maritime Infrastructure Authority',
    subtitle: 'Statutory board · Procuring entity',
    standing: 'Victim organisation',
    aliases: ['MIA'],
    attributes: [['Role', 'Issued and awarded T/2026/MD/0084']],
    facts: [{ text: 'Procuring entity for contract T/2026/MD/0084, value SGD 48.6m.', cites: ['s-doc-tec'] }],
  },
  {
    id: 'o-seacrest',
    type: 'organisation',
    label: 'Seacrest Coastal & Marine Works Pte Ltd',
    subtitle: 'Tenderer · Awarded contractor',
    standing: 'Subject organisation',
    aliases: ['Seacrest'],
    attributes: [
      ['Role', 'Awarded contractor, T/2026/MD/0084'],
      ['Employer of', 'Kenneth Lau Wei Ming'],
    ],
    facts: [
      { text: 'Moved from rank 3 to rank 1 after an unexplained technical re-scoring.', cites: ['s-doc-tec'] },
      { text: 'Paid SGD 420,000 into Horizon Crest Advisory over two tranches as "advisory" fees.', cites: ['s-fin-01'] },
    ],
  },
  {
    id: 'o-horizon',
    type: 'organisation',
    label: 'Horizon Crest Advisory Pte Ltd',
    subtitle: 'Management consultancy · Incorporated 11 Feb 2026',
    standing: 'Shell / conduit company',
    aliases: ['Horizon Crest', 'HC'],
    attributes: [
      ['Incorporated', '11 Feb 2026'],
      ['Paid-up capital', 'SGD 1,000'],
      ['Director', 'Serene Goh Mei Ling (sole)'],
    ],
    facts: [
      { text: 'Incorporated five weeks before the first payment from Seacrest.', cites: ['s-doc-acra', 's-fin-01'] },
      { text: 'Operated exclusively at the direction of Kenneth Lau, per the sole director\u2019s own statement.', cites: ['s-stmt-serene'] },
      { text: 'Purchased the wristwatch and the Paddock Club passes later linked to David Tan.', cites: ['s-doc-invoice', 's-doc-f1'] },
    ],
  },
  {
    id: 'o-pinnacle',
    type: 'organisation',
    label: 'Pinnacle Harbour Holdings Ltd',
    subtitle: 'Labuan-registered holding company',
    standing: 'Offshore recipient',
    aliases: ['Pinnacle Harbour'],
    attributes: [['Jurisdiction', 'Labuan, Malaysia']],
    facts: [
      { text: 'Received RM 150,000 from Horizon Crest on 30 Jun 2026, beneficial owner unverified.', cites: ['s-fin-02'] },
    ],
  },

  /* --------------------------- Objects ----------------------------- */
  {
    id: 'obj-watch',
    type: 'object',
    label: 'Rolex Cosmograph Daytona (ref 126500LN)',
    subtitle: 'SGD 52,400 · Invoice INV-884120',
    standing: 'Evidence',
    attributes: [
      ['Purchaser', 'Horizon Crest Advisory Pte Ltd'],
      ['Delivery', '42 Jalan Kempas, signed "D TAN"'],
    ],
    facts: [{ text: 'Purchased by Horizon Crest and delivered to an address linked to David Tan.', cites: ['s-doc-invoice'] }],
  },
  {
    id: 'obj-f1',
    type: 'object',
    label: 'F1 Paddock Club passes (×4)',
    subtitle: 'SGD 29,600 · Booking PC-2026-7741',
    standing: 'Evidence',
    attributes: [['Billed to', 'Horizon Crest Advisory Pte Ltd']],
    facts: [{ text: 'Four Paddock Club passes billed to Horizon Crest; guest list includes David Tan and family.', cites: ['s-doc-f1'] }],
  },
  {
    id: 'obj-benchmark',
    type: 'object',
    label: 'Benchmark dataset BM-2026-04',
    subtitle: 'Internal procurement cost benchmarks',
    standing: 'Evidence',
    attributes: [['Exported by', 'DTANBK, 2026-04-02 23:41']],
    facts: [{ text: 'Exported outside working hours with no second approver recorded.', cites: ['s-doc-access'] }],
  },
  {
    id: 'obj-remit1',
    type: 'object',
    label: 'Remittance — RM 150,000 to Pinnacle Harbour',
    subtitle: '30 Jun 2026',
    standing: 'Evidence',
    attributes: [['Authorised by', 'Serene Goh Mei Ling']],
    facts: [{ text: 'Outward remittance from Horizon Crest to a Labuan holding company.', cites: ['s-fin-02'] }],
  },

  /* -------------------------- Locations ----------------------------- */
  {
    id: 'loc-carpark',
    type: 'location',
    label: 'Carpark, Level 3 — Harbourfront Tower',
    subtitle: 'Meeting location, 18 Mar 2026',
    standing: 'Evidence location',
    attributes: [],
    facts: [{ text: 'Location of the recorded 18 Mar 2026 meeting between the two subjects.', cites: ['s-audio-01'] }],
  },
  {
    id: 'loc-jalan-kempas',
    type: 'location',
    label: '42 Jalan Kempas',
    subtitle: 'Delivery address — wristwatch',
    standing: 'Evidence location',
    attributes: [],
    facts: [{ text: 'Delivery address for the wristwatch purchased by Horizon Crest.', cites: ['s-doc-invoice'] }],
  },
  {
    id: 'loc-labuan',
    type: 'location',
    label: 'Labuan, Malaysia',
    subtitle: 'Offshore financial jurisdiction',
    standing: 'Evidence location',
    attributes: [],
    facts: [{ text: 'Jurisdiction of beneficiary Pinnacle Harbour Holdings Ltd.', cites: ['s-fin-02'] }],
  },

  /* --------------------------- Events ------------------------------- */
  {
    id: 'ev-export',
    type: 'event',
    label: 'Benchmark dataset exported',
    subtitle: '02 Apr 2026, 23:41',
    standing: 'Key event',
    attributes: [],
    facts: [{ text: 'BM-2026-04 exported outside working hours, no second approver.', cites: ['s-doc-access'] }],
  },
  {
    id: 'ev-rescore',
    type: 'event',
    label: 'Technical re-scoring (Revision 2)',
    subtitle: '21 May 2026, 10:20',
    standing: 'Key event',
    attributes: [],
    facts: [{ text: 'Technical weighting changed 40% \u2192 55%, moving Seacrest from rank 3 to rank 1.', cites: ['s-doc-tec'] }],
  },
  {
    id: 'ev-award',
    type: 'event',
    label: 'Contract T/2026/MD/0084 awarded to Seacrest',
    subtitle: '02 Jun 2026',
    standing: 'Key event',
    attributes: [],
    facts: [{ text: 'MIA awarded the SGD 48.6m dredging contract to Seacrest Coastal & Marine Works.', cites: ['s-doc-tec'] }],
  },
];

export const entityById = Object.fromEntries(entities.map((e) => [e.id, e]));
