'use client';

const ITEMS = [
  { id: 'autmzr-command', label: '# autmzr/command' },
  { id: 'why', label: '## Why' },
  { id: 'install', label: '## Install' },
  { id: 'usage', label: '## Usage' },
  { id: 'features', label: '## Features' },
  { id: 'pricing', label: '## Pricing' },
  { id: 'faq', label: '## FAQ' },
  { id: 'license', label: '## License' },
];

export default function TOC() {
  return (
    <aside className="rm-toc" aria-label="On this page">
      <div className="rm-toc-title">On this page</div>
      <ul>
        {ITEMS.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`}>{it.label}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
