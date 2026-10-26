/**
 * Evidence ingestion pipeline (demo).
 *
 * Pure, deterministic logic for the multimodal ingestion module: modality
 * detection, file validation, per-modality processing stages, and a reducer
 * that advances a simulated processing queue on each tick.
 *
 * Real vs simulated is decided by IngestionContext: reading the file, SHA-256
 * hashing and media metadata happen in the browser; transfer, scanning and AI
 * extraction (OCR, speech-to-text, diarisation, entity extraction) are
 * simulated here.
 */
import { sources as staticSources } from '../data/sources.js';

const KB = 1024;
export const MB = 1024 * KB;
export const MAX_FILE_BYTES = 2 * 1024 * MB;
export const HASH_LIMIT_BYTES = 200 * MB;
export const MAX_CONCURRENT_JOBS = 3;

export const MODALITIES = {
  chat: { id: 'chat', label: 'Chat export', icon: '💬', refPrefix: 'EX', sourceKind: 'whatsapp', formats: '.txt, .zip, .json' },
  statement: { id: 'statement', label: 'Statement', icon: '📝', refPrefix: 'ST', sourceKind: 'statement', formats: '.pdf, .docx' },
  document: { id: 'document', label: 'Document', icon: '📄', refPrefix: 'DC', sourceKind: 'document', formats: '.pdf, .docx, .txt, .eml' },
  image: { id: 'image', label: 'Image', icon: '🖼️', refPrefix: 'IM', sourceKind: 'image', formats: '.jpg, .png, .tiff, .heic' },
  audio: { id: 'audio', label: 'Audio', icon: '🎧', refPrefix: 'AU', sourceKind: 'audio', formats: '.mp3, .wav, .m4a, .opus' },
  video: { id: 'video', label: 'Video', icon: '🎬', refPrefix: 'VD', sourceKind: 'video', formats: '.mp4, .mov, .webm' },
  financial: { id: 'financial', label: 'Financial record', icon: '🏦', refPrefix: 'FN', sourceKind: 'financial', formats: '.csv, .xlsx, bank .pdf' },
};

const EXTENSIONS = {
  chat: ['zip', 'json'],
  text: ['txt'],
  document: ['pdf', 'doc', 'docx', 'rtf', 'odt', 'eml', 'msg'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tif', 'tiff', 'heic'],
  audio: ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'opus', 'amr', 'flac'],
  video: ['mp4', 'mov', 'm4v', 'avi', 'mkv', 'webm', '3gp'],
  financial: ['csv', 'xls', 'xlsx'],
};

export const ACCEPT_ATTR = Object.values(EXTENSIONS)
  .flat()
  .map((ext) => `.${ext}`)
  .join(',');

