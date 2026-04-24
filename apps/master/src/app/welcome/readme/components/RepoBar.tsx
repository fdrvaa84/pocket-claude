'use client';

import { Star, GitFork, Eye } from 'lucide-react';

export default function RepoBar() {
  return (
    <div className="rm-repobar">
      <div className="rm-repobar-inner">
        <div className="rm-repopath">
          <span style={{ opacity: 0.6 }}>📦</span>
          <span className="org">autmzr</span>
          <span style={{ opacity: 0.4 }}>/</span>
          <span className="name">command</span>
          <span className="branch">main</span>
        </div>
        <div className="rm-repobar-actions">
          <a
            className="rm-pill"
            href="https://github.com/autmzr/autmzr-command"
            target="_blank"
            rel="noreferrer"
          >
            <Eye size={13} strokeWidth={1.6} />
            Watch <span className="count">42</span>
          </a>
          <a
            className="rm-pill"
            href="https://github.com/autmzr/autmzr-command/fork"
            target="_blank"
            rel="noreferrer"
          >
            <GitFork size={13} strokeWidth={1.6} />
            Fork <span className="count">87</span>
          </a>
          <a
            className="rm-pill primary"
            href="https://github.com/autmzr/autmzr-command"
            target="_blank"
            rel="noreferrer"
          >
            <Star size={13} strokeWidth={1.6} />
            Star <span className="count">1.2k</span>
          </a>
        </div>
      </div>
    </div>
  );
}
