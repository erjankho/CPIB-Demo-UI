import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { cases } from '../../data/caseData.js';

export function ClassificationBanner() {
  const { activeCase } = useApp();
  return <div className="classification-banner">{activeCase.classification.toUpperCase()} · DEMO DATA ONLY — NOT A REAL CASE</div>;
}

export function TopBar() {
  const { persona, setPersona, activeCase, activeCaseId, setActiveCaseId, theme, toggleTheme } = useApp();

  return (
    <div className="topbar">
      <div className="topbar-brand">
        <span className="brand-mark">IC</span>
        Investigator Co-Pilot
      </div>

      <select
        className="select topbar-case"
        value={activeCaseId}
        onChange={(e) => setActiveCaseId(e.target.value)}
        style={{ maxWidth: 340 }}
        aria-label="Active case"
      >
        {cases.map((c) => (
          <option key={c.id} value={c.id}>
            {c.id} — {c.title}
          </option>
        ))}
      </select>

      <div className="topbar-spacer" />

      <div className="persona-switch" role="tablist" aria-label="Persona view">
        <button className={persona === 'officer' ? 'active' : ''} onClick={() => setPersona('officer')}>
          Investigation Officer
        </button>
        <button className={persona === 'supervisor' ? 'active' : ''} onClick={() => setPersona('supervisor')}>
          Case Supervisor
        </button>
      </div>

      <button
        className="icon-btn"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        aria-label="Toggle colour theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="topbar-user">
        <div className="avatar">{persona === 'officer' ? activeCase.officerInitials : 'DC'}</div>
        <span>{persona === 'officer' ? activeCase.officer : activeCase.supervisor}</span>
      </div>
    </div>
  );
}
