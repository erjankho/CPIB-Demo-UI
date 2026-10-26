import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useIngestion } from '../../context/IngestionContext.jsx';

const TABS = [
  { id: 'workbench', label: 'Case Workbench', icon: '🗂️' },
  { id: 'ingest', label: 'Ingestion', icon: '⬆️' },
  { id: 'evidence', label: 'Evidence Box', icon: '📦' },
  { id: 'copilot', label: 'Investigate (Co-Pilot)', icon: '💬' },
  { id: 'graph', label: 'Graph Explorer', icon: '🕸️' },
  { id: 'timeline', label: 'Timeline', icon: '📅' },
  { id: 'audit', label: 'Fact Audit', icon: '✅' },
  { id: 'conclusion', label: 'Case Conclusion', icon: '📋' },
];

export function NavTabs() {
  const { activeTab, setActiveTab, activeCaseId } = useApp();
  const { jobs } = useIngestion();
  const activeJobs = jobs.filter((j) => j.caseId === activeCaseId && (j.status === 'queued' || j.status === 'processing')).length;

  return (
    <div className="nav-tabs" role="tablist" aria-label="Case sections">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`nav-tab ${activeTab === t.id ? 'active' : ''}`}
          role="tab"
          aria-selected={activeTab === t.id}
          onClick={() => setActiveTab(t.id)}
        >
          <span className="nav-tab-icon">{t.icon}</span>
          {t.label}
          {t.id === 'ingest' && activeJobs > 0 && (
            <span className="nav-badge" aria-label={`${activeJobs} items processing`}>
              {activeJobs}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
