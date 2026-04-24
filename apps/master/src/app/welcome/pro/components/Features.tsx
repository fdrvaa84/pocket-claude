'use client';

import {
  Globe,
  Smartphone,
  RefreshCw,
  Plug2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Globe,
    title: 'Multi-device',
    body: 'Servers, laptops, mac minis \u2014 all under one dashboard. Switch context with a tap.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-first UI',
    body: 'Built for one-handed use on a phone. The desktop just gets the same UI, wider.',
  },
  {
    icon: RefreshCw,
    title: 'Resume anywhere',
    body: 'Close a tab, open another. Your conversation, files, and tool calls stay exactly where they were.',
  },
  {
    icon: Plug2,
    title: 'Multi-agent',
    body: 'Claude Code today. Aider, Gemini CLI, Codex coming next. Same chat, different brains.',
  },
  {
    icon: ShieldCheck,
    title: 'Your subscription',
    body: 'We never see your API keys or OAuth tokens. Auth stays on your device, on your terms.',
  },
  {
    icon: Zap,
    title: '5-minute setup',
    body: 'One curl. One web sign-in. No Docker compose files to debug at 2am.',
  },
];

export default function Features() {
  return (
    <section className="ln-section" id="features">
      <div className="ln-container">
        <div className="ln-section-head center">
          <span className="ln-eyebrow">Features</span>
          <h2 className="ln-h2">Built for the way you actually code now.</h2>
        </div>

        <div className="ln-grid cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <article key={title} className="ln-card">
              <span className="icon-box">
                <Icon size={16} strokeWidth={1.5} />
              </span>
              <h3 className="ln-h3">{title}</h3>
              <p className="ln-body" style={{ marginTop: 8 }}>
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
