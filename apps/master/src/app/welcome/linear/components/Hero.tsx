'use client';

import { ArrowRight, Github, Terminal } from 'lucide-react';

export default function Hero() {
  return (
    <>
      <nav className="ln-nav">
        <div className="ln-container ln-nav-inner">
          <a href="#" className="ln-brand">
            <span className="ln-brand-mark">
              <Terminal size={13} strokeWidth={2.4} />
            </span>
            Autmzr Command
          </a>
          <div className="ln-nav-links">
            <a href="#features" className="ln-nav-link optional">
              Features
            </a>
            <a href="#pricing" className="ln-nav-link optional">
              Pricing
            </a>
            <a href="#faq" className="ln-nav-link optional">
              FAQ
            </a>
            <a
              href="https://github.com/autmzr/autmzr-command"
              target="_blank"
              rel="noreferrer"
              className="ln-nav-link"
            >
              <Github size={13} strokeWidth={1.6} />
              GitHub
            </a>
            <a href="/" className="ln-btn ln-btn-ghost ln-btn-sm">
              Sign in
            </a>
          </div>
        </div>
      </nav>

      <section className="ln-hero">
        <div className="ln-hero-glow" aria-hidden />
        <div className="ln-hero-grid" aria-hidden />

        <div className="ln-container ln-hero-inner">
          <span className="ln-eyebrow">
            <span className="dot" />
            OPEN SOURCE · v0.1.0 · MIT
          </span>

          <h1 className="ln-h1">
            Your AI command center.
            <br />
            <span className="accent">In your pocket.</span>
          </h1>

          <p className="ln-lede">
            Run Claude Code, Aider, and other AI agents on your own servers.
            Drive them all from one phone-friendly chat. One subscription, every
            device, anywhere you happen to be.
          </p>

          <div className="ln-hero-ctas">
            <a href="/" className="ln-btn ln-btn-primary">
              Try free
              <ArrowRight size={15} strokeWidth={1.8} />
            </a>
            <a
              href="https://github.com/autmzr/autmzr-command"
              target="_blank"
              rel="noreferrer"
              className="ln-btn ln-btn-ghost"
            >
              <Github size={15} strokeWidth={1.6} />
              Star on GitHub
            </a>
          </div>

          <p className="ln-hero-meta">
            Open-source · MIT · Self-hosted or $5/mo hosted
          </p>

          <div className="ln-mockup-wrap">
            <PhoneMockup />
          </div>
        </div>
      </section>
    </>
  );
}

function PhoneMockup() {
  return (
    <div className="ln-phone">
      <div className="ln-phone-frame">
        <div className="ln-phone-notch" />
        <div className="ln-phone-screen">
          <div className="ln-chat-head">
            <div className="device">
              <span className="ok" />
              home-mac
              <span className="ctx">· autmzr-command</span>
            </div>
            <span className="agent">claude</span>
          </div>

          <div className="ln-chat-body">
            <div className="ln-bubble user">
              Refactor the auth flow into a hook
            </div>
            <div className="ln-bubble assistant">
              Looking at <code>AuthScreen.tsx</code>. I&rsquo;ll extract:
              <ul>
                <li>
                  <code>useAuth()</code> — state + submit
                </li>
                <li>
                  <code>useInviteCode()</code> — URL parse
                </li>
              </ul>
            </div>
            <div className="ln-bubble tool">
              edit · src/hooks/useAuth.ts · +47 -3
            </div>
            <div className="ln-bubble assistant">
              Done. Tests pass. Want me to wire it into the page?
            </div>
          </div>

          <div className="ln-chat-composer">
            <div className="input">
              <span>Reply to claude…</span>
              <span className="typing" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
