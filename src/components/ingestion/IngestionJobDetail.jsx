import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useIngestion } from '../../context/IngestionContext.jsx';
import { POLE_TYPES } from '../../data/caseData.js';
import { HASH_STATUS_LABEL, JOB_STATUS, MODALITIES, formatBytes, sourceIdForJob, sumEntities } from '../../ingestion/pipeline.js';
import { Badge } from '../common/Badge.jsx';

const STAGE_ICON = { pending: '○', running: '◔', done: '✓', failed: '✕', cancelled: '–' };
const STAGE_STATUS_TEXT = { pending: 'pending', running: 'in progress', done: 'complete', failed: 'failed', cancelled: 'cancelled' };

export function IngestionJobDetail({ job }) {
  const { openEvidence, setActiveTab } = useApp();
  const { retryJob, cancelJob } = useIngestion();

  if (!job) {
    return (
      <aside className="card">
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <strong style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: 4 }}>No item selected</strong>
          Select an item in the queue to see its processing pipeline, integrity hash and extracted results.
        </div>
      </aside>
    );
  }

  const modality = MODALITIES[job.modality];
  const status = JOB_STATUS[job.status];
  const isIndexed = job.status === 'completed' || job.status === 'needs_review';
  const isActive = job.status === 'queued' || job.status === 'processing';

  return (
    <aside className="card ingest-detail" aria-label={`Details for ${job.name}`}>
      <div className="flex justify-between gap-8" style={{ alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div className="flex gap-6 wrap" style={{ marginBottom: 6 }}>
            {job.ref && <Badge tone="accent">{job.ref}</Badge>}
            <Badge tone="neutral">
              {modality.icon} {modality.label}
            </Badge>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <h2 style={{ margin: 0, fontSize: 15, lineHeight: 1.35, wordBreak: 'break-word' }}>{job.name}</h2>
        </div>
        {isActive && (
          <button className="btn btn-sm" onClick={() => cancelJob(job.id)}>
            Cancel
          </button>
        )}
      </div>

      <MediaPreview job={job} />

      <div className="section-label">Integrity &amp; provenance</div>
      <Row label="Exhibit ref" value={job.ref ?? 'Assigned when ingestion starts'} />
      <Row label="Size" value={formatBytes(job.size)} />
      <Row label="Format" value={job.mime || fileExtension(job.name)} />
      {job.lastModified ? <Row label="File last modified" value={new Date(job.lastModified).toLocaleString()} /> : null}
      <Row label="Custodian" value={job.custodian ?? job.custodianHint ?? 'Set when ingestion starts'} />
      <div className="kv-row" style={{ flexDirection: 'column', gap: 3 }}>
        <span className="kv-key">SHA-256 · {HASH_STATUS_LABEL[job.hashStatus]}</span>
        <span className="mono hash-text">{job.hash ?? '—'}</span>
      </div>

      <div className="section-label">Processing pipeline</div>
      {job.stages.length === 0 ? (
        <div className="text-muted" style={{ fontSize: 12 }}>
          Stages are assigned by evidence type when ingestion starts.
        </div>
      ) : (
        <ol className="stage-list">
          {job.stages.map((stage) => (
            <li key={stage.id} className={`stage-item stage-${stage.status}`}>
              <span className="stage-icon" aria-hidden="true">
                {STAGE_ICON[stage.status]}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex justify-between gap-8">
                  <span style={{ fontWeight: 600, fontSize: 12.5 }}>
                    {stage.label}
                    <span className="sr-only"> — {STAGE_STATUS_TEXT[stage.status]}</span>
                  </span>
                  <span className="mono text-muted" style={{ fontSize: 11, flexShrink: 0 }}>
                    {stageTiming(stage)}
                  </span>
                </div>
                {stage.status === 'running' && (
                  <div className="progress-track" style={{ height: 4, marginTop: 5 }}>
                    <div className="progress-fill" style={{ width: `${Math.round(stage.progress * 100)}%` }} />
                  </div>
                )}
                {stage.detail && (
                  <div className="text-secondary" style={{ fontSize: 11.5, marginTop: 3 }}>
                    {stage.detail}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {job.status === 'failed' && (
        <div className="alert alert-danger" role="alert">
          <div style={{ marginBottom: 8 }}>{job.error}</div>
          <button className="btn btn-sm" onClick={() => retryJob(job.id)}>
            ↻ Retry
          </button>
        </div>
      )}

      {isIndexed && job.result && <ExtractionResults result={job.result} />}

      {isIndexed && (
        <div className="flex gap-8 wrap" style={{ marginTop: 14 }}>
          <button className="btn btn-primary btn-sm" onClick={() => openEvidence(sourceIdForJob(job))}>
            Open evidence record
          </button>
          <button className="btn btn-sm" onClick={() => setActiveTab('evidence')}>
            Go to Evidence Box
          </button>
        </div>
      )}

      <div className="section-label">Processing log</div>
      <ol className="log-list">
        {[...job.log].reverse().map((entry, i) => (
          <li key={`${entry.at}-${i}`} className={`log-${entry.level}`}>
            <span className="mono text-muted">{new Date(entry.at).toLocaleTimeString()}</span> {entry.message}
          </li>
        ))}
      </ol>
    </aside>
  );
}

function MediaPreview({ job }) {
  if (job.previewUrl && job.modality === 'image') {
    return <img src={job.previewUrl} alt={`Preview of ${job.name}`} className="ingest-preview-media" />;
  }
  if (job.previewUrl && job.modality === 'audio') {
    return <audio controls src={job.previewUrl} style={{ width: '100%' }} aria-label={`Play ${job.name}`} />;
  }
  if (job.previewUrl && job.modality === 'video') {
    return <video controls src={job.previewUrl} className="ingest-preview-media" aria-label={`Play ${job.name}`} />;
  }
  const modality = MODALITIES[job.modality];
  return (
    <div className="ingest-preview-placeholder">
      <span style={{ fontSize: 28 }} aria-hidden="true">
        {modality.icon}
      </span>
      <span>{job.isSample ? 'Demo sample · no media attached' : `${modality.label} · no in-browser preview`}</span>
    </div>
  );
}

function ExtractionResults({ result }) {
  const total = sumEntities(result.entities);
  const speakerName = (label) => result.speakers?.find((s) => s.label === label);

  return (
    <>
      <div className="flex items-center gap-8" style={{ margin: '18px 0 8px' }}>
        <span className="section-label" style={{ margin: 0 }}>
          Extraction results
        </span>
        <Badge tone={result.simulated ? 'warning' : 'neutral'}>{result.simulated ? 'Simulated' : 'Demo sample'}</Badge>
      </div>

      {result.reviewFlags?.length > 0 && (
        <div className="alert alert-warning">
          {result.reviewFlags.map((flag) => (
            <div key={flag}>⚠ {flag}</div>
          ))}
        </div>
      )}

      {result.summary.map(([label, value]) => (
        <Row key={label} label={label} value={value} />
      ))}

      {result.languages?.length > 0 && (
        <>
          <div className="section-label">Languages detected</div>
          {result.languages.map((lang) => (
            <div key={lang.name} className="lang-row">
              <span style={{ width: 64 }}>{lang.name}</span>
              <div className="progress-track" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: `${lang.pct}%` }} />
              </div>
              <span className="mono" style={{ width: 38, textAlign: 'right' }}>
                {lang.pct}%
              </span>
            </div>
          ))}
        </>
      )}

      {result.speakers?.length > 0 && (
        <>
          <div className="section-label">Speakers</div>
          {result.speakers.map((s) => (
            <div key={s.label} className="kv-row">
              <span className="kv-key mono">{s.label}</span>
              <span className="flex items-center gap-6">
                {s.name ?? 'Unidentified'}
                <Badge tone={s.confidence >= 0.8 ? 'success' : s.confidence >= 0.6 ? 'warning' : 'danger'}>
                  {s.confidence.toFixed(2)}
                </Badge>
              </span>
            </div>
          ))}
        </>
      )}

      {result.transcript?.length > 0 && (
        <>
          <div className="section-label">Transcript excerpt</div>
          <div className="transcript-box">
            {result.transcript.map((line) => {
              const speaker = speakerName(line.speaker);
              return (
                <div key={`${line.t}-${line.speaker}`} style={{ marginBottom: 6 }}>
                  <span className="mono text-muted">[{line.t}]</span>{' '}
                  <strong>{speaker?.name ?? line.speaker}:</strong> {line.text}
                  {line.translation && (
                    <div className="text-muted" style={{ fontStyle: 'italic', marginLeft: 14 }}>
                      EN: {line.translation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="section-label">Entities extracted ({total})</div>
      <div className="flex gap-6 wrap">
        {Object.entries(result.entities)
          .filter(([, n]) => n > 0)
          .map(([type, n]) => (
            <span key={type} className="chip" style={{ borderColor: POLE_TYPES[type].colour, color: POLE_TYPES[type].colour }}>
              {POLE_TYPES[type].label} · {n}
            </span>
          ))}
      </div>

      <div className="section-label">Entity resolution</div>
      <Row label="Matched to existing case entities" value={result.resolution.matched} />
      <Row label="New entities" value={result.resolution.created} />
      {result.resolution.review.length > 0 && (
        <div className="text-secondary" style={{ fontSize: 12, marginTop: 6 }}>
          Possible matches for the investigator to confirm:
          <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
            {result.resolution.review.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="kv-row">
      <span className="kv-key">{label}</span>
      <span style={{ textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function stageTiming(stage) {
  if (stage.status === 'running') return `${Math.round(stage.progress * 100)}%`;
  if (stage.status === 'done' && stage.startedAt && stage.finishedAt) return `${((stage.finishedAt - stage.startedAt) / 1000).toFixed(1)}s`;
  return '';
}

function fileExtension(name) {
  return name.includes('.') ? `.${name.split('.').pop().toLowerCase()}` : 'Unknown';
}