export const JOB_STATUS = {
  staged: { label: 'Staged', tone: 'neutral' },
  queued: { label: 'Queued', tone: 'neutral' },
  processing: { label: 'Processing', tone: 'accent' },
  completed: { label: 'Indexed', tone: 'success' },
  needs_review: { label: 'Indexed · review', tone: 'warning' },
  failed: { label: 'Failed', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export const HASH_STATUS_LABEL = {
  pending: 'computing on this device…',
  computed: 'computed on this device',
  simulated: 'simulated for demo sample',
  deferred: 'deferred to evidence store (file over 200 MB)',
  unavailable: 'not available in this browser',
};

const STAGE_LIBRARY = {
  upload: { label: 'Secure upload' },
  integrity: { label: 'Integrity hash & malware scan', ms: 900 },
  parse: { label: 'Parse chat export', ms: 1400 },
  language: { label: 'Language detection', ms: 900 },
  layout: { label: 'Layout parse & OCR', ms: 1500 },
  segment: { label: 'Paragraph & fact segmentation', ms: 1100 },
  imageOcr: { label: 'OCR & EXIF metadata', ms: 1200 },
  vision: { label: 'Object & scene detection', ms: 1400 },
  keyframes: { label: 'Keyframe extraction', ms: 1400 },
  transcribe: { label: 'Speech-to-text (EN · MS · ZH)', ms: 2200 },
  diarise: { label: 'Speaker diarisation & voice ID', ms: 1400 },
  tables: { label: 'Table extraction', ms: 1400 },
  normalise: { label: 'Transaction normalisation', ms: 1000 },
  entities: { label: 'Entity extraction (POLE)', ms: 1300 },
  resolve: { label: 'Entity resolution vs case graph', ms: 1000 },
  index: { label: 'Graph + keyword indexing', ms: 900 },
};

const MODALITY_STAGES = {
  chat: ['parse', 'language'],
  statement: ['layout', 'segment'],
  document: ['layout', 'segment'],
  image: ['imageOcr', 'vision'],
  audio: ['transcribe', 'diarise'],
  video: ['keyframes', 'transcribe', 'diarise'],
  financial: ['tables', 'normalise'],
};

/* ------------------------------------------------------------------------ */
/*  Detection & validation                                                   */
/* ------------------------------------------------------------------------ */

export function detectModality(name, mime = '') {
  const lower = name.toLowerCase();
  const ext = lower.includes('.') ? lower.split('.').pop() : '';

  if (EXTENSIONS.chat.includes(ext)) return 'chat';
  if (EXTENSIONS.text.includes(ext)) return /whatsapp|chat|telegram|signal|wechat/.test(lower) ? 'chat' : 'document';
  if (EXTENSIONS.financial.includes(ext)) return 'financial';
  if (EXTENSIONS.image.includes(ext) || mime.startsWith('image/')) return 'image';
  if (EXTENSIONS.audio.includes(ext) || mime.startsWith('audio/')) return 'audio';
  if (EXTENSIONS.video.includes(ext) || mime.startsWith('video/')) return 'video';
  if (EXTENSIONS.document.includes(ext)) {
    if (/bank|remittance|ledger|transaction|swift/.test(lower)) return 'financial';
    if (/statement|interview|witness|accused|(^|[^a-z])st[-_]/.test(lower)) return 'statement';
    return 'document';
  }
  return null;
}

/** Validates a browser File (or {name,size,type}) against case jobs. */
export function validateFile(file, existingJobs) {
  if (file.size === 0) return { ok: false, reason: 'File is empty' };
  if (file.size > MAX_FILE_BYTES) return { ok: false, reason: 'Exceeds the 2 GB per-item limit' };
  const modality = detectModality(file.name, file.type ?? '');
  if (!modality) return { ok: false, reason: 'Unsupported format' };
  const duplicate = existingJobs.find((job) => job.name === file.name && job.size === file.size);
  if (duplicate) {
    return {
      ok: false,
      reason: duplicate.ref ? `Already ingested as ${duplicate.ref}` : 'Already staged',
    };
  }
  return { ok: true, modality };
}

/* ------------------------------------------------------------------------ */
/*  Job construction                                                         */
/* ------------------------------------------------------------------------ */

export function buildStages(modality, size) {
  const ids = ['upload', 'integrity', ...MODALITY_STAGES[modality], 'entities', 'resolve', 'index'];
  return ids.map((id) => ({
    id,
    label: STAGE_LIBRARY[id].label,
    durationMs: id === 'upload' ? uploadDuration(size) : STAGE_LIBRARY[id].ms,
    status: 'pending',
    progress: 0,
    detail: null,
    startedAt: null,
    finishedAt: null,
  }));
}

function uploadDuration(size) {
  return clamp(700 + (size / MB) * 70, 800, 4500);
}

export function createJob({ id, caseId, name, size, mime, lastModified = null, modality, sample = null, previewUrl = null, hashStatus, hash = null, now }) {
  return {
    id,
    caseId,
    name,
    size,
    mime: mime ?? '',
    lastModified,
    modality,
    isSample: Boolean(sample),
    sampleKey: sample?.key ?? null,
    sampleResult: sample?.result ?? null,
    failure: sample?.failure ?? null,
    custodianHint: sample?.custodianHint ?? null,
    status: 'staged',
    archived: false,
    ref: null,
    custodian: null,
    stages: [],
    stageIndex: 0,
    attempts: 0,
    hash,
    hashStatus,
    meta: {},
    previewUrl,
    result: null,
    error: null,
    createdAt: now,
    startedAt: null,
    completedAt: null,
    log: [logEntry(now, 'info', `Staged · detected as ${MODALITIES[modality].label}`)],
  };
}

/* ------------------------------------------------------------------------ */
/*  Reducer                                                                  */
/* ------------------------------------------------------------------------ */

export const initialIngestionState = { jobs: [] };

export function ingestionReducer(state, action) {
  switch (action.type) {
    case 'STAGE':
      return { ...state, jobs: [...state.jobs, ...action.jobs] };

    case 'SET_MODALITY':
      return updateJob(state, action.id, (job) =>
        job.status === 'staged' && !job.isSample
          ? {
              ...job,
              modality: action.modality,
              log: [...job.log, logEntry(action.now, 'info', `Evidence type set to ${MODALITIES[action.modality].label}`)],
            }
          : job,
      );

    case 'REMOVE':
      return { ...state, jobs: state.jobs.filter((job) => job.id !== action.id) };

    case 'START':
      return startStaged(state, action);

    case 'HASHED':
      return updateJob(state, action.id, (job) => ({
        ...job,
        hash: action.hash,
        hashStatus: action.hashStatus,
        log: [
          ...job.log,
          action.hashStatus === 'computed'
            ? logEntry(action.now, 'info', `SHA-256 computed on this device: ${action.hash.slice(0, 16)}…`)
            : logEntry(action.now, 'warn', 'SHA-256 not available in this browser; hash deferred to evidence store'),
        ],
      }));

    case 'PROBED':
      return updateJob(state, action.id, (job) => ({ ...job, meta: { ...job.meta, ...action.meta } }));

    case 'TICK':
      return tick(state, action.dt, action.now);

    case 'CANCEL':
      return updateJob(state, action.id, (job) => {
        if (job.status !== 'queued' && job.status !== 'processing') return job;
        const stages =
          job.status === 'processing'
            ? replaceStage(job.stages, job.stageIndex, { ...job.stages[job.stageIndex], status: 'cancelled', detail: 'Cancelled by officer' })
            : job.stages;
        return { ...job, status: 'cancelled', stages, log: [...job.log, logEntry(action.now, 'warn', 'Cancelled by officer')] };
      });

    case 'RETRY':
      return updateJob(state, action.id, (job) => {
        if (job.status !== 'failed' && job.status !== 'cancelled') return job;
        const stages = replaceStage(job.stages, job.stageIndex, {
          ...job.stages[job.stageIndex],
          status: 'pending',
          progress: 0,
          detail: null,
          startedAt: null,
          finishedAt: null,
        });
        return { ...job, status: 'queued', stages, error: null, log: [...job.log, logEntry(action.now, 'info', 'Re-queued by officer')] };
      });

    case 'ARCHIVE_FINISHED':
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.caseId === action.caseId && ['completed', 'needs_review', 'cancelled'].includes(job.status) ? { ...job, archived: true } : job,
        ),
      };

    default:
      return state;
  }
}

