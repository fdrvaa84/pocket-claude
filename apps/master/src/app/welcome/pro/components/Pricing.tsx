'use client';

import { Check, Github, ArrowRight } from 'lucide-react';

export default function Pricing() {
  return (
    <section className="ln-section" id="pricing">
      <div className="ln-container">
        <div className="ln-section-head center">
          <span className="ln-eyebrow">Pricing</span>
          <h2 className="ln-h2">Run it yourself, or let us run it for you.</h2>
          <p className="ln-lede" style={{ textAlign: 'center' }}>
            Same software either way. Pick what fits your weekend.
          </p>
        </div>

        <div className="ln-pricing-grid">
          {/* Self-hosted */}
          <div className="ln-pricing-card">
            <div className="ln-pricing-head">
              <h3 className="ln-h3" style={{ fontSize: 17 }}>
                Self-hosted
              </h3>
              <span className="ln-pricing-tag">MIT</span>
            </div>
            <div className="ln-pricing-price">
              <span className="num">Free</span>
              <span className="per">forever</span>
            </div>
            <p className="ln-pricing-blurb">
              Bring your own VPS. Clone, configure, ship.
            </p>

            <ul className="ln-pricing-list">
              <Bullet>Full open-source codebase (MIT)</Bullet>
              <Bullet>Unlimited devices</Bullet>
              <Bullet>Unlimited messages and projects</Bullet>
              <Bullet>Docker compose + systemd ready</Bullet>
              <Bullet>Community support on GitHub</Bullet>
            </ul>

            <a
              href="https://github.com/autmzr/autmzr-command"
              target="_blank"
              rel="noreferrer"
              className="ln-btn ln-btn-ghost ln-pricing-cta"
            >
              <Github size={15} strokeWidth={1.6} />
              Get the code
            </a>
          </div>

          {/* Hosted */}
          <div className="ln-pricing-card featured">
            <span className="ln-pricing-badge">Recommended</span>
            <div className="ln-pricing-head">
              <h3 className="ln-h3" style={{ fontSize: 17 }}>
                Hosted
              </h3>
              <span className="ln-pricing-tag featured">SaaS</span>
            </div>
            <div className="ln-pricing-price">
              <span className="num">$5</span>
              <span className="per">/ month</span>
            </div>
            <p className="ln-pricing-blurb">
              We run the master. You connect your servers.
            </p>

            <ul className="ln-pricing-list">
              <Bullet>Everything in self-hosted</Bullet>
              <Bullet>Managed master with SSL out of the box</Bullet>
              <Bullet>Auto-updates on every release</Bullet>
              <Bullet>99.9% uptime target</Bullet>
              <Bullet>Email support within 24h</Bullet>
            </ul>

            <a href="/" className="ln-btn ln-btn-primary ln-pricing-cta">
              Start free trial
              <ArrowRight size={15} strokeWidth={1.8} />
            </a>
          </div>
        </div>

        <p className="ln-pricing-foot">
          Either way, you bring your own AI subscription. We don&rsquo;t resell access.
        </p>
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <Check size={14} strokeWidth={2} className="check" />
      <span>{children}</span>
    </li>
  );
}
