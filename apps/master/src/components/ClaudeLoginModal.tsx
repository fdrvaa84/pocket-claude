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
      <div className="w-full max-w-2xl h-[80dvh] rounded-2xl flex flex-col overflow-hidden"
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

        {/* Подсказка сверху — пошагово, с явным упоминанием кнопки Paste */}
        <div className="px-5 py-3 shrink-0 text-[12.5px] leading-relaxed"
          style={{ background: 'var(--accent-light)', borderBottom: '1px solid var(--border)', color: 'var(--fg)' }}>
          <b className="block mb-1.5">Как залогиниться:</b>
          <ol className="list-decimal list-inside space-y-0.5 text-[12px]">
            <li>Подожди пока в терминале ниже появится <b>URL</b> (строка
              вида <code className="font-mono text-[11px]" style={{ color: 'var(--accent)' }}>
                https://console.anthropic.com/…?code=…
              </code>).</li>
            <li>Сделай <b>long-press на URL</b> → «Скопировать ссылку» → тапни ссылку → Safari откроет claude.ai.</li>
            <li>Залогинься, скопируй выданный <b>код авторизации</b>.</li>
            <li>Вернись сюда, нажми <b>«📋 Paste»</b> в правом верхнем углу терминала.
              Откроется поле — сделай long-press → «Вставить» → жми «Вставить ↵».</li>
            <li>В терминале теперь код + автоматический Enter. Увидишь <code className="font-mono">✓ Authenticated</code>.</li>
          </ol>
        </div>

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
