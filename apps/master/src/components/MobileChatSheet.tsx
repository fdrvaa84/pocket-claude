'use client';

/**
 * Bottom sheet для мобильного композера — всё что раньше было в двух popover-pills
 * (mode / model / effort) и двух mobile-tab-bar кнопках (files / terminal) собрано в одну шторку.
 * Открывается тапом по [+] рядом с textarea или по pill «Sonnet 4.6 · Bypass» под композером.
 */
import { useEffect } from 'react';
import { MODELS, MODES, EFFORTS, type ModelValue, type EffortValue, type ModeValue } from './Controls';

interface Props {
  open: boolean;
  onClose: () => void;
  mode: ModeValue;
  onModeChange: (m: ModeValue) => void;
  model: ModelValue;
  onModelChange: (m: ModelValue) => void;
  effort: EffortValue;
  onEffortChange: (e: EffortValue) => void;
  onOpenFiles?: () => void;
  onOpenTerminal?: () => void;
  onOpenSlashHelp?: () => void;
}

export default function MobileChatSheet({
  open, onClose,
  mode, onModeChange,
  model, onModelChange,
  effort, onEffortChange,
  onOpenFiles, onOpenTerminal, onOpenSlashHelp,
}: Props) {
  // Блокируем прокрутку body пока шторка открыта.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Esc закрывает.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-200"
        style={{
          background: 'rgba(0,0,0,.42)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onClose}
      />
      {/* sheet */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 rounded-t-[22px] overflow-y-auto"
        style={{
          background: 'var(--bg)',
          boxShadow: '0 -10px 40px rgba(0,0,0,.18)',
          maxHeight: '82vh',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform .28s cubic-bezier(.22,1,.36,1)',
          paddingBottom: 'calc(22px + env(safe-area-inset-bottom))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4">
          <div className="w-11 h-1 rounded-full mx-auto my-2" style={{ background: 'var(--border-strong)' }} />
          <h2 className="text-[17px] font-semibold">Настройки чата</h2>
          <p className="text-[12.5px]" style={{ color: 'var(--muted)' }}>Применяются ко всем сообщениям этой сессии</p>

          {/* Mode */}
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] pt-4 pb-2 px-1"
            style={{ color: 'var(--muted)' }}>Режим</div>
          <div className="flex gap-2 flex-wrap">
            {MODES.filter(m => !m.disabled).map(m => {
              const isBypass = m.value === 'bypassPermissions';
              const on = mode === m.value;
              return (
                <button key={m.value} type="button"
                  onClick={() => onModeChange(m.value)}
                  className="px-3.5 py-2 rounded-full text-[14px] font-medium"
                  style={{
                    background: on ? (isBypass ? '#f5c94c' : 'var(--accent)') : 'var(--surface)',
                    color: on ? (isBypass ? '#2a2620' : 'var(--bg)') : 'var(--fg-2)',
                    border: `1px solid ${on ? (isBypass ? '#e6b63a' : 'var(--accent)') : 'var(--border)'}`,
                  }}>
                  {isBypass ? '⚡ Bypass' : m.label.replace(/ permissions| mode/i, '').trim()}
                </button>
              );
            })}
          </div>

          {/* Model */}
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] pt-5 pb-2 px-1"
            style={{ color: 'var(--muted)' }}>Модель</div>
          <div className="rounded-[14px] overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {MODELS.map((m, i) => {
              const on = model === m.value;
              return (
                <button key={m.value} type="button"
                  onClick={() => onModelChange(m.value)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-[15px]"
                  style={{ borderBottom: i < MODELS.length - 1 ? '1px solid var(--border)' : '0' }}>
                  <span className="w-6 text-center text-[16px] opacity-85">◈</span>
                  <span className="flex-1">
                    {m.label}
                    {m.badge && (
                      <span className="ml-1.5 font-mono text-[11px] px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                        {m.badge}
                      </span>
                    )}
                  </span>
                  {on && <span className="font-semibold" style={{ color: 'var(--accent)' }}>✓</span>}
                </button>
              );
            })}
          </div>

          {/* Effort */}
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] pt-5 pb-2 px-1"
            style={{ color: 'var(--muted)' }}>Effort</div>
          <div className="flex gap-2 flex-wrap">
            {EFFORTS.map(e => {
              const on = effort === e.value;
              return (
                <button key={e.value} type="button"
                  onClick={() => onEffortChange(e.value)}
                  className="px-3.5 py-2 rounded-full text-[14px] font-medium"
                  style={{
                    background: on ? 'var(--accent)' : 'var(--surface)',
                    color: on ? 'var(--bg)' : 'var(--fg-2)',
                    border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                  }}>
                  {e.label.toLowerCase()}
                </button>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] pt-5 pb-2 px-1"
            style={{ color: 'var(--muted)' }}>Быстрые действия</div>
          <div className="rounded-[14px] overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {[
              { ic: '📁', title: 'Файлы устройства', right: '⌘F', onClick: onOpenFiles },
              { ic: '>_', title: 'Terminal',          right: '⌘T', onClick: onOpenTerminal },
              { ic: '/',  title: 'Все slash-команды',              onClick: onOpenSlashHelp },
              { ic: '📎', title: 'Прикрепить файл',  right: 'soon', disabled: true },
            ].map((a, i, arr) => (
              <button key={i} type="button"
                disabled={a.disabled}
                onClick={() => { if (!a.disabled && a.onClick) { a.onClick(); onClose(); } }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-[15px] disabled:opacity-50"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : '0' }}>
                <span className="w-6 text-center font-mono opacity-85">{a.ic}</span>
                <span className="flex-1">{a.title}</span>
                {a.right && (
                  <span className="font-mono text-[11.5px]" style={{ color: 'var(--muted)' }}>{a.right}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
