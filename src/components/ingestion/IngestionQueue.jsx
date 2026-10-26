import React from 'react';
import { useIngestion } from '../../context/IngestionContext.jsx';
import { JOB_STATUS, MODALITIES, jobProgress } from '../../ingestion/pipeline.js';
import { Badge } from '../common/Badge.jsx';

const BAR_COLOUR = {
  failed: 'var(--danger)',
  cancelled: 'var(--text-muted)',
  completed: 'var(--success)',
  needs_review: 'var(--warning)',
};

export function IngestionQueue({ jobs, selectedId, onSelect, caseId }) {
  const { cancelJob, retryJob, removeJob, clearFinished } = useIngestion();
  const active = jobs.filter((j) => j.status === 'queued' || j.status === 'processing').length;
  const finished = jobs.filter((j) => ['completed', 'needs_review', 'cancelled'].includes(j.status)).length;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Processing queue</h2>
        <div className="flex items-center gap-8">
          <span className="text-muted" style={{ fontSize: 12 }} aria-live="polite">
            {active ? `${active} in progress` : jobs.length ? 'All items processed' : ''}
          </span>
          {finished > 0 && (
            <button className="btn btn-sm btn-ghost" onClick={() => clearFinished(caseId)}>
              Clear finished
            </button>
          )}
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state" style={{ padding: 28 }}>
          <div className="empty-icon">⏳</div>
          Nothing in the pipeline yet. Stage files above, then start ingestion.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {jobs.map((job) => (
            <QueueRow
              key={job.id}
              job={job}
              selected={job.id === selectedId}
              onSelect={() => onSelect(job.id)}
              onCancel={() => cancelJob(job.id)}
              onRetry={() => retryJob(job.id)}
              onRemove={() => removeJob(job.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QueueRow({ job, selected, onSelect, onCancel, onRetry, onRemove }) {
  const status = JOB_STATUS[job.status];
  const pct = Math.round(jobProgress(job) * 100);
  const stage = job.stages[job.stageIndex];
  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };

  let stageText;
  if (job.status === 'processing') stageText = `Step ${job.stageIndex + 1}/${job.stages.length} · ${stage.label}`;
  else if (job.status === 'queued') stageText = 'Waiting for a processing slot';
  else if (job.status === 'failed') stageText = `Failed at ${stage.label}`;
  else if (job.status === 'cancelled') stageText = `Cancelled at ${stage.label}`;
  else stageText = `Indexed ${new Date(job.completedAt).toLocaleTimeString()}${job.status === 'needs_review' ? ' · review items' : ''}`;

  return (
    <div className={`list-row ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <span style={{ fontSize: 18 }} aria-hidden="true">
        {MODALITIES[job.modality].icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-8" style={{ minWidth: 0 }}>
          {job.ref && <Badge tone="accent">{job.ref}</Badge>}
          <button
            type="button"
            className="link-button truncate"
            title={job.name}
            aria-pressed={selected}
            onClick={stop(onSelect)}
          >
            {job.name}
          </button>
        </div>
        <div
          className="progress-track"
          style={{ margin: '7px 0 4px' }}
          role="progressbar"
          aria-label={`${job.name} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className="progress-fill" style={{ width: `${pct}%`, background: BAR_COLOUR[job.status] }} />
        </div>
        <div className="text-muted" style={{ fontSize: 11.5 }}>
          {stageText}
        </div>
      </div>
      <div className="flex flex-col gap-6" style={{ alignItems: 'flex-end', flexShrink: 0 }}>
        <Badge tone={status.tone}>{status.label}</Badge>
        <div className="flex gap-6">
          {(job.status === 'queued' || job.status === 'processing') && (
            <button className="btn btn-sm" onClick={stop(onCancel)}>
              Cancel
            </button>
          )}
          {(job.status === 'failed' || job.status === 'cancelled') && (
            <>
              <button className="btn btn-sm" onClick={stop(onRetry)}>
                ↻ Retry
              </button>
              <button className="btn btn-sm btn-ghost" onClick={stop(onRemove)}>
                Remove
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
