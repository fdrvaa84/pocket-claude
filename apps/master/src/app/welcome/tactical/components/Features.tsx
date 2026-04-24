'use client';

const FEATURES = [
  {
    id: 'F-01',
    title: 'MULTI-DEVICE',
    body: 'Servers, laptops, mac minis — all under one dashboard. Switch context with a tap.',
  },
  {
    id: 'F-02',
    title: 'MOBILE-FIRST UI',
    body: 'Built for one-handed use on a phone. The desktop just gets the same UI, wider.',
  },
  {
    id: 'F-03',
    title: 'RESUME ANYWHERE',
    body: 'Close a tab, open another. Your conversation, files, and tool calls stay exactly where they were.',
  },
  {
    id: 'F-04',
    title: 'MULTI-AGENT',
    body: 'Claude Code today. Aider, Gemini CLI, Codex coming next. Same chat, different brains.',
  },
  {
    id: 'F-05',
    title: 'YOUR SUBSCRIPTION',
    body: 'We never see your API keys or OAuth tokens. Auth stays on your device, on your terms.',
  },
  {
    id: 'F-06',
    title: '5-MINUTE SETUP',
    body: 'One curl. One web sign-in. No Docker compose files to debug at 2am.',
  },
];

export default function Features() {
  return (
    <section className="tac-sec">
      <div className="tac-container">
        <div className="tac-sec-head">
          <div className="row">
            <span className="id">
              <span className="num">[03]</span> &nbsp; FEATURES
            </span>
            <span className="tac-tag amber">06 MODULES · ALL ACTIVE</span>
          </div>
          <h2 className="tac-h2">BUILT FOR THE WAY YOU ACTUALLY CODE NOW.</h2>
        </div>

        <div className="tac-grid-feat">
          {FEATURES.map((f) => (
            <div key={f.id} className="tac-feat">
              <div className="head">
                <span className="id">{f.id}</span>
                <span>[ ACTIVE ]</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
