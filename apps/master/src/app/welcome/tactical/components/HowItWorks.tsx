'use client';

export default function HowItWorks() {
  return (
    <section className="tac-sec">
      <div className="tac-container">
        <div className="tac-sec-head">
          <div className="row">
            <span className="id">
              <span className="num">[02]</span> &nbsp; HOW IT WORKS
            </span>
            <span className="tac-tag ok">PROTOCOL · 3 STAGES</span>
          </div>
          <h2 className="tac-h2">FROM ZERO TO CHATTING IN FIVE MINUTES.</h2>
          <p className="tac-sub">
            One curl on each machine. One web app to rule them.
          </p>
        </div>

        <div className="tac-grid-3">
          <Step n="01" code="CONNECT">
            <h3>CONNECT</h3>
            <p>
              Run a single curl on any VPS, mac mini, or work laptop. The agent
              installs as a systemd / launchd service.
            </p>
            <pre className="tac-codeblock">
              <span className="muted">$ </span>
              curl -sSL pocket.app/connect.sh | bash
              {'\n'}
              <span className="ok">{'->'} home-mac connected</span>
            </pre>
          </Step>

          <Step n="02" code="OPEN">
            <h3>OPEN</h3>
            <p>
              Sign in from your phone&rsquo;s browser. Every device you registered
              shows up in one list — online or off.
            </p>
            <DeviceList />
          </Step>

          <Step n="03" code="COMMAND">
            <h3>COMMAND</h3>
            <p>
              Pick a device, send a task. The agent runs 24/7 on your hardware,
              streams every keystroke back.
            </p>
            <ChatPreview />
          </Step>
        </div>
      </div>
    </section>
  );
}

function Step({
  n,
  code,
  children,
}: {
  n: string;
  code: string;
  children: React.ReactNode;
}) {
  return (
    <div className="tac-step">
      <div className="tac-step-bar">
        <span>
          <span className="num">STAGE {n}</span> · {code}
        </span>
        <span>OK</span>
      </div>
      <div className="tac-step-body">{children}</div>
    </div>
  );
}

function DeviceList() {
  const devices: { name: string; status: 'ok' | 'muted'; label: string }[] = [
    { name: 'home-mac', status: 'ok', label: 'ONLINE' },
    { name: 'vps-fra-1', status: 'ok', label: 'ONLINE' },
    { name: 'work-laptop', status: 'muted', label: 'SLEEPING' },
  ];
  return (
    <div className="tac-devlist">
      {devices.map((d) => (
        <div key={d.name} className="row">
          <div className="name">
            <span className={`blip ${d.status}`} />
            <span>{d.name}</span>
          </div>
          <span className="label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="tac-chat">
      <div className="msg user">Add error handling to the upload route</div>
      <div className="msg bot">
        On it. Wrapping with try/catch and logging via{' '}
        <code>pino</code>.
      </div>
    </div>
  );
}
