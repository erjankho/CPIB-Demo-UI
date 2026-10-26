import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { discrepancies, mergeSuggestions } from '../../data/factAudit.js';
import { sourceById } from '../../data/sources.js';
import { CitedText } from '../common/CitedText.jsx';
import { Badge } from '../common/Badge.jsx';

const SUPPORTED_FACTS = [
  {
    text:
      'Horizon Crest Advisory Pte Ltd was incorporated five weeks before the first "advisory" payment from Seacrest Coastal & Marine Works, with a sole director who states the company operated at Kenneth Lau\u2019s direction.',
    cites: [{ marker: 1, sourceId: 's-doc-acra', label: 'DC-01' }, { marker: 2, sourceId: 's-stmt-serene', label: 'ST-04' }],
  },
  {
    text:
      'Seacrest paid SGD 420,000 to Horizon Crest across two tranches, the second coming 16 days after contract award.',
    cites: [{ marker: 1, sourceId: 's-fin-01', label: 'FN-01' }],
  },
  {
    text:
      'The technical scoring for contract T/2026/MD/0084 was revised after David Tan, as evaluation chair, exported the benchmark dataset outside working hours with no second approver — moving Seacrest from rank 3 to rank 1 with no new submissions received.',
    cites: [{ marker: 1, sourceId: 's-doc-access', label: 'DC-03' }, { marker: 2, sourceId: 's-doc-tec', label: 'DC-02' }],
  },
  {
    text:
      'A wristwatch and F1 Paddock Club passes purchased by Horizon Crest were linked by delivery and booking records to David Tan and his household.',
    cites: [{ marker: 1, sourceId: 's-doc-invoice', label: 'DC-04' }, { marker: 2, sourceId: 's-doc-f1', label: 'DC-05' }],
  },
];

export function CaseConclusion() {
  const { persona, activeCase, openEvidence } = useApp();
  const approvedMerges = mergeSuggestions.filter((m) => m.status === 'approved' || (m.resolution && m.resolution.decision === 'approved'));
  const openHighSeverity = discrepancies.filter((d) => d.severity === 'high');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Case Conclusion — {activeCase.title}</h1>
          <p className="page-subtitle">
            A cited summary of supported facts and open discrepancies, for review by the {persona === 'supervisor' ? 'Case Supervisor' : 'Case Supervisor'}.
            Every statement below links back to its source evidence.
          </p>
        </div>
        <Badge tone="warning">Draft — pending supervisor sign-off</Badge>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h2 className="card-title">Supported facts</h2>
        </div>
        <div className="flex flex-col gap-10">
          {SUPPORTED_FACTS.map((f, i) => (
            <div key={i} className="fact-item">
              <span className="fact-bullet">●</span>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                <CitedText text={f.text} citations={f.cites} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h2 className="card-title">Open discrepancies requiring resolution</h2>
          <Badge tone="danger">{openHighSeverity.length} high severity</Badge>
        </div>
        <div className="flex flex-col gap-10">
          {discrepancies.map((d) => (
            <div key={d.id} className="list-row" style={{ cursor: 'default' }}>
              <div style={{ flex: '0 0 110px' }}>
                <Badge tone={d.severity === 'high' ? 'danger' : 'warning'}>{d.severity}</Badge>
              </div>
              <div style={{ flex: 1, fontSize: 13 }}>{d.topic}</div>
              <div className="text-muted" style={{ flex: '0 0 160px', fontSize: 11.5 }}>
                {d.statements.length} statements compared
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h2 className="card-title">Approved entity resolutions</h2>
        </div>
        {approvedMerges.length === 0 ? (
          <div className="text-muted" style={{ fontSize: 12.5 }}>
            No merges approved yet — complete Fact Audit before finalising the conclusion.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {approvedMerges.map((m) => (
              <div key={m.id} className="kv-row">
                <span className="kv-key">
                  "{m.entityA.label}" ↔ "{m.entityB.label}"
                </span>
                <Badge tone="success">Approved</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Multilingual evidence closing out this case</h2>
        </div>
        <p className="text-secondary" style={{ fontSize: 12.5, marginTop: 0 }}>
          The carpark recording (AU-01) mixes Malay, English and Chinese across two voice-identified speakers. Full
          transcript with speaker confidence is available in the Evidence Box for officer review before this
          conclusion is submitted.
        </p>
        <button className="btn btn-sm" onClick={() => openEvidence('s-audio-01')}>
          🎧 Review AU-01 transcript
        </button>
      </div>
    </div>
  );
}
