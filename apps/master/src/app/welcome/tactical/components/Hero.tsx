'use client';

export default function Hero() {
  return (
    <section className="tac-hero">
      <div className="tac-hero-vignette" aria-hidden />

      {/* Top nav bar — looks like a console title bar */}
      <nav className="tac-nav">
        <div className="tac-nav-brand">
          <span className="glyph">A</span>
          <span>AUTMZR/COMMAND</span>
          <span className="tac-tag amber">v0.1.0</span>
        </div>
        <div className="tac-nav-actions">
          <a
            href="https://github.com/autmzr/autmzr-command"
            target="_blank"
            rel="noreferrer"
          >
            [GITHUB]
          </a>
          <a href="/">[SIGN IN]</a>
          <span className="tac-nav-status">
            <span className="blip" />
            LIVE
          </span>
        </div>
      </nav>

      <div className="tac-hero-inner">
        {/* Console window */}
        <div className="tac-console">
          <div className="tac-console-bar">
            <span className="title">CMD/CONSOLE — /welcome/tactical</span>
            <span>SES-001 · UTC</span>
          </div>

          <div className="tac-console-body">
            <p className="tac-prompt">YOUR AI COMMAND CENTER</p>

            <h1 className="tac-h1">
              YOUR AI COMMAND CENTER.
              <br />
              <span className="accent">IN YOUR POCKET.</span>
            </h1>

            <p className="tac-hero-sub">
              Run Claude Code, Aider, and other AI agents on your own servers.
              Drive them all from one phone-friendly chat. One subscription,
              every device, anywhere you happen to be.
            </p>

            <div className="tac-cta-row">
              <a href="/" className="tac-btn primary">
                [ START FREE → ]
              </a>
              <a
                href="https://github.com/autmzr/autmzr-command"
                target="_blank"
                rel="noreferrer"
                className="tac-btn"
              >
                [ ★ STAR ON GITHUB ]
              </a>
            </div>

            <div className="tac-status-line">
              <span>
                <span className="label">STATUS:</span> OPEN-SOURCE
              </span>
              <span>· MIT</span>
              <span>· SELF-HOSTED</span>
              <span>· $5/MO HOSTED</span>
            </div>
          </div>
        </div>

        {/* Telemetry-strip metrics */}
        <div className="tac-hero-meta">
          <div className="cell">
            <div className="k">DEVICES</div>
            <div className="v">UNLIMITED</div>
          </div>
          <div className="cell">
            <div className="k">AGENTS</div>
            <div className="v">CLAUDE · AIDER · CODEX</div>
          </div>
          <div className="cell">
            <div className="k">SETUP</div>
            <div className="v amber">5 MIN</div>
          </div>
          <div className="cell">
            <div className="k">UPTIME TGT</div>
            <div className="v">99.9%</div>
          </div>
        </div>
      </div>
    </section>
  );
}
