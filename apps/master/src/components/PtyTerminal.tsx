'use client';

/**
 * PtyTerminal — настоящий интерактивный терминал на xterm.js.
 *
 * Связь: WebSocket /ws/pty?device=X&cwd=Y&cols=C&rows=R.
 * Master проксирует байты к агенту (node-pty → bash -il).
 * Каждый таб = одна живая сессия. При закрытии таба shell убивается.
 */

import { useEffect, useRef, useState } from 'react';
import type { Terminal as XTerm } from '@xterm/xterm';
import type { FitAddon as FitAddonT } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface Props {
  deviceId: string;
  deviceName: string;
  cwd?: string;
  /** Показывать мобильный бар с Ctrl/Esc/Tab/стрелками. Если undefined — авто по ширине. */
  mobileBar?: boolean;
  onExit?: () => void;
}

type Status = 'connecting' | 'ready' | 'error' | 'closed';

export default function PtyTerminal({ deviceId, deviceName, cwd, mobileBar, onExit }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<XTerm | null>(null);
  const fitRef = useRef<FitAddonT | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<Status>('connecting');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [ctrlArmed, setCtrlArmed] = useState(false); // «sticky» Ctrl — следующая клавиша с Ctrl

  // Mobile-detect по ширине, если не задано явно.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const showMobileBar = mobileBar ?? isMobile;

  useEffect(() => {
    let destroyed = false;
    let term: XTerm | null = null;
    let fit: FitAddonT | null = null;
    let ws: WebSocket | null = null;
    let resizeObs: ResizeObserver | null = null;

    (async () => {
      // Динамический импорт — xterm только на клиенте
      const [{ Terminal }, { FitAddon }, { WebLinksAddon }] = await Promise.all([
        import('@xterm/xterm'),
        import('@xterm/addon-fit'),
        import('@xterm/addon-web-links'),
      ]);
      if (destroyed) return;

      term = new Terminal({
        fontFamily: 'JetBrainsMono-Regular, "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace',
        fontSize: 13,
        lineHeight: 1.2,
        cursorBlink: true,
        allowTransparency: false,
        scrollback: 2000,
        theme: {
          background: '#0a0a0a',
          foreground: '#e5e7eb',
          cursor: '#d4d4aa',
          cursorAccent: '#0a0a0a',
          selectionBackground: '#3c3a2a',
          black: '#1a1a1a', red: '#f87171', green: '#86efac', yellow: '#fde047',
          blue: '#93c5fd', magenta: '#f0abfc', cyan: '#67e8f9', white: '#e5e7eb',
          brightBlack: '#6b7280', brightRed: '#fca5a5', brightGreen: '#bbf7d0',
          brightYellow: '#fef08a', brightBlue: '#bfdbfe', brightMagenta: '#f5d0fe',
          brightCyan: '#a5f3fc', brightWhite: '#f9fafb',
        },
      });
      fit = new FitAddon();
      term.loadAddon(fit);
      term.loadAddon(new WebLinksAddon());

      if (!hostRef.current) return;
      term.open(hostRef.current);
      try { fit.fit(); } catch {}

      termRef.current = term;
      fitRef.current = fit;

      // Коннект WS
      const cols = term.cols || 80;
      const rows = term.rows || 24;
      const qs = new URLSearchParams();
      qs.set('device', deviceId);
      if (cwd) qs.set('cwd', cwd);
      qs.set('cols', String(cols));
      qs.set('rows', String(rows));
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${proto}//${window.location.host}/ws/pty?${qs.toString()}`);
      wsRef.current = ws;

      ws.onopen = () => {
        // Heartbeat — раз в 45s шлём ws-ping. Нужно чтобы nginx (proxy_read_timeout 300s)
        // не рвал тихий коннект (когда пользователь открыл терминал и не трогает).
        const pingTimer = setInterval(() => {
          if (!ws || ws.readyState !== WebSocket.OPEN) { clearInterval(pingTimer); return; }
          try { ws.send(JSON.stringify({ type: '__ping' })); } catch {}
        }, 45_000);
        // Stash для очистки при destroy
        (ws as any).__pingTimer = pingTimer;
      };

      ws.onmessage = (ev) => {
        if (destroyed) return;
        try {
          const m = JSON.parse(ev.data);
          if (m.type === 'pty.opened') {
            setStatus('ready');
            term!.focus();
          } else if (m.type === 'pty.data') {
            const raw = atob(m.data);
            // byte-safe UTF-8 decode
            const bytes = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
            term!.write(new TextDecoder('utf-8').decode(bytes));
          } else if (m.type === 'pty.exit') {
            setStatus('closed');
            term!.write(`\r\n\x1b[90m[процесс завершён, код=${m.code}]\x1b[0m\r\n`);
          } else if (m.type === 'pty.error') {
            setStatus('error');
            setErrorMsg(m.message || 'ошибка');
            if (m.code === 'missing_node_pty') {
              term!.write(
                '\r\n\x1b[31m✗ node-pty не установлен на устройстве\x1b[0m\r\n' +
                '\x1b[90mНа сервере выполни:\x1b[0m\r\n' +
                '  \x1b[33msudo npm install -g node-pty\x1b[0m\r\n' +
                '\x1b[90mпотом перезапусти агент: systemctl restart pocket-claude-agent\x1b[0m\r\n',
              );
            } else {
              term!.write(`\r\n\x1b[31m✗ ${m.message}\x1b[0m\r\n`);
            }
          }
        } catch {}
      };

      ws.onclose = () => {
        if (destroyed) return;
        setStatus((s) => s === 'error' ? s : 'closed');
      };

      ws.onerror = () => {
        if (destroyed) return;
        setStatus('error');
        setErrorMsg('не удалось подключиться');
      };

      // Ввод пользователя → base64 → в WS
      term.onData((data) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'pty.data', data: btoa(unescape(encodeURIComponent(data))) }));
        }
      });

      // Отправка resize на сервер когда terminal меняет размер
      let lastSize = `${term.cols}x${term.rows}`;
      term.onResize(({ cols, rows }) => {
        const key = `${cols}x${rows}`;
        if (key === lastSize) return;
        lastSize = key;
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'pty.resize', cols, rows }));
        }
      });

      // Подгоняем terminal к размеру контейнера
      const doFit = () => {
        if (!fit || !term) return;
        try { fit.fit(); } catch {}
      };
      resizeObs = new ResizeObserver(doFit);
      if (hostRef.current) resizeObs.observe(hostRef.current);
      window.addEventListener('resize', doFit);
    })();

    return () => {
      destroyed = true;
      try { resizeObs?.disconnect(); } catch {}
      try {
        const t = (ws as any)?.__pingTimer;
        if (t) clearInterval(t);
      } catch {}
      try { ws?.close(); } catch {}
      try { term?.dispose(); } catch {}
      termRef.current = null;
      fitRef.current = null;
      wsRef.current = null;
    };
  }, [deviceId, cwd]);

  // Уведомление наружу когда сессия закрылась (для UI, например переход назад).
  useEffect(() => {
    if ((status === 'closed' || status === 'error') && onExit) {
      const t = setTimeout(onExit, 800);
      return () => clearTimeout(t);
    }
  }, [status, onExit]);

  function sendKey(data: string): void {
    const term = termRef.current;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'pty.data', data: btoa(unescape(encodeURIComponent(data))) }));
    term?.focus();
  }

  function sendCtrl(letter: string): void {
    // Ctrl+A = \x01, Ctrl+B = \x02, ..., Ctrl+Z = \x1a, Ctrl+C = \x03
    const code = letter.toUpperCase().charCodeAt(0) - 64;
    if (code >= 1 && code <= 26) sendKey(String.fromCharCode(code));
    setCtrlArmed(false);
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#0a0a0a', color: '#e5e7eb' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 shrink-0"
        style={{ borderBottom: '1px solid #1a1a1a', background: '#080808' }}>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: '#6b7280' }}>
          pty · {deviceName}
        </span>
        <span className="font-mono text-[10.5px]" style={{ color: '#4b5563' }}>·</span>
        <span className="font-mono text-[10.5px]" style={{
          color: status === 'ready' ? '#10b981' : status === 'connecting' ? '#fbbf24' : '#f87171',
        }}>
          ● {status === 'ready' ? 'connected' : status === 'connecting' ? 'connecting…'
              : status === 'error' ? 'error' : 'closed'}
        </span>
        <div className="flex-1" />
        {status === 'ready' && (
          <button type="button" onClick={() => sendKey('\x03')}
            title="Прервать выполняющуюся команду (Ctrl+C)"
            className="font-mono text-[11px] px-2 py-1 rounded hover:bg-[#1a1a1a]"
            style={{ color: '#fca5a5', border: '1px solid #262626' }}>
            Ctrl+C
          </button>
        )}
      </div>

      {/* Xterm host */}
      <div ref={hostRef} className="flex-1 min-h-0 overflow-hidden"
        style={{ padding: '6px 8px 0 8px', background: '#0a0a0a' }} />

      {/* Mobile keyboard bar */}
      {showMobileBar && (
        <div className="flex gap-1 px-2 py-1.5 overflow-x-auto shrink-0"
          style={{ borderTop: '1px solid #262626', background: '#080808' }}>
          <KeyBtn label="Esc" onClick={() => sendKey('\x1b')} />
          <KeyBtn label="Tab" onClick={() => sendKey('\t')} />
          <KeyBtn label="Ctrl" active={ctrlArmed} onClick={() => setCtrlArmed(v => !v)}
            title="Следующая клавиша будет с Ctrl" />
          {ctrlArmed ? (
            <>
              <KeyBtn label="C" onClick={() => sendCtrl('C')} />
              <KeyBtn label="D" onClick={() => sendCtrl('D')} />
              <KeyBtn label="Z" onClick={() => sendCtrl('Z')} />
              <KeyBtn label="L" onClick={() => sendCtrl('L')} />
              <KeyBtn label="R" onClick={() => sendCtrl('R')} />
              <KeyBtn label="A" onClick={() => sendCtrl('A')} />
              <KeyBtn label="E" onClick={() => sendCtrl('E')} />
              <KeyBtn label="W" onClick={() => sendCtrl('W')} />
              <KeyBtn label="U" onClick={() => sendCtrl('U')} />
            </>
          ) : (
            <>
              <KeyBtn label="↑" onClick={() => sendKey('\x1b[A')} />
              <KeyBtn label="↓" onClick={() => sendKey('\x1b[B')} />
              <KeyBtn label="←" onClick={() => sendKey('\x1b[D')} />
              <KeyBtn label="→" onClick={() => sendKey('\x1b[C')} />
              {/* exit(q) — единая кнопка выхода из TUI (htop/top/less/man/tig/psql и т.д.).
                  Для vim есть отдельная кнопка :q (Esc → :q → Enter). */}
              <KeyBtn label="exit(q)" onClick={() => sendKey('q')}
                title="Выйти из htop/less/man/top/tig/psql" />
              <KeyBtn label=":q" onClick={() => sendKey('\x1b:q\r')}
                title="Выйти из vim (Esc :q ⏎)" />
              <KeyBtn label="|" onClick={() => sendKey('|')} />
              <KeyBtn label="/" onClick={() => sendKey('/')} />
              <KeyBtn label="~" onClick={() => sendKey('~')} />
              <KeyBtn label="-" onClick={() => sendKey('-')} />
            </>
          )}
        </div>
      )}

      {status === 'error' && errorMsg && (
        <div className="px-3 py-1.5 text-[11.5px] font-mono shrink-0"
          style={{ background: '#1a0a0a', color: '#fca5a5', borderTop: '1px solid #262626' }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
}

function KeyBtn({ label, onClick, active, title }: {
  label: string; onClick: () => void; active?: boolean; title?: string;
}) {
  return (
    <button type="button" onClick={onClick} title={title}
      className="shrink-0 h-9 min-w-[40px] px-2.5 rounded-md font-mono text-[14px] font-semibold"
      style={{
        background: active ? '#d4d4aa' : '#1a1a1a',
        color: active ? '#0a0a0a' : '#d4d4aa',
        border: `1px solid ${active ? '#d4d4aa' : '#262626'}`,
      }}>
      {label}
    </button>
  );
}
