import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { cases } from '../data/caseData.js';

const AppContext = createContext(null);
const THEME_STORAGE_KEY = 'cpib-copilot-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage?.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  return prefersLight ? 'light' : 'dark';
}

export function AppProvider({ children }) {
  const [persona, setPersona] = useState('officer'); // 'officer' | 'supervisor'
  const [activeCaseId, setActiveCaseId] = useState(cases.find((c) => c.isDemoCase)?.id ?? cases[0].id);
  const [activeTab, setActiveTab] = useState('workbench');
  const [evidenceDrawer, setEvidenceDrawer] = useState(null); // sourceId or null
  const [graphFocusPath, setGraphFocusPath] = useState(null); // array of entity ids to highlight, set by copilot/timeline
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage?.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const activeCase = useMemo(() => cases.find((c) => c.id === activeCaseId) ?? cases[0], [activeCaseId]);

  // The drawer resolves the id against both seeded and newly ingested sources.
  const openEvidence = useCallback((sourceId) => {
    if (sourceId) setEvidenceDrawer(sourceId);
  }, []);

  const closeEvidence = useCallback(() => setEvidenceDrawer(null), []);

  const jumpToGraph = useCallback((path) => {
    setGraphFocusPath(path ?? null);
    setActiveTab('graph');
  }, []);

  const value = {
    persona,
    setPersona,
    activeCaseId,
    setActiveCaseId,
    activeCase,
    activeTab,
    setActiveTab,
    evidenceDrawer,
    openEvidence,
    closeEvidence,
    graphFocusPath,
    setGraphFocusPath,
    jumpToGraph,
    theme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
