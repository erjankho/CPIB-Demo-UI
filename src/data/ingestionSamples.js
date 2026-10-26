/**
 * Demo batch for the ingestion module (fictional, Operation Harbour Crest).
 *
 * One item per modality. Results are scripted so the demo tells a consistent
 * story with the existing evidence. The financial record fails once during
 * upload so the presenter can show the retry path.
 */

export const demoBatch = [
  {
    key: 'au-voice-note',
    name: 'KL-03_voice_note_2026-06-12.opus',
    size: 912384,
    mime: 'audio/ogg',
    modality: 'audio',
    custodianHint: 'Mobile device KL-03 (seized 2026-07-24)',
    result: {
      title: 'Voice note — Kenneth Lau, 12 Jun 2026',
      volume: '00:02:47 · 2 speakers',
      languages: [
        { name: 'Malay', pct: 58 },
        { name: 'English', pct: 31 },
        { name: 'Chinese', pct: 11 },
      ],
      summary: [
        ['Duration', '00:02:47'],
        ['Speakers', '2 (1 identified by voice)'],
        ['Code-switching', '14 language switches'],
      ],
      speakers: [
        { label: 'SPEAKER_1', name: 'Kenneth Lau Wei Ming', confidence: 0.91 },
        { label: 'SPEAKER_2', name: null, confidence: 0.41 },
      ],
      transcript: [
        {
          t: '00:00:12',
          speaker: 'SPEAKER_1',
          text: 'Tranche kedua masuk lepas award, jangan risau.',
          translation: 'The second tranche comes in after the award, don’t worry.',
        },
        { t: '00:00:31', speaker: 'SPEAKER_1', text: 'Make sure the invoice says advisory, same as before.' },
        { t: '00:01:05', speaker: 'SPEAKER_2', text: '好，我跟 Serene 讲。', translation: 'OK, I will tell Serene.' },
      ],
      entities: { person: 3, organisation: 1, object: 1, location: 0, event: 1 },
      resolution: { matched: 4, created: 2, review: ['"Serene" ↔ Serene Goh Mei Ling (0.86)'] },
      reviewFlags: [
        'SPEAKER_2 is not matched to a known voice (confidence 0.41). Confirm identity before relying on attribution.',
      ],
      stageNotes: {
        transcribe: 'Transcribed 00:02:47 · Malay 58% / English 31% / Chinese 11%',
        diarise: '2 speakers · 1 identified by voice',
      },
      excerpt:
        '[00:00:12] SPEAKER_1 (Kenneth Lau, 0.91): Tranche kedua masuk lepas award, jangan risau.\n[00:00:31] SPEAKER_1: Make sure the invoice says advisory, same as before.\n[00:01:05] SPEAKER_2 (unidentified, 0.41): 好，我跟 Serene 讲。',
      highlight: 'Tranche kedua masuk lepas award',
    },
  },
  {
    key: 'ex-hc-accounts',
    name: 'WhatsApp Chat - HC Accounts.zip',
    size: 2411520,
    mime: 'application/zip',
    modality: 'chat',
    custodianHint: 'Mobile device KL-03 (seized 2026-07-24)',
    result: {
      title: 'WhatsApp group export — "HC Accounts"',
      volume: '286 messages · 3 participants · 19 Feb – 01 Jul 2026',
      languages: [
        { name: 'English', pct: 64 },
        { name: 'Malay', pct: 36 },
      ],
      summary: [
        ['Messages', '286'],
        ['Participants', '3 (1 unknown number)'],
        ['Date range', '19 Feb – 01 Jul 2026'],
        ['Attachments', '11 images, 2 PDFs'],
      ],
      entities: { person: 3, organisation: 3, object: 2, location: 1, event: 2 },
      resolution: { matched: 8, created: 3, review: ['"PH Holdings" ↔ Pinnacle Harbour Holdings Ltd (0.89)'] },
      reviewFlags: [],
      stageNotes: {
        parse: '286 messages · 3 participants · 13 attachments',
        language: 'Detected English 64% / Malay 36%',
      },
      excerpt:
        '[29 Jun 2026, 21:14] Kenneth Lau: PH Holdings details sent. Use "consultancy settlement" as the purpose.\n[29 Jun 2026, 21:20] Serene Goh: Ok. Bank needs my signature tomorrow.',
      highlight: 'Use "consultancy settlement" as the purpose',
    },
  },
  {
    key: 'im-cctv',
    name: 'CCTV_HarbourfrontTower_L3-07_20260318_1904.jpg',
    size: 3204096,
    mime: 'image/jpeg',
    modality: 'image',
    custodianHint: 'Building management, production order PO-2026-118',
    result: {
      title: 'CCTV still — Harbourfront Tower carpark L3, camera L3-07',
      volume: '1920 × 1080 · overlay 18 Mar 2026 19:04:11',
      languages: [{ name: 'English', pct: 100 }],
      summary: [
        ['Resolution', '1920 × 1080'],
        ['Timestamp overlay', '18 Mar 2026 19:04:11'],
        ['Camera', 'L3-07'],
        ['Detected', '2 persons (not identified) · 1 vehicle'],
      ],
      entities: { person: 0, organisation: 0, object: 1, location: 1, event: 1 },
      resolution: { matched: 2, created: 1, review: [] },
      reviewFlags: [],
      stageNotes: {
        imageOcr: 'Timestamp overlay and camera ID read · EXIF parsed',
        vision: '2 persons (not identified) · 1 vehicle',
      },
      excerpt:
        'OCR overlay: "L3-07  18/03/2026 19:04:11". Detected 2 persons near the lift lobby and 1 stationary vehicle. Location matched to Carpark, Level 3 — Harbourfront Tower. Timestamp aligns with audio recording AU-01.',
      highlight: '18/03/2026 19:04:11',
    },
  },
  {
    key: 'fn-pinnacle',
    name: 'Pinnacle_Harbour_bank_statement_Q2-2026.pdf',
    size: 1258291,
    mime: 'application/pdf',
    modality: 'financial',
    custodianHint: 'Mutual legal assistance response, Labuan',
    failure: {
      stageId: 'upload',
      at: 0.64,
      message: 'Connection to the evidence store was interrupted at 64%. No partial data was retained. Retry to upload again.',
    },
    result: {
      title: 'Bank statement — Pinnacle Harbour Holdings Ltd, Q2 2026',
      volume: '9 pages · 63 transactions',
      languages: [{ name: 'English', pct: 100 }],
      summary: [
        ['Transactions', '63'],
        ['Counterparties', '9'],
        ['Currencies', 'MYR, SGD'],
        ['Flagged', '2 transactions'],
      ],
      entities: { person: 1, organisation: 4, object: 2, location: 1, event: 2 },
      resolution: { matched: 5, created: 5, review: [] },
      reviewFlags: [],
      stageNotes: {
        tables: '9 pages · 63 transactions extracted',
        normalise: '9 counterparties · MYR, SGD',
      },
      excerpt:
        '30 Jun 2026 CR MYR 150,000.00 — HORIZON CREST ADVISORY PTE LTD — "CONSULTANCY SETTLEMENT".\n03 Jul 2026 DR MYR 120,000.00 — transfer to individual account (beneficiary name withheld in statement).',
      highlight: 'CR MYR 150,000.00 — HORIZON CREST ADVISORY PTE LTD',
    },
  },
  {
    key: 'st-marcus-supp',
    name: 'ST-Marcus_Ong_supplementary_statement.docx',
    size: 214016,
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    modality: 'statement',
    custodianHint: 'Recorded 2026-08-21, 10:00 hrs',
    result: {
      title: 'Supplementary statement — Marcus Ong Jia Wei',
      volume: '4 pages · 12 extracted facts',
      languages: [{ name: 'English', pct: 100 }],
      summary: [
        ['Pages', '4'],
        ['Paragraphs', '21'],
        ['Facts extracted', '12'],
        ['OCR', 'Not required (native text)'],
      ],
      entities: { person: 3, organisation: 2, object: 1, location: 0, event: 2 },
      resolution: { matched: 8, created: 0, review: [] },
      reviewFlags: [],
      stageNotes: {
        layout: '4 pages parsed · native text, OCR not required',
        segment: '21 paragraphs · 12 candidate facts',
      },
      excerpt:
        'Para 4: After Revision 2 was saved, the chair asked me not to circulate the earlier scoring sheet to the committee. Para 6: I kept a copy of Revision 1 on the shared drive, which I have provided to the IO.',
      highlight: 'asked me not to circulate the earlier scoring sheet',
    },
  },
  {
    key: 'vd-serene-interview',
    name: 'Interview_Serene_Goh_2026-08-14.mp4',
    size: 48234496,
    mime: 'video/mp4',
    modality: 'video',
    custodianHint: 'CPIB interview room 3, recorded 2026-08-14',
    result: {
      title: 'Recorded interview — Serene Goh Mei Ling, 14 Aug 2026',
      volume: '00:42:10 · 2 speakers · 126 keyframes',
      languages: [
        { name: 'English', pct: 82 },
        { name: 'Chinese', pct: 18 },
      ],
      summary: [
        ['Duration', '00:42:10'],
        ['Keyframes', '126'],
        ['Speakers', '2 (both identified by voice)'],
        ['Linked statement', 'ST-04'],
      ],
      speakers: [
        { label: 'SPEAKER_1', name: 'IO Nadiah Rahman', confidence: 0.97 },
        { label: 'SPEAKER_2', name: 'Serene Goh Mei Ling', confidence: 0.93 },
      ],
      transcript: [
        { t: '00:12:40', speaker: 'SPEAKER_1', text: 'Who decided the purpose stated on the remittance?' },
        {
          t: '00:12:46',
          speaker: 'SPEAKER_2',
          text: 'Kenneth told me what to write. 我只是签名。',
          translation: 'I only signed.',
        },
      ],
      entities: { person: 3, organisation: 2, object: 1, location: 1, event: 2 },
      resolution: { matched: 9, created: 0, review: [] },
      reviewFlags: [],
      stageNotes: {
        keyframes: '126 keyframes extracted',
        transcribe: 'Transcribed 00:42:10 · English 82% / Chinese 18%',
        diarise: '2 speakers · both identified by voice',
      },
      excerpt:
        '[00:12:40] SPEAKER_1 (IO Nadiah Rahman, 0.97): Who decided the purpose stated on the remittance?\n[00:12:46] SPEAKER_2 (Serene Goh, 0.93): Kenneth told me what to write. 我只是签名。',
      highlight: 'Kenneth told me what to write',
    },
  },
];
