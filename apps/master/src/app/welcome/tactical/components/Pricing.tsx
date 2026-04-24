'use client';

export default function Pricing() {
  return (
    <section className="tac-sec">
      <div className="tac-container">
        <div className="tac-sec-head">
          <div className="row">
            <span className="id">
              <span className="num">[04]</span> &nbsp; PRICING
            </span>
            <span className="tac-tag">02 PLANS</span>
          </div>
          <h2 className="tac-h2">RUN IT YOURSELF, OR LET US RUN IT FOR YOU.</h2>
          <p className="tac-sub">
            Same software either way. Pick what fits your weekend.
          </p>
        </div>

        <div className="tac-price-grid">
          {/* Self-hosted */}
          <div className="tac-price">
            <div className="tac-price-head">
              <span className="name">[ SELF-HOSTED ]</span>
              <span>MIT · OSS</span>
            </div>
            <div className="tac-price-body">
              <div className="tac-price-amount">
                <span className="big">FREE</span>
                <span className="small">FOREVER</span>
              </div>
              <p className="tac-price-tagline">
                Bring your own VPS. Clone, configure, ship.
              </p>
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
                className="tac-btn ghost tac-price-cta"
              >
                [ GET THE CODE ]
              </a>
            </div>
          </div>

          {/* Hosted */}
          <div className="tac-price featured">
            <div className="tac-price-head">
              <span className="name">[ HOSTED ]</span>
              <span style={{ color: 'var(--tac-vibrant)' }}>
                ★ RECOMMENDED
              </span>
            </div>
            <div className="tac-price-body">
              <div className="tac-price-amount">
                <span className="big" style={{ color: 'var(--tac-vibrant)' }}>
                  $5
                </span>
                <span className="small">/ MONTH</span>
              </div>
              <p className="tac-price-tagline">
                We run the master. You connect your servers.
              </p>
              <ul>
                <li>Everything in self-hosted</li>
                <li>Managed master with SSL out of the box</li>
                <li>Auto-updates on every release</li>
                <li>99.9% uptime target</li>
                <li>Email support within 24h</li>
              </ul>
              <a href="/" className="tac-btn primary tac-price-cta">
                [ START FREE TRIAL → ]
              </a>
            </div>
          </div>
        </div>

        <p className="tac-price-foot">
          // EITHER WAY, YOU BRING YOUR OWN AI SUBSCRIPTION. WE DON&rsquo;T RESELL ACCESS.
        </p>
      </div>
    </section>
  );
}