function startStaged(state, { caseId, custodian, now }) {
  const counters = refCounters(state.jobs);
  const jobs = state.jobs.map((job) => {
    if (job.caseId !== caseId || job.status !== 'staged') return job;
    const prefix = MODALITIES[job.modality].refPrefix;
    const next = (counters.get(prefix) ?? 0) + 1;
    counters.set(prefix, next);
    const ref = `${prefix}-${String(next).padStart(2, '0')}`;
    return {
      ...job,
      ref,
      custodian: custodian?.trim() || job.custodianHint || 'Uploaded by case officer via ingestion module',
      status: 'queued',
      stages: buildStages(job.modality, job.size),
      stageIndex: 0,
      log: [...job.log, logEntry(now, 'info', `Assigned exhibit ${ref} · queued for processing`)],
    };
  });
  return { ...state, jobs };
}

function tick(state, dt, now) {
  let running = state.jobs.filter((job) => job.status === 'processing').length;
  let changed = false;
  const jobs = state.jobs.map((job) => {
    if (job.status === 'queued') {
      if (running >= MAX_CONCURRENT_JOBS) return job;
      running += 1;
      changed = true;
      return beginJob(job, now);
    }
    if (job.status === 'processing') {
      changed = true;
      return advanceJob(job, dt, now);
    }
    return job;
  });
  return changed ? { ...state, jobs } : state;
}

