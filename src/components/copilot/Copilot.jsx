import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { copilotScript, suggestedQuestions } from '../../data/copilotScript.js';
import { CitedText } from '../common/CitedText.jsx';
import { Badge } from '../common/Badge.jsx';

export function Copilot() {
  const { jumpToGraph } = useApp();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      kind: 'intro',
      text:
        'Ask how people, companies or events connect in this case. I combine graph traversal with keyword search over the evidence box, and every answer is cited back to source.',
    },
  ]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);

  function ask(question) {
    const script = copilotScript.find((s) => s.question.toLowerCase() === question.toLowerCase());
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setDraft('');
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      if (script) {
        setMessages((m) => [...m, { role: 'assistant', kind: 'answer', script }]);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            kind: 'fallback',
            text:
              'This demo script does not cover that exact question. Try one of the suggested questions below, or ask about David Tan, Kenneth Lau, Horizon Crest or the Labuan remittance.',
          },
        ]);
      }
    }, 900);
  }

  return (
    <div className="page" style={{ maxWidth: 980 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Investigate — Co-Pilot</h1>
          <p className="page-subtitle">
            Graph search finds multi-hop relationships; keyword search (BM25) finds exact names, amounts and
            phrases. The case AI agent combines both, scoped to this case only.
          </p>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '62vh' }}>
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} onViewGraph={jumpToGraph} />
          ))}
          {thinking && (
            <div className="flex gap-8 items-center" style={{ marginTop: 10 }}>
              <Badge tone="accent">Case AI agent</Badge>
              <span className="text-muted mono" style={{ fontSize: 12 }}>
                traversing graph · running keyword search…
              </span>
            </div>
          )}
        </div>

        <div className="divider" />

        <div className="flex gap-6 wrap" style={{ marginBottom: 10 }}>
          {suggestedQuestions.map((q) => (
            <button key={q} className="chip" style={{ cursor: 'pointer' }} onClick={() => ask(q)}>
              {q}
            </button>
          ))}
        </div>

        <form
          className="flex gap-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) ask(draft.trim());
          }}
        >
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Ask about relationships, entities or evidence in this case…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={thinking || !draft.trim()}>
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message, onViewGraph }) {
  if (message.role === 'user') {
    return (
      <div className="flex" style={{ justifyContent: 'flex-end', margin: '10px 0' }}>
        <div
          style={{
            background: 'var(--accent-dim)',
            color: 'var(--accent-strong)',
            borderRadius: 12,
            padding: '9px 14px',
            fontSize: 13,
            maxWidth: '75%',
          }}
        >
          {message.text}
        </div>
      </div>
    );
  }

  if (message.kind === 'intro' || message.kind === 'fallback') {
    return (
      <div style={{ margin: '10px 0', maxWidth: '85%' }}>
        <Badge tone="accent">Case AI agent</Badge>
        <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-secondary)' }}>{message.text}</div>
      </div>
    );
  }

  const { script } = message;
  return (
    <div style={{ margin: '14px 0', maxWidth: '92%' }}>
      <Badge tone="accent">Case AI agent</Badge>

      <div
        className="card"
        style={{ marginTop: 8, background: 'var(--bg-2)', fontSize: 12, padding: 12 }}
      >
        <div className="flex gap-10 wrap">
          <div style={{ flex: 1 }}>
            <div className="section-label" style={{ margin: '0 0 6px' }}>
              Graph search
            </div>
            {script.graphHits.map((h, i) => (
              <div key={i} className="mono text-secondary" style={{ fontSize: 11.5, marginBottom: 3 }}>
                ⇄ {h}
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div className="section-label" style={{ margin: '0 0 6px' }}>
              Keyword search (BM25)
            </div>
            {script.keywordHits.map((h, i) => (
              <div key={i} className="mono text-secondary" style={{ fontSize: 11.5, marginBottom: 3 }}>
                🔎 {h}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.6 }}>
        <CitedText text={script.answer} citations={script.citations} />
      </div>

      {script.highlightPath && (
        <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={() => onViewGraph(script.highlightPath)}>
          🕸️ View this path in Graph Explorer
        </button>
      )}
    </div>
  );
}
