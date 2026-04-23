'use client';

/**
 * Модалка логина в Claude Code на устройстве.
 * Открывает PTY и сразу запускает `claude auth login`. Claude выдаст ссылку
 * типа https://claude.ai/login?code=... — юзер её тапает, логинится в браузере,
 * получает код, копирует обратно в терминал и жмёт Enter.
 *
 * Это интерактивный flow — PTY необходим. Если node-pty на устройстве нет,
 * PtyTerminal сам покажет инструкцию поставить.
 */
import dynamic from 'next/dynamic';

const PtyTerminal = dynamic(() => import('./PtyTerminal'), { ssr: false, loading: () => null });

interface Props {
  deviceId: string;
  deviceName: string;
  onClose: () => void;
}

export default function ClaudeLoginModal({ deviceId, deviceName, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-2xl h-[92dvh] md:h-[80dvh] rounded-2xl flex flex-col overflow-hidden"
        style={{ background: 'var(--surface)', boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 className="text-base font-semibold">Войти в Claude</h3>
            <div className="text-[11.5px]" style={{ color: 'var(--muted)' }}>
              на устройстве <b>{deviceName}</b>
            </div>
          </div>
          <button onClick={onClose} className="text-xl" style={{ color: 'var(--muted)' }}>×</button>
        </div>

        {/* Подсказка сверху — по умолчанию свёрнута, не съедает место. */}
        <details className="shrink-0"
          style={{ background: 'var(--accent-light)', borderBottom: '1px solid var(--border)', color: 'var(--fg)' }}>
          <summary className="px-4 py-2 text-[12.5px] cursor-pointer flex items-center justify-between"
            style={{ listStyle: 'none' }}>
            <span>❓ <b>Как залогиниться</b> <span style={{ color: 'var(--muted)' }}>— инструкция</span></span>
            <span className="text-[11px]" style={{ color: 'var(--muted)' }}>развернуть ▾</span>
          </summary>
          <ol className="list-decimal list-inside space-y-1 text-[12px] px-4 pb-3 pt-1 leading-snug">
            <li>В терминале появится <b>URL</b> <code className="font-mono text-[10.5px]" style={{ color: 'var(--accent)' }}>https://…?code=…</code>
              — long-press → «Скопировать» → тап → Safari.</li>
            <li>Залогинься, claude.ai выдаст <b>короткий код</b> (8-10 символов). Скопируй <b>именно код</b>, не URL.</li>
            <li>Вернись, нажми <b>📋 Paste</b> сверху-справа. Вставь код в поле → «Вставить ↵».</li>
            <li>Увидишь <code className="font-mono">✓ Authenticated</code>.</li>
          </ol>
        </details>

        {/* PTY со сразу-заряженной командой */}
        <div className="flex-1 min-h-0">
          <PtyTerminal
            deviceId={deviceId}
            deviceName={deviceName}
            initialCommand="claude auth login"
            onExit={onClose}
          />
        </div>
      </div>
    </div>
  );
}
