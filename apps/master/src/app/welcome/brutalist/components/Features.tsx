'use client';

const FEATURES = [
  { n: 'F-01', title: 'MULTI-DEVICE',     body: 'Servers, laptops, mac minis — all under one dashboard. Switch context with a tap.' },
  { n: 'F-02', title: 'MOBILE-FIRST UI',  body: 'Built for one-handed use on a phone. The desktop just gets the same UI, wider.' },
  { n: 'F-03', title: 'RESUME ANYWHERE',  body: 'Close a tab, open another. Your conversation, files, and tool calls stay exactly where they were.' },
  { n: 'F-04', title: 'MULTI-AGENT',      body: 'Claude Code today. Aider, Gemini CLI, Codex coming next. Same chat, different brains.' },
  { n: 'F-05', title: 'YOUR SUBSCRIPTION', body: 'We never see your API keys or OAuth tokens. Auth stays on your device, on your terms.' },
  { n: 'F-06', title: '5-MINUTE SETUP',   body: 'One curl. One web sign-in. No Docker compose files to debug at 2am.' },
];

export default function Features() {
  return (
    <section className="bru-section">
      <div className="bru-container">
        <div className="bru-eyebrow">▶ FEATURES</div>
        <h2>
          Built for the way
          <br />
          <span className="accent">you actually code now.</span>
        </h2>

        <div className="bru-grid-3">
          {FEATURES.map((f) => (
            <div key={f.n} className="bru-card">
              <span className="num mono">{f.n}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
