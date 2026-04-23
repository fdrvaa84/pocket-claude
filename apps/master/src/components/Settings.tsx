'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DeviceBrowser from './DeviceBrowser';
import { effectiveIntent, type DeviceIntent } from '@/lib/device-intent';

const ClaudeInstallModal = dynamic(() => import('./ClaudeInstallModal'), { ssr: false, loading: () => null });
const ClaudeLoginModal = dynamic(() => import('./ClaudeLoginModal'), { ssr: false, loading: () => null });

interface User { id: string; email: string; name: string | null }
interface Device {
  id: string; name: string; kind: string; hostname: string | null;
  os?: string | null; arch?: string | null; online: boolean; claude_logged_in: boolean | null;
  claude_installed?: boolean | null;
  claude_version?: string | null;
  last_online: string | null; root_path: string | null;
  intent?: DeviceIntent | null;
}

const THEMES = ['soft', 'light', 'dark'] as const;

export default function Settings({ user, devices, theme, onThemeChange, onAddDevice, onReload, onClose, onCreateProject }: {
  user: User;
  devices: Device[];
  theme: typeof THEMES[number];
  onThemeChange: (t: typeof THEMES[number]) => void;
  onAddDevice: () => void;
  onReload: () => void;
  onClose: () => void;
  onCreateProject?: (deviceId: string, path: string) => void;
}) {
  const [browseDevice, setBrowseDevice] = useState<Device | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editRootFor, setEditRootFor] = useState<Device | null>(null);
  const [installFor, setInstallFor] = useState<Device | null>(null);
  const [loginFor, setLoginFor] = useState<Device | null>(null);

  async function deleteDevice(id: string) {
    if (!confirm('Отключить устройство? Агент потеряет токен.')) return;
    await fetch('/api/devices', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    onReload();
  }

  async function setRoot(deviceId: string, path: string | null) {
    await fetch('/api/devices', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deviceId, root_path: path }),
    });
    onReload();
  }

  async function setIntent(deviceId: string, intent: DeviceIntent) {
    await fetch('/api/devices', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deviceId, intent }),
    });
    onReload();
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' });
    location.reload();
  }

  const claudeDevs = devices.filter(d => effectiveIntent(d) === 'claude');
  const fsDevs = devices.filter(d => effectiveIntent(d) === 'fs-only');

  function renderDevice(d: Device, role: 'claude' | 'fs-only') {
    const icon = role === 'claude' ? '🤖' : '📂';
    const intentLabel =
      d.intent === 'claude' ? 'intent=claude (явно)' :
      d.intent === 'fs-only' ? 'intent=fs-only (явно)' :
      role === 'claude' ? 'intent=auto · claude найден' :
      'intent=auto · claude не найден';

    return (
      <div key={d.id} className="rounded-xl mb-2 overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent-light)', fontSize: 18 }}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium flex items-center gap-2">
              {d.name}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: d.online ? 'var(--ok)' : 'var(--danger)', color: '#fff' }}>
                {d.online ? 'онлайн' : 'оффлайн'}
              </span>
            </div>
            <div className="text-[11px] font-mono truncate" style={{ color: 'var(--muted)' }}>
              {d.hostname || d.id.slice(0, 8)}{d.os ? ` · ${d.os}/${d.arch}` : ''} · {intentLabel}
            </div>
            {/* Claude-статус: installed + logged_in. Кнопки «Установить» / «Войти» */}
            {role === 'claude' && d.online && (() => {
              const installed = d.claude_installed === true;
              const legacyKnown = d.claude_installed == null; // старый agent не репортил installed
              const loggedIn = d.claude_logged_in === true;
              if (installed && loggedIn) {
                return (
                  <div className="text-[11px] flex items-center gap-1" style={{ color: 'var(--ok)' }}>
                    ✓ Claude {d.claude_version ? `v${d.claude_version}` : ''} · авторизован
                  </div>
                );
              }
              if (installed && !loggedIn) {
                return (
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[11px]" style={{ color: 'var(--warn)' }}>
                      ⚠ Claude {d.claude_version ? `v${d.claude_version}` : ''} · не авторизован
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); setLoginFor(d); }}
                      className="text-[10.5px] px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                      🔐 Войти
                    </button>
                  </div>
                );
              }
              if (d.claude_installed === false) {
                return (
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[11px]" style={{ color: 'var(--danger)' }}>
                      ❌ Claude не установлен
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); setInstallFor(d); }}
                      className="text-[10.5px] px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                      📥 Установить
                    </button>
                  </div>
                );
              }
              // legacyKnown: старый агент только сказал logged_in=false — не знаем installed ли
              if (legacyKnown && !loggedIn) {
                return (
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[11px]" style={{ color: 'var(--warn)' }}>
                      ⚠ нет `claude login` (статус установки неизвестен)
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); setLoginFor(d); }}
                      className="text-[10.5px] px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                      🔐 Войти
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setInstallFor(d); }}
                      className="text-[10.5px] px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      📥 Установить
                    </button>
                  </div>
                );
              }
              return null;
            })()}
            {d.root_path && (
              <div className="text-[11px] font-mono truncate mt-0.5" style={{ color: 'var(--muted)' }}>
                корень: {d.root_path}
              </div>
            )}
          </div>
          <button onClick={() => setOpenMenuId(openMenuId === d.id ? null : d.id)}
            className="p-1.5 text-base" style={{ color: 'var(--muted)' }}>⋯</button>
        </div>

        {openMenuId === d.id && (
          <div className="flex flex-wrap gap-1.5 px-3 pb-3" style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <button disabled={!d.online} onClick={() => { setBrowseDevice(d); setOpenMenuId(null); }}
              className="text-xs px-3 py-1.5 rounded-full disabled:opacity-40"
              style={{ background: 'var(--accent-light)' }}>📁 Файлы</button>
            <button onClick={() => { setEditRootFor(d); setOpenMenuId(null); }}
              disabled={!d.online}
              className="text-xs px-3 py-1.5 rounded-full disabled:opacity-40"
              style={{ background: 'var(--accent-light)' }}>📌 Корень проектов</button>
            {role === 'claude' ? (
              <button onClick={() => { setIntent(d.id, 'fs-only'); setOpenMenuId(null); }}
                className="text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'var(--accent-light)' }}>📂 Сделать files-only</button>
            ) : (
              <button onClick={() => { setIntent(d.id, 'claude'); setOpenMenuId(null); }}
                className="text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'var(--accent-light)' }}>🤖 Сделать claude</button>
            )}
            {d.intent !== 'auto' && (
              <button onClick={() => { setIntent(d.id, 'auto'); setOpenMenuId(null); }}
                className="text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'var(--accent-light)' }} title="Определять по claude_logged_in">↻ auto</button>
            )}
            <button onClick={() => deleteDevice(d.id)}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'var(--accent-light)', color: 'var(--danger)' }}>🔌 Отключить</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-xl max-h-[85dvh] rounded-2xl flex flex-col overflow-hidden"
        style={{ background: 'var(--surface)', boxShadow: '0 8px 24px rgba(0,0,0,.15)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-base font-semibold">Settings</h2>
          <button onClick={onClose} className="text-xl" style={{ color: 'var(--muted)' }}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Devices */}
          <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Устройства</div>
              <button onClick={onAddDevice} className="text-xs px-3 py-1 rounded-full"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}>+ Подключить новое</button>
            </div>

            {devices.length === 0 && (
              <div className="text-xs text-center py-6" style={{ color: 'var(--muted)' }}>
                Ни одного устройства. Нажми «Подключить новое» и запусти команду на сервере или компе.
              </div>
            )}

            {claudeDevs.length > 0 && (
              <>
                <div className="text-[10px] font-mono uppercase tracking-wider mb-1.5 mt-1 px-1" style={{ color: 'var(--muted)' }}>
                  🤖 claude
                </div>
                {claudeDevs.map(d => renderDevice(d, 'claude'))}
              </>
            )}

            {fsDevs.length > 0 && (
              <>
                <div className="text-[10px] font-mono uppercase tracking-wider mb-1.5 mt-3 px-1" style={{ color: 'var(--muted)' }}>
                  📂 files
                </div>
                {fsDevs.map(d => renderDevice(d, 'fs-only'))}
              </>
            )}
          </div>

          {/* Browser для "Файлы" */}
          {browseDevice && (
            <DeviceBrowser
              deviceId={browseDevice.id}
              deviceName={browseDevice.name}
              initialPath={browseDevice.root_path || null}
              onClose={() => setBrowseDevice(null)}
              onPick={(path) => {
                onCreateProject?.(browseDevice.id, path);
                setBrowseDevice(null);
                onClose();
              }}
            />
          )}

          {/* Browser для "Корень проектов" */}
          {editRootFor && (
            <DeviceBrowser
              deviceId={editRootFor.id}
              deviceName={`${editRootFor.name} · выбор корня`}
              initialPath={editRootFor.root_path || null}
              onClose={() => setEditRootFor(null)}
              onPick={async (path) => {
                await setRoot(editRootFor.id, path);
                setEditRootFor(null);
              }}
            />
          )}

          {/* Theme */}
          <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>Тема</div>
            <div className="flex gap-2">
              {THEMES.map(t => (
                <button key={t} onClick={() => onThemeChange(t)}
                  className="px-3 py-1 rounded-full text-xs"
                  style={{
                    background: theme === t ? 'var(--accent)' : 'var(--accent-light)',
                    color: theme === t ? 'var(--bg)' : 'var(--fg)',
                  }}>{t}</button>
              ))}
            </div>
          </div>

          {/* Account */}
          <div className="p-5">
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>Аккаунт</div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}>{(user.name || user.email)[0].toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">{user.name || '—'}</div>
                <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{user.email}</div>
              </div>
              <button onClick={logout} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'var(--accent-light)' }}>Выйти</button>
            </div>
          </div>
        </div>
      </div>

      {/* Claude install / login modals */}
      {installFor && (
        <ClaudeInstallModal
          deviceId={installFor.id}
          deviceName={installFor.name}
          onClose={() => { setInstallFor(null); onReload(); }}
          onInstalled={() => onReload()}
        />
      )}
      {loginFor && (
        <ClaudeLoginModal
          deviceId={loginFor.id}
          deviceName={loginFor.name}
          onClose={() => { setLoginFor(null); onReload(); }}
        />
      )}
    </div>
  );
}
