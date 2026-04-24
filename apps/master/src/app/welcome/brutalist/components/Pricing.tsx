'use client';

export default function Pricing() {
  return (
    <section className="bru-section" style={{ background: '#f4f4f4' }}>
      <div className="bru-container">
        <div className="bru-eyebrow">▶ PRICING</div>
        <h2>
          Run it yourself,
          <br />
          <span className="accent">or let us run it for you.</span>
        </h2>
        <p style={{ fontSize: 16, maxWidth: 520, marginTop: 0, fontWeight: 500 }}>
          Same software either way. Pick what fits your weekend.
        </p>

        <div className="bru-pricing-grid">
          {/* Self-hosted */}
          <div className="bru-plan">
            <span className="bru-tag">SELF-HOSTED · MIT</span>
            <h3 style={{ marginTop: 16 }}>SELF-HOSTED</h3>
            <div className="price mono">
              FREE<small>forever</small>
            </div>
            <p className="desc">Bring your own VPS. Clone, configure, ship.</p>
            <ul>
              <li>Full open-source codebase (MIT)</li>
              <li>Unlimited devices</li>
              <li>Unlimited messages and projects</li>
              <li>Docker compose + systemd ready</li>
              <li>Community support on GitHub</li>
            </ul>
            <a
              href="https://github.com/autmzr/autmzr-command"
              target="_blank"
              rel="noreferrer"
              className="bru-btn bru-btn-secondary"
              style={{ marginTop: 'auto' }}
            >
              GET THE CODE
            </a>
          </div>

          {/* Hosted */}
          <div className="bru-plan featured">
            <span className="ribbon">RECOMMENDED</span>
            <h3>HOSTED</h3>
            <div className="price mono">
              $5<small>/ month</small>
            </div>
            <p className="desc">We run the master. You connect your servers.</p>
            <ul>
              <li>Everything in self-hosted</li>
              <li>Managed master with SSL out of the box</li>
              <li>Auto-updates on every release</li>
              <li>99.9% uptime target</li>
              <li>Email support within 24h</li>
            </ul>
            <a
              href="/"
              className="bru-btn"
              style={{
                marginTop: 'auto',
                background: '#ff3300',
                color: '#fff',
                border: '3px solid #ff3300',
                boxShadow: '6px 6px 0 #fff',
              }}
            >
              ▶ START FREE TRIAL
            </a>
          </div>
        </div>

        <p className="mono" style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Either way, you bring your own AI subscription. We don\u2019t resell access.
        </p>
      </div>
    </section>
  );
}
