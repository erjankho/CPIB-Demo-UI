import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useIngestion } from '../../context/IngestionContext.jsx';
import { cases, journeySteps } from '../../data/caseData.js';
import { sources } from '../../data/sources.js';
import { discrepancies, mergeSuggestions } from '../../data/factAudit.js';
import { StatTile } from '../common/StatTile.jsx';
import { Badge } from '../common/Badge.jsx';
import { JourneyStepper } from './JourneyStepper.jsx';

const STATUS_TONE = {
  'Under investigation': 'accent',
  'Evidence ingestion': 'warning',
  'Pending supervisor review': 'warning',
  Closed: 'neutral',
};

const PRIORITY_TONE = { High: 'danger', Medium: 'warning', Low: 'neutral' };

export function Workbench() {
  const { persona, activeCaseId, setActiveCaseId, activeCase, setActiveTab } = useApp();
  const { ingestedSources } = useIngestion();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const officerCases = persona === 'supervisor' ? cases : cases.filter((c) => c.officer === activeCase.officer || c.id === activeCaseId);

  const filtered = useMemo(() => {
    return officerCases.filter((c) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [officerCases, query, statusFilter]);

  const openCount = cases.filter((c) => c.status !== 'Closed').length;
  const highPriority = cases.filter((c) => c.priority === 'High' && c.status !== 'Closed').length;
  const pendingAudits = mergeSuggestions.filter((m) => m.status === 'pending').length;
  const openDiscrepancies = discrepancies.filter((d) => d.severity === 'high').length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{persona === 'supervisor' ? 'Supervisor Dashboard' : 'Case Management Workbench'}</h1>
          <p className="page-subtitle">
            {persona === 'supervisor'
              ? 'Review officer progress and case status across the unit. Open any case to inspect evidence, graph and audit trail.'
              : 'Review assigned cases and resume investigation from a single dashboard.'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveTab('evidence')}>
          + Start new case
        </button>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: 20 }}>
        <StatTile label={persona === 'supervisor' ? 'Open cases (unit)' : 'My open cases'} value={openCount} footnote={`${cases.length} total`} />
        <StatTile label="High priority" value={highPriority} footnote="Require active attention" />
        <StatTile label="Pending fact audits" value={pendingAudits} footnote="Entity merges awaiting decision" />
        <StatTile label="High-severity discrepancies" value={openDiscrepancies} footnote="Across all open cases" />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h2 className="card-title">{activeCase.title} — investigation journey</h2>
          <Badge tone={STATUS_TONE[activeCase.status] ?? 'neutral'}>{activeCase.status}</Badge>
        </div>
        <JourneyStepper currentStage={activeCase.stage} />
        <div className="divider" />
        <div className="flex gap-10 wrap">
          <button className="btn btn-sm" onClick={() => setActiveTab('evidence')}>
            📦 Evidence Box
          </button>
          <button className="btn btn-sm" onClick={() => setActiveTab('copilot')}>
            💬 Ask the Co-Pilot
          </button>
          <button className="btn btn-sm" onClick={() => setActiveTab('graph')}>
            🕸️ Graph Explorer
          </button>
          <button className="btn btn-sm" onClick={() => setActiveTab('timeline')}>
            📅 Timeline
          </button>
          <button className="btn btn-sm" onClick={() => setActiveTab('audit')}>
            ✅ Fact Audit
          </button>
          <button className="btn btn-sm" onClick={() => setActiveTab('conclusion')}>
            📋 Case Conclusion
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{persona === 'supervisor' ? 'All cases' : 'My cases'}</h2>
          <div className="flex gap-8">
            <div className="search-input-wrap" style={{ width: 240 }}>
              <span className="search-icon">🔎</span>
              <input
                className="input"
                placeholder="Search case title, ID or summary"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="Under investigation">Under investigation</option>
              <option value="Evidence ingestion">Evidence ingestion</option>
              <option value="Pending supervisor review">Pending supervisor review</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗂️</div>
            No cases match your filters.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {filtered.map((c) => (
              <CaseRow
                key={c.id}
                caseItem={c}
                selected={c.id === activeCaseId}
                evidenceCount={(c.isDemoCase ? sources.length : 0) + ingestedSources.filter((s) => s.caseId === c.id).length}
                onSelect={() => {
                  setActiveCaseId(c.id);
                  if (c.isDemoCase) setActiveTab('evidence');
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CaseRow({ caseItem, selected, evidenceCount, onSelect }) {
  const stepLabel = journeySteps.find((s) => s.id === caseItem.stage)?.label ?? '—';
  return (
    <div className={`list-row ${selected ? 'selected' : ''}`} onClick={onSelect} role="button" tabIndex={0}>
      <div style={{ flex: '0 0 150px' }} className="mono text-secondary" title={caseItem.id}>
        {caseItem.id}
      </div>
      <div style={{ flex: '1 1 320px' }}>
        <div className="flex items-center gap-8">
          <strong style={{ fontSize: 13.5 }}>{caseItem.title}</strong>
          {caseItem.isDemoCase && <Badge tone="accent">Demo case</Badge>}
        </div>
        <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
          {caseItem.offence}
        </div>
      </div>
      <div style={{ flex: '0 0 120px' }}>
        <Badge tone={PRIORITY_TONE[caseItem.priority] ?? 'neutral'}>{caseItem.priority}</Badge>
      </div>
      <div style={{ flex: '0 0 180px' }}>
        <Badge tone={STATUS_TONE[caseItem.status] ?? 'neutral'}>{caseItem.status}</Badge>
      </div>
      <div style={{ flex: '0 0 150px' }} className="text-secondary" title="Journey stage">
        Step {caseItem.stage}/5 · {stepLabel}
      </div>
      <div style={{ flex: '0 0 110px' }} className="text-secondary">
        {evidenceCount > 0 ? evidenceCount : '—'} items
      </div>
      <div style={{ flex: '0 0 140px' }} className="text-secondary">
        {caseItem.officer}
      </div>
      <div style={{ flex: '0 0 110px' }} className="text-muted mono" title="Last activity">
        {new Date(caseItem.lastActivity).toLocaleDateString()}
      </div>
    </div>
  );
}
