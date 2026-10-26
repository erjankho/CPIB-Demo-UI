/**
 * Scripted Investigator Co-Pilot Q&A for the demo.
 * Mirrors slide 18: graph search + keyword search feed the case AI agent,
 * which returns a cited answer. Selecting a suggested question "runs" the
 * matching retrieval trace deterministically (no live LLM call).
 */

export const suggestedQuestions = [
  'How is David Tan connected to Horizon Crest?',
  'Does David Tan know Kenneth Lau?',
  'What evidence links David Tan to the wristwatch?',
  'Summarise the discrepancies in Kenneth Lau\u2019s statement',
  'Who authorised the Labuan remittance?',
];

export const copilotScript = [
  {
    question: 'How is David Tan connected to Horizon Crest?',
    graphHits: [
      'David Tan \u2194 Horizon Crest Advisory \u00b7 14 paths, shortest 3 hops',
      'David Tan \u00b7 5 matches',
      'Horizon Crest Advisory \u00b7 7 matches',
    ],
    keywordHits: [
      'David Tan Horizon Crest Advisory wristwatch \u00b7 4 sources',
      'David Tan Jalan Kempas delivery \u00b7 2 sources',
    ],
    answer:
      'David Tan is not a director or shareholder of Horizon Crest Advisory. The connection runs through two intermediaries: Kenneth Lau directs Horizon Crest\u00b9 though he holds no formal office in it, and Horizon Crest purchased a wristwatch\u00b2 that was delivered to an address linked to David Tan and signed "D TAN"\u00b3. David Tan\u2019s own statement denies any such receipt\u2074.',
    citations: [
      { marker: 1, sourceId: 's-stmt-serene', label: 'ST-04 \u00b7 Serene Goh statement' },
      { marker: 2, sourceId: 's-doc-invoice', label: 'DC-04 \u00b7 Retailer invoice' },
      { marker: 3, sourceId: 's-doc-invoice', label: 'DC-04 \u00b7 Courier delivery record' },
      { marker: 4, sourceId: 's-stmt-david', label: 'ST-03 \u00b7 David Tan statement' },
    ],
    highlightPath: ['p-david', 'loc-jalan-kempas', 'obj-watch', 'o-horizon'],
  },
  {
    question: 'Does David Tan know Kenneth Lau?',
    graphHits: [
      'David Tan \u2194 Kenneth Lau \u00b7 10 paths, shortest 2 hops',
      'David Tan \u00b7 3 matches',
      'Kenneth Lau \u00b7 6 matches',
    ],
    keywordHits: [
      'David Tan Kenneth Lau carpark \u00b7 3 sources',
      'David Tan Kenneth Lau contact \u00b7 2 sources',
    ],
    answer:
      'Yes, with a direct contradiction worth flagging. Witness Evelyn Lim names Kenneth Lau as David Tan\u2019s point of contact on at least four occasions\u00b9. A recovered audio recording from 18 Mar 2026 voice-identifies both men at a private meeting\u00b2. David Tan\u2019s own statement denies ever meeting Kenneth Lau outside official committee proceedings\u00b3 \u2014 this is a disputed relationship in Fact Audit.',
    citations: [
      { marker: 1, sourceId: 's-stmt-evelyn', label: 'ST-01 \u00b7 Evelyn Lim statement' },
      { marker: 2, sourceId: 's-audio-01', label: 'AU-01 \u00b7 Carpark recording' },
      { marker: 3, sourceId: 's-stmt-david', label: 'ST-03 \u00b7 David Tan statement' },
    ],
    highlightPath: ['p-david', 'loc-carpark', 'p-kenneth'],
  },
  {
    question: 'What evidence links David Tan to the wristwatch?',
    graphHits: ['David Tan \u2194 Rolex Cosmograph Daytona \u00b7 2 paths, shortest 3 hops'],
    keywordHits: ['David Tan watch Jalan Kempas \u00b7 3 sources', 'Rolex Cosmograph Daytona Horizon Crest \u00b7 2 sources'],
    answer:
      'A Rolex Cosmograph Daytona (ref 126500LN, SGD 52,400) was purchased by Horizon Crest Advisory on 24 Mar 2026\u00b9, two days after Kenneth Lau instructed the director by message to invoice it as "advisory expenses" and deliver it to the Jalan Kempas address\u00b2. The courier record shows delivery on 26 Mar 2026, signed "D TAN"\u00b3. David Tan\u2019s statement categorically denies receiving any watch or item of value\u2074.',
    citations: [
      { marker: 1, sourceId: 's-doc-invoice', label: 'DC-04 \u00b7 Retailer invoice' },
      { marker: 2, sourceId: 's-wa-02', label: 'EX-02 \u00b7 WhatsApp export' },
      { marker: 3, sourceId: 's-doc-invoice', label: 'DC-04 \u00b7 Courier delivery record' },
      { marker: 4, sourceId: 's-stmt-david', label: 'ST-03 \u00b7 David Tan statement' },
    ],
    highlightPath: ['p-david', 'loc-jalan-kempas', 'obj-watch', 'o-horizon', 'p-kenneth'],
  },
  {
    question: 'Summarise the discrepancies in Kenneth Lau\u2019s statement',
    graphHits: ['Kenneth Lau \u00b7 6 matches', 'Kenneth Lau \u2194 Pinnacle Harbour \u00b7 3 paths, shortest 2 hops'],
    keywordHits: ['Kenneth Lau Labuan remittance \u00b7 2 sources', 'Kenneth Lau carpark meeting \u00b7 1 source'],
    answer:
      'Two discrepancies stand out. First, Kenneth Lau describes the Labuan remittance as RM 50,000 and a personal loan repayment\u00b9, while the bank remittance advice and the director\u2019s own statement put it at RM 150,000 with no stated beneficiary relationship\u00b2. Second, Kenneth Lau\u2019s account of Horizon Crest as "genuine market advisory work"\u00b3 is at odds with the sole director\u2019s statement that the company operated exclusively at his direction\u2074.',
    citations: [
      { marker: 1, sourceId: 's-stmt-kenneth', label: 'ST-05 \u00b7 Kenneth Lau statement' },
      { marker: 2, sourceId: 's-fin-02', label: 'FN-02 \u00b7 Remittance advice' },
      { marker: 3, sourceId: 's-stmt-kenneth', label: 'ST-05 \u00b7 Kenneth Lau statement' },
      { marker: 4, sourceId: 's-stmt-serene', label: 'ST-04 \u00b7 Serene Goh statement' },
    ],
    highlightPath: ['p-kenneth', 'obj-remit1', 'o-pinnacle'],
  },
  {
    question: 'Who authorised the Labuan remittance?',
    graphHits: ['Serene Goh \u2194 Pinnacle Harbour \u00b7 4 paths, shortest 2 hops'],
    keywordHits: ['remittance authorised Serene Goh \u00b7 1 source'],
    answer:
      'The RM 150,000 remittance to Pinnacle Harbour Holdings Ltd (Labuan) was authorised by Serene Goh Mei Ling, sole director of Horizon Crest Advisory\u00b9, on Kenneth Lau\u2019s instruction according to her own statement\u00b2. She states she did not know the identity of the beneficiary.',
    citations: [
      { marker: 1, sourceId: 's-fin-02', label: 'FN-02 \u00b7 Remittance advice' },
      { marker: 2, sourceId: 's-stmt-serene', label: 'ST-04 \u00b7 Serene Goh statement' },
    ],
    highlightPath: ['p-serene', 'obj-remit1', 'o-pinnacle', 'loc-labuan'],
  },
];
