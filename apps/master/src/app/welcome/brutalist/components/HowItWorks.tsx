'use client';

export default function HowItWorks() {
  return (
    <section className="bru-section" style={{ background: '#f4f4f4' }}>
      <div className="bru-container">
        <div className="bru-eyebrow">▶ HOW IT WORKS</div>
        <h2>
          From zero to chatting
          <br />
          <span className="accent">in five minutes.</span>
        </h2>
        <p style={{ fontSize: 16, maxWidth: 520, marginTop: 0, fontWeight: 500 }}>
          One curl on each machine. One web app to rule them.
        </p>

        <div className="bru-grid-3">
          <div className="bru-step">
            <span className="step-num mono">01</span>
            <h3>CONNECT</h3>
            <p style={{ fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>
              Run a single curl on any VPS, mac mini, or work laptop.
              The agent installs as a systemd / launchd service.
            </p>
            <div className="demo">
              <span className="muted">$ </span>
              curl -sSL pocket.app/connect.sh | bash
              {'\n\n'}
              <span className="ok">{'->'} home-mac connected</span>
            </div>
          </div>

          <div className="bru-step">
            <span className="step-num mono">02</span>
            <h3>OPEN</h3>
            <p style={{ fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>
              Sign in from your phone\u2019s browser. Every device you registered
              shows up in one list — online or off.
            </p>
            <div className="demo">
              <span className="ok">●</span> home-mac      <span className="muted">[ONLINE]</span>{'\n'}
              <span className="ok">●</span> vps-fra-1     <span className="muted">[ONLINE]</span>{'\n'}
              ○ work-laptop  <span className="muted">[OFFLINE]</span>
            </div>
          </div>

          <div className="bru-step">
            <span className="step-num mono">03</span>
            <h3>COMMAND</h3>
            <p style={{ fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>
              Pick a device, send a task. The agent runs 24/7 on your hardware,
              streams every keystroke back.
            </p>
            <div className="demo">
              {'>'} refactor auth flow{'\n'}
              <span className="ok">[agent]</span> reading...{'\n'}
              <span className="ok">[edit]</span> +47 -3{'\n'}
              <span className="ok">[done]</span> tests pass
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
