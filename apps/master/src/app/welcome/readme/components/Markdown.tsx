'use client';

export default function Markdown() {
  return (
    <article className="rm-md">
      {/* H1 + badges + lede */}
      <h1 id="autmzr-command">
        <span className="anchor">#</span>
        autmzr/command
      </h1>

      <div className="rm-badges">
        <span className="rm-badge"><span className="left">build</span><span className="right">passing</span></span>
        <span className="rm-badge gold"><span className="left">version</span><span className="right">v0.1.0</span></span>
        <span className="rm-badge blue"><span className="left">license</span><span className="right">MIT</span></span>
        <span className="rm-badge violet"><span className="left">stars</span><span className="right">1.2k</span></span>
        <span className="rm-badge"><span className="left">discord</span><span className="right">join</span></span>
      </div>

      <p className="lede">
        Open-source bridge between your phone and AI coding CLIs running on
        your servers. Run <code>claude</code>, <code>aider</code>, <code>gemini</code>,{' '}
        and others 24/7 on cheap hardware — drive them all from one mobile-friendly chat.
      </p>

      <div className="rm-actions">
        <a href="/" className="rm-btn primary">▶ Try free</a>
        <a
          href="https://github.com/autmzr/autmzr-command"
          target="_blank"
          rel="noreferrer"
          className="rm-btn"
        >
          ★ Star on GitHub
        </a>
        <a
          href="#install"
          className="rm-btn"
        >
          ↓ Install
        </a>
      </div>

      <blockquote className="note">
        <span className="label">Note</span>
        Self-hosted (free, MIT) or hosted ($5/mo). You bring the AI subscription.
        We never see your tokens.
      </blockquote>

      {/* WHY */}
      <h2 id="why">
        <span className="anchor">##</span>
        Why
      </h2>

      <p>The problem we solve, in four bullets:</p>
      <ul>
        <li><b>Close the lid, kill the agent.</b> AI coding CLIs die with your laptop. Long tasks need a machine that never sleeps.</li>
        <li><b>Always-on work, sometimes-on hardware.</b> Refactor 50 files overnight. Your laptop shouldn&rsquo;t be in the loop.</li>
        <li><b>One workflow, three machines.</b> Work laptop, home server, $4 VPS — switching context is a part-time job.</li>
        <li><b>Phones can&rsquo;t SSH like humans.</b> The agent asked a question over lunch. By the time you&rsquo;re back at the keyboard, the moment is gone.</li>
      </ul>

      <blockquote className="tip">
        <span className="label">In one line</span>
        Hold AI agents on your servers 24/7. Command them from anywhere via mobile.
      </blockquote>

      {/* INSTALL */}
      <h2 id="install">
        <span className="anchor">##</span>
        Install
      </h2>

      <h3>Option A — Hosted ($5/mo)</h3>
      <p>Sign up, get an invite code, install agent on each device:</p>

      <pre><code>
        <span className="cmt"># 1. on each server / laptop / mac mini</span>{'\n'}
        <span className="prompt">$ curl -sSL command.autmzr.ru/connect.sh | bash</span>{'\n'}
        {'\n'}
        {'  '}<span className="ok">[ok] agent installed as systemd service</span>{'\n'}
        {'  '}<span className="ok">[ok] connected to command.autmzr.ru as "home-mac"</span>{'\n'}
        {'\n'}
        <span className="cmt"># 2. open your phone browser</span>{'\n'}
        <span className="cmt"># 3. log in. all your machines are there.</span>
      </code></pre>

      <h3>Option B — Self-host</h3>
      <pre><code>
        <span className="prompt">$ git clone https://github.com/autmzr/autmzr-command</span>{'\n'}
        <span className="prompt">$ cd autmzr-command && npm install</span>{'\n'}
        <span className="prompt">$ cp .env.example .env</span>  <span className="cmt"># add DATABASE_URL etc</span>{'\n'}
        <span className="prompt">$ npm run migrate && npm start</span>{'\n'}
        {'\n'}
        {'  '}<span className="ok">→ master ready on http://0.0.0.0:3100</span>
      </code></pre>

      <blockquote className="warning">
        <span className="label">Requirements</span>
        Node 20+, Postgres 14+, a domain with TLS for the master. Agents run on
        Linux/macOS — anything that can run Node.js works.
      </blockquote>

      {/* USAGE */}
      <h2 id="usage">
        <span className="anchor">##</span>
        Usage
      </h2>

      <p>The web UI is the primary interface, but everything is also driven by JSON over WebSocket — so scripting works:</p>

      <pre><code>
        <span className="cmt"># Send a task to a specific device, stream output back</span>{'\n'}
        <span className="prompt">$ autmzr send --device home-mac --project myapp \</span>{'\n'}
        {'    '}<span className="prompt">"refactor src/auth into a hook"</span>{'\n'}
        {'\n'}
        {'  '}<span className="key">[device]</span> <span className="str">home-mac</span>{'\n'}
        {'  '}<span className="key">[agent]</span>  <span className="str">claude-code v1.0.119</span>{'\n'}
        {'  '}<span className="key">[edit]</span>   <span className="ok">+47 -3 src/hooks/useAuth.ts</span>{'\n'}
        {'  '}<span className="key">[edit]</span>   <span className="ok">+12 -8 src/components/AuthScreen.tsx</span>{'\n'}
        {'  '}<span className="key">[exec]</span>   <span className="prompt">npm test</span> → <span className="ok">27 passed</span>{'\n'}
        {'  '}<span className="key">[done]</span>   <span className="ok">task complete in 47s</span>
      </code></pre>

      {/* FEATURES */}
      <h2 id="features">
        <span className="anchor">##</span>
        Features
      </h2>

      <table>
        <thead>
          <tr>
            <th style={{ width: 130 }}>Feature</th>
            <th>What it does</th>
            <th style={{ width: 100 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>multi-device</code></td><td>One dashboard for every server, laptop, mac mini you own.</td><td>✅ shipping</td></tr>
          <tr><td><code>mobile-first</code></td><td>Built for one-handed use on a phone. Desktop just gets the same UI wider.</td><td>✅ shipping</td></tr>
          <tr><td><code>resume-anywhere</code></td><td>Close a tab, open another. Conversation, files, tool calls intact.</td><td>✅ shipping</td></tr>
          <tr><td><code>multi-agent</code></td><td>Claude Code today. Aider, Gemini CLI, Codex on the roadmap.</td><td>🟡 partial</td></tr>
          <tr><td><code>your-keys</code></td><td>We never see your API keys or OAuth tokens. Auth stays local.</td><td>✅ shipping</td></tr>
          <tr><td><code>5min-setup</code></td><td>One curl. One web sign-in. No Docker compose to debug at 2am.</td><td>✅ shipping</td></tr>
          <tr><td><code>push-notif</code></td><td>Native iOS/Android shell with push when agent needs you.</td><td>🔵 v0.3</td></tr>
        </tbody>
      </table>

      {/* PRICING */}
      <h2 id="pricing">
        <span className="anchor">##</span>
        Pricing
      </h2>

      <table>
        <thead>
          <tr>
            <th></th>
            <th><code>self-hosted</code></th>
            <th><code>hosted</code> ⭐</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Cost</td><td><b>$0 / forever</b></td><td><b>$5 / month</b></td></tr>
          <tr><td>Devices</td><td>unlimited</td><td>unlimited</td></tr>
          <tr><td>Messages</td><td>unlimited</td><td>unlimited</td></tr>
          <tr><td>SSL & TLS</td><td>you handle it</td><td>included</td></tr>
          <tr><td>Updates</td><td><code>git pull</code></td><td>auto</td></tr>
          <tr><td>Uptime SLO</td><td>your server, your call</td><td>99.9%</td></tr>
          <tr><td>Support</td><td>GitHub issues</td><td>email · 24h</td></tr>
        </tbody>
      </table>

      <p style={{ color: 'var(--muted)', fontSize: 14 }}>
        Either way, you bring your own AI subscription (Claude Pro / Max / API key).
        We don&rsquo;t resell access — that&rsquo;s your contract with Anthropic.
      </p>

      {/* FAQ */}
      <h2 id="faq">
        <span className="anchor">##</span>
        FAQ
      </h2>

      <h4>Is this safe? You&rsquo;re running on my servers.</h4>
      <p>
        The whole codebase is MIT and on GitHub — inspect every line. The agent
        we install on your machine is a single Node script that talks to the
        master over WebSocket. It never reads your <code>~/.claude/</code>{' '}
        directory or touches your OAuth tokens.
      </p>

      <h4>Which AI tools are supported?</h4>
      <p>
        <code>claude</code> (Anthropic) ships today. <code>aider</code>,{' '}
        <code>gemini</code>, <code>codex</code>, and <code>cursor-agent</code>{' '}
        are next. If a tool runs in a terminal and speaks streaming JSON, we can wire it up.
      </p>

      <h4>Can I use one Claude Pro subscription on multiple devices?</h4>
      <p>
        Yes. Each device runs its own <code>claude</code> CLI bound to your account.
        Anthropic&rsquo;s rate limits still apply per subscription, but you do get to
        start a task on the VPS and finish it on the laptop without re-authenticating.
      </p>

      <h4>What if my server goes down?</h4>
      <p>
        That device shows up offline. Your other devices keep working. Conversations
        stay on whichever machine ran them — they come back when the device comes back.
      </p>

      <h4>How is this different from Cursor / Replit / Codespaces?</h4>
      <p>
        They sell you compute — their VMs, their bill. We sell you a remote control.
        You already have a laptop, a home server, a $4/mo VPS: <code>autmzr/command</code>{' '}
        turns them into your distributed AI workstation.
      </p>

      <h4>When is the mobile app coming?</h4>
      <p>
        The web app is mobile-first by design. Add to home screen and it behaves
        like a native app. A real iOS / Android shell with push notifications
        is on v0.3.
      </p>

      {/* LICENSE */}
      <h2 id="license">
        <span className="anchor">##</span>
        License
      </h2>

      <p>
        MIT © 2026 Autmzr. <a href="https://github.com/autmzr/autmzr-command/blob/main/LICENSE">LICENSE</a>.
      </p>

      <p style={{ color: 'var(--muted)', fontSize: 14 }}>
        Part of the Autmzr family — automation tools for builders.
      </p>

      <hr />

      <div className="rm-footer">
        <span>Last edited 2 minutes ago by autmzr-bot · v0.1.0</span>
        <span>
          <a href="https://github.com/autmzr/autmzr-command/blob/main/README.md">edit on GitHub</a>
        </span>
      </div>
    </article>
  );
}