function beginJob(job, now) {
  const attempts = job.attempts + 1;
  const stage = job.stages[job.stageIndex];
  return {
    ...job,
    status: 'processing',
    attempts,
    startedAt: job.startedAt ?? now,
    error: null,
    stages: replaceStage(job.stages, job.stageIndex, { ...stage, status: 'running', startedAt: now, progress: 0 }),
    log: [
      ...job.log,
      logEntry(now, 'info', attempts > 1 ? `Attempt ${attempts}: restarting at ${stage.label}` : 'Processing started'),
    ],
  };
}

function advanceJob(job, dt, now) {
  const stage = job.stages[job.stageIndex];
  let progress = stage.progress + dt / stage.durationMs;
  let detail = stage.detail;

  // Scripted one-off failure (demo samples only), first attempt only.
  if (job.failure && job.attempts === 1 && job.failure.stageId === stage.id && progress >= job.failure.at) {
    return {
      ...job,
      status: 'failed',
      error: job.failure.message,
      stages: replaceStage(job.stages, job.stageIndex, {
        ...stage,
        status: 'failed',
        progress: job.failure.at,
        finishedAt: now,
        detail: `Interrupted at ${Math.round(job.failure.at * 100)}%`,
      }),
      log: [...job.log, logEntry(now, 'error', `${stage.label} failed: ${job.failure.message}`)],
    };
  }

  // The integrity stage cannot finish until the local hash is ready.
  if (stage.id === 'integrity' && job.hashStatus === 'pending' && progress >= 0.95) {
    progress = 0.95;
    detail = 'Computing SHA-256 on this device…';
  }

  if (progress < 1) {
    return { ...job, stages: replaceStage(job.stages, job.stageIndex, { ...stage, progress, detail }) };
  }

  const result = job.sampleResult ?? generateResult(job);
  const doneDetail = stageDoneDetail(stage.id, job, result);
  let stages = replaceStage(job.stages, job.stageIndex, { ...stage, status: 'done', progress: 1, finishedAt: now, detail: doneDetail });
  const log = [...job.log, logEntry(now, 'success', `${stage.label} · ${doneDetail}`)];
  const nextIndex = job.stageIndex + 1;

  if (nextIndex < stages.length) {
    stages = replaceStage(stages, nextIndex, { ...stages[nextIndex], status: 'running', startedAt: now, progress: 0 });
    return { ...job, stages, stageIndex: nextIndex, log };
  }

  const needsReview = (result.reviewFlags ?? []).length > 0;
  return {
    ...job,
    stages,
    result,
    status: needsReview ? 'needs_review' : 'completed',
    completedAt: now,
    log: [
      ...log,
      needsReview
        ? logEntry(now, 'warn', 'Indexed with items for investigator review')
        : logEntry(now, 'success', 'Indexed · now available in the Evidence Box'),
    ],
  };
}

function stageDoneDetail(stageId, job, result) {
  switch (stageId) {
    case 'upload':
      return `${formatBytes(job.size)} transferred to the isolated case store`;
    case 'integrity':
      if (job.hashStatus === 'computed') return 'SHA-256 computed on this device · no malware signatures';
      if (job.hashStatus === 'simulated') return 'SHA-256 recorded · no malware signatures';
      if (job.hashStatus === 'deferred') return 'Large item: hash deferred to evidence store · no malware signatures';
      return 'Hash unavailable in this browser · no malware signatures';
    case 'entities':
      return `${sumEntities(result.entities)} entities extracted`;
    case 'resolve': {
      const { matched, created, review } = result.resolution;
      return `${matched} matched to case entities · ${created} new${review.length ? ` · ${review.length} possible match to confirm` : ''}`;
    }
    case 'index':
      return 'Case graph and keyword (BM25) index updated';
    default:
      return result.stageNotes?.[stageId] ?? 'Complete';
  }
}

/* ------------------------------------------------------------------------ */
/*  Simulated extraction results for user-uploaded (non-sample) files        */
/* ------------------------------------------------------------------------ */

const LANGUAGE_MIXES = [
  [{ name: 'English', pct: 100 }],
  [
    { name: 'English', pct: 71 },
    { name: 'Malay', pct: 29 },
  ],
  [
    { name: 'English', pct: 56 },
    { name: 'Chinese', pct: 44 },
  ],
  [
    { name: 'Malay', pct: 52 },
    { name: 'English', pct: 33 },
    { name: 'Chinese', pct: 15 },
  ],
];

