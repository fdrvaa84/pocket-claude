'use client';

export default function Hero() {
  return (
    <>
      {/* Top nav */}
      <nav className="bru-nav">
        <div className="bru-nav-inner">
          <div className="bru-brand">
            AUTMZR<b>/</b>COMMAND
          </div>
          <div className="bru-nav-links">
            <a
              href="https://github.com/autmzr/autmzr-command"
              target="_blank"
              rel="noreferrer"
              className="bru-btn-ghost bru-btn"
              style={{ border: 0, boxShadow: 'none', padding: '8px 12px' }}
            >
              GitHub
            </a>
            <a
              href="/"
              className="bru-btn"
              style={{
                padding: '8px 16px',
                fontSize: 13,
                boxShadow: '4px 4px 0 #000',
              }}
            >
              SIGN IN
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bru-hero">
        <div className="bru-hero-inner">
          <div className="mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 24 }}>
            ▶ v0.1 · open-source · MIT
          </div>
          <h1>
            YOUR AI
            <br />
            COMMAND
            <br />
            <span className="accent">CENTER.</span>
          </h1>
          <p className="sub">
            Run Claude Code, Aider, and other AI agents on your own servers.
            Drive them all from one phone-friendly chat. One subscription, every device, anywhere you happen to be.
          </p>
          <p className="meta">
            open-source · MIT · self-hosted or hosted
          </p>
          <div className="ctas">
            <a href="/" className="bru-btn bru-btn-primary">
              <span className="arrow-marker">▶</span>
              TRY FREE
            </a>
            <a
              href="https://github.com/autmzr/autmzr-command"
              target="_blank"
              rel="noreferrer"
              className="bru-btn bru-btn-secondary"
            >
              ★ STAR ON GITHUB
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
