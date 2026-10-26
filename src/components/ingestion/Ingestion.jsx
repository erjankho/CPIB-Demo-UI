import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useIngestion } from '../../context/IngestionContext.jsx';
import { MAX_CONCURRENT_JOBS, MODALITIES, formatBytes } from '../../ingestion/pipeline.js';
import { StatTile } from '../common/StatTile.jsx';
import { DropZone } from './DropZone.jsx';
import { IngestionQueue } from './IngestionQueue.jsx';
import { IngestionJobDetail } from './IngestionJobDetail.jsx';

const HASH_SHORT = {
  pending: 'hashing…',
  computed: 'SHA-256 ✓',
  simulated: 'demo sample',
  deferred: 'hash deferred',
  unavailable: 'hash unavailable',
};

export function Ingestion() {
  const { activeCase } = useApp();
  const { jobs, stageFiles, stageDemoBatch, removeJob, setModality, startStaged } = useIngestion();
  const [custodian, setCustodian] = useState('');
  const [rejections, setRejections] = useState([]);
  const [notice, setNotice] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const caseJobs = useMemo(() => jobs.filter((job) => job.caseId === activeCase.id), [jobs, activeCase.id]);
  const staged = caseJobs.filter((job) => job.status === 'staged');
  const pipelineJobs = caseJobs.filter((job) => job.status !== 'staged' && !job.archived);
  const selectedJob = caseJobs.find((job) => job.id === selectedId) ?? null;

  const count = (...statuses) => caseJobs.filter((job) => statuses.includes(job.status)).length;

  // Drop the selection if the job was removed or the case changed.
  useEffect(() => {
    if (selectedId && !selectedJob) setSelectedId(null);
  }, [selectedId, selectedJob]);

  function handleFiles(fileList) {
    const { accepted, rejected } = stageFiles(fileList, activeCase.id);
    setRejections(rejected);
    setNotice(accepted ? `${accepted} item${accepted === 1 ? '' : 's'} staged. Check the evidence type, then start ingestion.` : '');
  }

  function handleDemo() {
    const added = stageDemoBatch(activeCase.id);
    setRejections([]);
    setNotice(added ? `${added} demo items staged, one per evidence type.` : 'The demo batch is already loaded for this case.');
  }

  function handleStart() {
    const firstId = staged[0]?.id;
    startStaged(activeCase.id, custodian);
    setCustodian('');
    setNotice('');
    setRejections([]);
    if (firstId) setSelectedId(firstId);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Evidence Ingestion — {activeCase.title}</h1>
          <p className="page-subtitle">
            Upload multimodal evidence into this case's isolated evidence box. Each item is hashed, processed by evidence
            type (chat parsing, OCR, speech-to-text, speaker ID, table extraction), then indexed into the case graph and
            keyword search.
          </p>
        </div>
      </div>

      <div className="notice-banner" role="note">
        <span aria-hidden="true">ℹ</span>
        <span>
          <strong>Demo pipeline.</strong> Processing stages and extraction results are simulated. Files stay on this
          device: only a SHA-256 hash and basic media metadata are read locally. Refreshing the page clears the queue.
        </span>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: 16 }}>
        <StatTile label="Queued" value={count('queued')} footnote={`${staged.length} staged, not started`} />
        <StatTile label="Processing" value={count('processing')} footnote={`Up to ${MAX_CONCURRENT_JOBS} items in parallel`} />
        <StatTile label="Indexed" value={count('completed', 'needs_review')} footnote="Available in Evidence Box" />
        <StatTile label="Needs attention" value={count('failed', 'needs_review')} footnote="Failed, or awaiting review" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.3fr) minmax(340px, 1fr)', alignItems: 'start' }}>
        <div className="flex flex-col" style={{ gap: 14, minWidth: 0 }}>
          <DropZone onFiles={handleFiles} onLoadDemo={handleDemo} />

          {(notice || rejections.length > 0) && (
            <div className="card" style={{ padding: 12 }} aria-live="polite">
              {notice && <div style={{ fontSize: 12.5 }}>{notice}</div>}
              {rejections.length > 0 && (
                <div className="alert alert-danger" style={{ margin: notice ? '8px 0 0' : 0 }}>
                  <strong>{rejections.length} file{rejections.length === 1 ? '' : 's'} not staged</strong>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {rejections.map((r) => (
                      <li key={`${r.name}-${r.reason}`}>
                        {r.name}: {r.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {staged.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Staged for ingestion ({staged.length})</h2>
                <span className="text-muted" style={{ fontSize: 12 }}>
                  Confirm the evidence type before processing
                </span>
              </div>
              <div className="flex flex-col gap-6">
                {staged.map((job) => (
                  <div key={job.id} className="staged-row">
                    <span style={{ fontSize: 17 }} aria-hidden="true">
                      {MODALITIES[job.modality].icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="truncate" title={job.name} style={{ fontWeight: 600, fontSize: 12.5 }}>
                        {job.name}
                      </div>
                      <div className="text-muted" style={{ fontSize: 11.5 }}>
                        {formatBytes(job.size)} · {HASH_SHORT[job.hashStatus]}
                      </div>
                    </div>
                    <label className="sr-only" htmlFor={`type-${job.id}`}>
                      Evidence type for {job.name}
                    </label>
                    <select
                      id={`type-${job.id}`}
                      className="select"
                      value={job.modality}
                      onChange={(e) => setModality(job.id, e.target.value)}
                      disabled={job.isSample}
                      title={job.isSample ? 'Demo samples have a fixed evidence type' : 'Override the detected evidence type'}
                    >
                      {Object.values(MODALITIES).map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <button className="icon-btn" onClick={() => removeJob(job.id)} aria-label={`Remove ${job.name}`}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="divider" />
              <label htmlFor="ingest-custodian" className="field-label">
                Custodian / provenance
              </label>
              <div className="flex gap-8 wrap">
                <input
                  id="ingest-custodian"
                  className="input"
                  style={{ flex: 1, minWidth: 220 }}
                  placeholder="e.g. Mobile device KL-03, seized 2026-07-24"
                  value={custodian}
                  onChange={(e) => setCustodian(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleStart}>
                  Start ingestion ({staged.length})
                </button>
              </div>
              <div className="text-muted" style={{ fontSize: 11.5, marginTop: 6 }}>
                Applied to every staged item. Leave blank to keep each demo sample's own provenance.
              </div>
            </div>
          )}

          <IngestionQueue jobs={pipelineJobs} selectedId={selectedId} onSelect={setSelectedId} caseId={activeCase.id} />
        </div>

        <div style={{ position: 'sticky', top: 16, minWidth: 0 }}>
          <IngestionJobDetail job={selectedJob} />
        </div>
      </div>
    </div>
  );
}