export function generateResult(job) {
  const rand = seededRandom(`${job.name}|${job.size}|${job.modality}`);
  const int = (min, max) => Math.floor(min + rand() * (max - min + 1));
  const languages = LANGUAGE_MIXES[int(0, LANGUAGE_MIXES.length - 1)];
  const languageText = describeLanguages(languages);
  const entities = {
    person: job.modality === 'image' ? 0 : int(1, 5), // images: no facial identification
    organisation: int(0, 3),
    object: int(0, 3),
    location: int(0, 2),
    event: int(1, 3),
  };
  const total = sumEntities(entities);
  const matched = int(1, total);
  const base = {
    title: job.name,
    simulated: true,
    entities,
    resolution: { matched, created: total - matched, review: [] },
    languages,
    reviewFlags: [],
    speakers: null,
    transcript: null,
    highlight: null,
    excerpt: `"${job.name}" was processed by the demo pipeline. Content-level extraction is simulated; open the original file to review its contents.`,
  };

  switch (job.modality) {
    case 'chat': {
      const messages = int(60, 2400);
      const participants = int(2, 6);
      return {
        ...base,
        volume: `${messages.toLocaleString()} messages · ${participants} participants`,
        summary: [
          ['Messages', messages.toLocaleString()],
          ['Participants', String(participants)],
          ['Languages', languageText],
        ],
        stageNotes: { parse: `${messages.toLocaleString()} messages · ${participants} participants`, language: `Detected ${languageText}` },
      };
    }
    case 'statement':
    case 'document': {
      const pages = clamp(Math.round(job.size / (45 * KB)), 1, 400);
      const paragraphs = pages * int(4, 7);
      const facts = int(pages, pages * 3);
      const ocr = /\.(pdf|tif|tiff)$/i.test(job.name) && rand() > 0.5;
      return {
        ...base,
        volume: `~${pages} pages · ${facts} extracted facts`,
        summary: [
          ['Pages (est.)', String(pages)],
          ['Paragraphs', String(paragraphs)],
          ['Facts extracted', String(facts)],
          ['OCR', ocr ? 'Applied (scanned pages)' : 'Not required'],
        ],
        stageNotes: {
          layout: `~${pages} pages parsed${ocr ? ' · OCR applied' : ' · native text'}`,
          segment: `${paragraphs} paragraphs · ${facts} candidate facts`,
        },
      };
    }
    case 'image': {
      const dims = job.meta.width ? `${job.meta.width} × ${job.meta.height}` : 'Not readable in browser';
      const objects = int(1, 6);
      const textFound = rand() > 0.4;
      return {
        ...base,
        languages: textFound ? [{ name: 'English', pct: 100 }] : [],
        volume: dims,
        summary: [
          ['Resolution', dims],
          ['Text detected', textFound ? 'Yes, OCR indexed' : 'None'],
          ['Objects detected', String(objects)],
          ['People', 'Not identified (no facial recognition)'],
        ],
        stageNotes: {
          imageOcr: textFound ? 'Text read · EXIF parsed' : 'No text detected · EXIF parsed',
          vision: `${objects} objects detected`,
        },
      };
    }
    case 'audio':
    case 'video': {
      const known = Number.isFinite(job.meta.durationSec) && job.meta.durationSec > 0;
      const seconds = known ? job.meta.durationSec : job.size / (job.modality === 'audio' ? 16000 : 500000);
      const durationText = `${known ? '' : '~'}${formatDuration(seconds)}`;
      const speakerCount = int(1, 3);
      const plural = speakerCount === 1 ? '' : 's';
      const speakers = Array.from({ length: speakerCount }, (_, i) => ({
        label: `SPEAKER_${i + 1}`,
        name: null,
        confidence: Math.round((0.3 + rand() * 0.3) * 100) / 100,
      }));
      const keyframes = Math.max(1, Math.round(seconds / 20));
      const summary = [
        ['Duration', durationText],
        ['Speakers', `${speakerCount} (none matched to a known voice)`],
        ['Languages', languageText],
      ];
      if (job.modality === 'video') summary.splice(1, 0, ['Keyframes', String(keyframes)]);
      return {
        ...base,
        speakers,
        volume: `${durationText} · ${speakerCount} speaker${plural}`,
        summary,
        reviewFlags: [`${speakerCount} speaker${plural} not matched to a known voice in this case. Confirm identities before relying on attribution.`],
        stageNotes: {
          keyframes: `${keyframes} keyframes extracted`,
          transcribe: `Transcribed ${durationText} · ${languageText}`,
          diarise: `${speakerCount} speaker${plural} · 0 identified by voice`,
        },
      };
    }
    case 'financial': {
      const transactions = int(20, 420);
      const counterparties = int(3, 28);
      const currencies = rand() > 0.5 ? 'SGD, MYR' : 'SGD';
      return {
        ...base,
        volume: `${transactions} transactions`,
        summary: [
          ['Transactions', String(transactions)],
          ['Counterparties', String(counterparties)],
          ['Currencies', currencies],
        ],
        stageNotes: { tables: `${transactions} transactions extracted`, normalise: `${counterparties} counterparties · ${currencies}` },
      };
    }
    default:
      return { ...base, volume: formatBytes(job.size), summary: [], stageNotes: {} };
  }
}

