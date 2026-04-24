'use client';

import { Plug, Smartphone, MessageCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section className="ln-section" id="how">
      <div className="ln-container">
        <div className="ln-section-head center">
          <span className="ln-eyebrow">How it works</span>
          <h2 className="ln-h2">From zero to chatting in five minutes.</h2>
          <p className="ln-lede" style={{ textAlign: 'center' }}>
            One curl on each machine. One web app to rule them.
          </p>
        </div>

        <div className="ln-grid cols-3">
          <Step
            number={1}
            icon={Plug}
            title="Connect"
            body="Run a single curl on any VPS, mac mini, or work laptop. The agent installs as a systemd / launchd service."
          >
            <pre className="ln-codeblock">
              <span style={{ color: 'var(--muted)' }}>$ </span>curl -sSL pocket.app/connect.sh | bash
              {'\n'}
              <span style={{ color: 'var(--ok)' }}>{'->'} home-mac connected</span>
            </pre>
          </Step>

          <Step
            number={2}
            icon={Smartphone}
            title="Open"
            body="Sign in from your phone’s browser. Every device you registered shows up in one list — online or off."
          >
            <DeviceList />
          </Step>

          <Step
            number={3}
            icon={MessageCircle}
            title="Command"
            body="Pick a device, send a task. The agent runs 24/7 on your hardware, streams every keystroke back."
          >
            <ChatPreview />
          </Step>
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  icon: Icon,
  title,
  body,
  children,
}: {
  number: number;
  icon: LucideIcon;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ln-step">
      <div className="ln-step-head">
        <span className="ln-step-num">{number}</span>
        <Icon size={16} strokeWidth={1.5} style={{ color: 'var(--muted)' }} />
        <h3 className="ln-h3">{title}</h3>
      </div>
      <p className="ln-body">{body}</p>
      <div style={{ marginTop: 'auto' }}>{children}</div>
    </div>
  );
}

function DeviceList() {
  const devices = [
    { name: 'home-mac', status: 'ok', label: 'online' },
    { name: 'vps-fra-1', status: 'ok', label: 'online' },
    { name: 'work-laptop', status: 'muted', label: 'sleeping' },
  ];
  return (
    <div className="ln-devicelist">
      {devices.map((d) => (
        <div key={d.name} className="row">
          <span className="left">
            <span
              className="dot"
              style={{
                background:
                  d.status === 'ok' ? 'var(--ok)' : 'var(--muted)',
                boxShadow:
                  d.status === 'ok' ? '0 0 8px var(--ok)' : 'none',
              }}
            />
            {d.name}
          </span>
          <span className="label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="ln-chatpreview">
      <div className="b-user">Add error handling to the upload route</div>
      <div className="b-asst">
        On it. Wrapping with try/catch and logging via{' '}
        <code style={{ fontFamily: 'var(--font-mono)' }}>pino</code>.
      </div>
    </div>
  );
}
