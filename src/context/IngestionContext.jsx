import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  HASH_LIMIT_BYTES,
  createJob,
  ingestionReducer,
  initialIngestionState,
  jobToSource,
  simulatedHash,
  validateFile,
} from '../ingestion/pipeline.js';
import { demoBatch } from '../data/ingestionSamples.js';

const IngestionContext = createContext(null);
const TICK_MS = 200;
const PREVIEWABLE = new Set(['image', 'audio', 'video']);

let jobCounter = 0;
const nextJobId = () => `job-${Date.now().toString(36)}-${(jobCounter += 1)}`;

/**
 * Holds the ingestion queue at app level so processing keeps running while
 * the officer moves between tabs. Files never leave the browser: we only read
 * them locally to compute SHA-256 and media metadata (duration / dimensions).
 * Everything else in the pipeline is simulated by the reducer.
 */
export function IngestionProvider({ children }) {
  const [state, dispatch] = useReducer(ingestionReducer, initialIngestionState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const objectUrls = useRef(new Map()); // jobId -> blob URL

  // Release blob URLs when the provider unmounts.
  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  // Drive the simulation only while something is queued or processing.
  const hasWork = state.jobs.some((job) => job.status === 'queued' || job.status === 'processing');
  useEffect(() => {
    if (!hasWork) return undefined;
    let last = performance.now();
    const timer = setInterval(() => {
      const t = performance.now();
      const dt = Math.min(1000, t - last); // cap catch-up after background-tab throttling
      last = t;
      dispatch({ type: 'TICK', dt, now: Date.now() });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [hasWork]);

  const stageFiles = useCallback((fileList, caseId) => {
    const caseJobs = stateRef.current.jobs.filter((job) => job.caseId === caseId);
    const accepted = [];
    const rejected = [];
    const now = Date.now();
    const canHash = typeof crypto !== 'undefined' && Boolean(crypto.subtle);

    for (const file of Array.from(fileList)) {
      const check = validateFile(file, [...caseJobs, ...accepted]);
      if (!check.ok) {
        rejected.push({ name: file.name, reason: check.reason });
        continue;
      }

      const id = nextJobId();
      let previewUrl = null;
      if (PREVIEWABLE.has(check.modality)) {
        previewUrl = URL.createObjectURL(file);
        objectUrls.current.set(id, previewUrl);
      }
      const willHash = canHash && file.size <= HASH_LIMIT_BYTES;
      const hashStatus = willHash ? 'pending' : file.size > HASH_LIMIT_BYTES ? 'deferred' : 'unavailable';

      accepted.push(
        createJob({
          id,
          caseId,
          name: file.name,
          size: file.size,
          mime: file.type,
          lastModified: file.lastModified,
          modality: check.modality,
          previewUrl,
          hashStatus,
          now,
        }),
      );

      // These resolve after STAGE below has been dispatched.
      if (willHash) {
        sha256Hex(file)
          .then((hash) => dispatch({ type: 'HASHED', id, hash, hashStatus: 'computed', now: Date.now() }))
          .catch(() => dispatch({ type: 'HASHED', id, hash: null, hashStatus: 'unavailable', now: Date.now() }));
      }
      if (previewUrl) {
        probeMedia(previewUrl, check.modality).then((meta) => {
          if (meta) dispatch({ type: 'PROBED', id, meta });
        });
      }
    }

    if (accepted.length) dispatch({ type: 'STAGE', jobs: accepted });
    return { accepted: accepted.length, rejected };
  }, []);

  const stageDemoBatch = useCallback((caseId) => {
    const loaded = new Set(stateRef.current.jobs.filter((job) => job.caseId === caseId && job.sampleKey).map((job) => job.sampleKey));
    const now = Date.now();
    const jobs = demoBatch
      .filter((sample) => !loaded.has(sample.key))
      .map((sample) =>
        createJob({
          id: nextJobId(),
          caseId,
          name: sample.name,
          size: sample.size,
          mime: sample.mime,
          modality: sample.modality,
          sample,
          hashStatus: 'simulated',
          hash: simulatedHash(sample.name),
          now,
        }),
      );
    if (jobs.length) dispatch({ type: 'STAGE', jobs });
    return jobs.length;
  }, []);

  const removeJob = useCallback((id) => {
    const url = objectUrls.current.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      objectUrls.current.delete(id);
    }
    dispatch({ type: 'REMOVE', id });
  }, []);

  const setModality = useCallback((id, modality) => dispatch({ type: 'SET_MODALITY', id, modality, now: Date.now() }), []);
  const startStaged = useCallback((caseId, custodian) => dispatch({ type: 'START', caseId, custodian, now: Date.now() }), []);
  const cancelJob = useCallback((id) => dispatch({ type: 'CANCEL', id, now: Date.now() }), []);
  const retryJob = useCallback((id) => dispatch({ type: 'RETRY', id, now: Date.now() }), []);
  const clearFinished = useCallback((caseId) => dispatch({ type: 'ARCHIVE_FINISHED', caseId }), []);

  const ingestedSources = useMemo(
    () =>
      state.jobs
        .filter((job) => (job.status === 'completed' || job.status === 'needs_review') && job.result)
        .sort((a, b) => b.completedAt - a.completedAt)
        .map(jobToSource),
    [state.jobs],
  );
  const ingestedSourceById = useMemo(() => Object.fromEntries(ingestedSources.map((s) => [s.id, s])), [ingestedSources]);

  const value = useMemo(
    () => ({
      jobs: state.jobs,
      stageFiles,
      stageDemoBatch,
      removeJob,
      setModality,
      startStaged,
      cancelJob,
      retryJob,
      clearFinished,
      ingestedSources,
      ingestedSourceById,
    }),
    [state.jobs, stageFiles, stageDemoBatch, removeJob, setModality, startStaged, cancelJob, retryJob, clearFinished, ingestedSources, ingestedSourceById],
  );

  return <IngestionContext.Provider value={value}>{children}</IngestionContext.Provider>;
}

export function useIngestion() {
  const ctx = useContext(IngestionContext);
  if (!ctx) throw new Error('useIngestion must be used within IngestionProvider');
  return ctx;
}

async function sha256Hex(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Reads duration (audio/video) or dimensions (image) without uploading anything. */
function probeMedia(url, modality) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (meta) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(meta);
    };
    const timer = setTimeout(() => finish(null), 5000);

    if (modality === 'image') {
      const img = new Image();
      img.onload = () => finish({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => finish(null);
      img.src = url;
      return;
    }

    const el = document.createElement(modality === 'video' ? 'video' : 'audio');
    el.preload = 'metadata';
    el.onloadedmetadata = () => finish({ durationSec: Number.isFinite(el.duration) ? el.duration : null });
    el.onerror = () => finish(null);
    el.src = url;
  });
}