/* ------------------------------------------------------------------------ */
/*  Selectors & formatting                                                   */
/* ------------------------------------------------------------------------ */

export function sourceIdForJob(job) {
  return `s-ing-${job.id}`;
}

/** Converts an indexed job into an Evidence Box source record. */
export function jobToSource(job) {
  const result = job.result;
  return {
    id: sourceIdForJob(job),
    ref: job.ref,
    kind: MODALITIES[job.modality].sourceKind,
    title: result.title ?? job.name,
    custodian: job.custodian,
    languages: result.languages?.length ? result.languages.map((l) => l.name) : ['Not applicable'],
    volume: result.volume ?? formatBytes(job.size),
    ingestedAt: new Date(job.completedAt).toISOString(),
    status: job.modality === 'audio' || job.modality === 'video' ? 'transcribed' : 'indexed',
    entitiesExtracted: sumEntities(result.entities),
    excerpt: result.excerpt,
    highlight: result.highlight ?? null,
    sha256: job.hash,
    caseId: job.caseId,
    jobId: job.id,
    isNew: true,
    needsReview: job.status === 'needs_review',
  };
}

export function jobProgress(job) {
  if (!job.stages.length) return 0;
  if (job.status === 'completed' || job.status === 'needs_review') return 1;
  const done = job.stages.filter((s) => s.status === 'done').length;
  const current = job.stages[job.stageIndex];
  const partial = current && current.status !== 'pending' && current.status !== 'done' ? current.progress : 0;
  return (done + partial) / job.stages.length;
}

export function sumEntities(entities = {}) {
  return Object.values(entities).reduce((sum, n) => sum + n, 0);
}

export function describeLanguages(languages = []) {
  return languages.map((l) => `${l.name} ${l.pct}%`).join(' / ');
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '—';
  if (bytes < KB) return `${bytes} B`;
  if (bytes < MB) return `${Math.round(bytes / KB)} KB`;
  if (bytes < 1024 * MB) return `${(bytes / MB).toFixed(1)} MB`;
  return `${(bytes / (1024 * MB)).toFixed(2)} GB`;
}

export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const parts = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60];
  return parts.map((n) => String(n).padStart(2, '0')).join(':');
}

/** Deterministic fake SHA-256 for demo samples (which have no real file). */
export function simulatedHash(seed) {
  const rand = seededRandom(seed);
  let out = '';
  while (out.length < 64) out += Math.floor(rand() * 16).toString(16);
  return out;
}

/* ------------------------------------------------------------------------ */
/*  Internal helpers                                                         */
/* ------------------------------------------------------------------------ */

function logEntry(at, level, message) {
  return { at, level, message };
}

function updateJob(state, id, updater) {
  return { ...state, jobs: state.jobs.map((job) => (job.id === id ? updater(job) : job)) };
}

function replaceStage(stages, index, stage) {
  return stages.map((s, i) => (i === index ? stage : s));
}

function refCounters(jobs) {
  const counters = new Map();
  const bump = (ref) => {
    const match = /^([A-Z]+)-(\d+)$/.exec(ref ?? '');
    if (match) counters.set(match[1], Math.max(counters.get(match[1]) ?? 0, Number(match[2])));
  };
  staticSources.forEach((s) => bump(s.ref));
  jobs.forEach((j) => bump(j.ref));
  return counters;
}

function seededRandom(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
