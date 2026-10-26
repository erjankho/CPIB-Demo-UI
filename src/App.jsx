import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { IngestionProvider } from './context/IngestionContext.jsx';
import { ClassificationBanner, TopBar } from './components/shell/TopBar.jsx';
import { NavTabs } from './components/shell/NavTabs.jsx';
import { EvidenceDrawer } from './components/common/EvidenceDrawer.jsx';

import { Workbench } from './components/workbench/Workbench.jsx';
import { Ingestion } from './components/ingestion/Ingestion.jsx';
import { EvidenceBox } from './components/evidence/EvidenceBox.jsx';
import { Copilot } from './components/copilot/Copilot.jsx';
import { GraphExplorer } from './components/graph/GraphExplorer.jsx';
import { Timeline } from './components/timeline/Timeline.jsx';
import { FactAudit } from './components/audit/FactAudit.jsx';
import { CaseConclusion } from './components/conclusion/CaseConclusion.jsx';

function Shell() {
  const { activeTab } = useApp();

  return (
    <div className="app-shell">
      <ClassificationBanner />
      <TopBar />
      <NavTabs />
      <div className="main-area">
        {activeTab === 'workbench' && <Workbench />}
        {activeTab === 'ingest' && <Ingestion />}
        {activeTab === 'evidence' && <EvidenceBox />}
        {activeTab === 'copilot' && <Copilot />}
        {activeTab === 'graph' && <GraphExplorer />}
        {activeTab === 'timeline' && <Timeline />}
        {activeTab === 'audit' && <FactAudit />}
        {activeTab === 'conclusion' && <CaseConclusion />}
      </div>
      <EvidenceDrawer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <IngestionProvider>
        <Shell />
      </IngestionProvider>
    </AppProvider>
  );
}
