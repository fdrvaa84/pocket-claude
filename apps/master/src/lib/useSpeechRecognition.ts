'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook поверх Web Speech API (SpeechRecognition).
 *
 * Доступность:
 *   - iOS Safari 14.5+, Chrome, Edge, Opera, Samsung Internet — работает
 *   - Firefox — нет (на 2026 год пока без поддержки)
 *   - Требуется HTTPS (на проде у нас есть)
 *
 * Возвращает живую транскрипцию по мере произнесения (interim + final),
 * приклеивает финальный текст к существующему content (composer textarea),
 * пока юзер говорит.
 *
 * Использование:
 *   const sr = useSpeechRecognition({
 *     lang: 'ru-RU',
 *     onTranscript: (text, isFinal) => setInput(prev => /\* ... *\/),
 *   });
 *   <button onClick={sr.toggle}>{sr.listening ? '⏹' : '🎤'}</button>
 */

// Минимальные типы — у TS нет встроенных для SpeechRecognition.
type SR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: SRError) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};
interface SREvent {
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string; confidence: number };
    length: number;
  }>;
  resultIndex: number;
}
interface SRError { error: string; message?: string }

interface SRWindow extends Window {
  SpeechRecognition?: new () => SR;
  webkitSpeechRecognition?: new () => SR;
}

export interface UseSpeechRecognitionOpts {
  /** Язык распознавания. Default: navigator.language или 'ru-RU' */
  lang?: string;
  /**
   * Колбэк на каждое обновление транскрипта.
   * @param text         Полный текст распознанного с момента старта
   * @param isFinal      true когда движок зафиксировал отрезок
   */
  onTranscript?: (text: string, isFinal: boolean) => void;
  /** Auto-stop после N мс молчания. Default: 0 (не стопаем сами) */
  silenceTimeoutMs?: number;
}

export interface UseSpeechRecognitionResult {
  /** Поддерживает ли браузер вообще */
  supported: boolean;
  /** Активна ли запись прямо сейчас */
  listening: boolean;
  /** Последняя ошибка (если была) */
  error: string | null;
  /** Текущий полный распознанный текст */
  transcript: string;
  /** Старт записи. Вызовет permission-prompt в первый раз. */
  start: () => Promise<void>;
  /** Стоп записи. Финальный onTranscript будет с isFinal=true. */
  stop: () => void;
  /** Toggle: start если стоп, stop если идёт. */
  toggle: () => Promise<void>;
  /** Очистить накопленный transcript. */
  reset: () => void;
}

export function useSpeechRecognition(opts: UseSpeechRecognitionOpts = {}): UseSpeechRecognitionResult {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<SR | null>(null);
  const finalRef = useRef('');           // финальные сегменты
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTranscriptRef = useRef(opts.onTranscript);
  onTranscriptRef.current = opts.onTranscript;

  const lang = opts.lang || (typeof navigator !== 'undefined' ? navigator.language : 'ru-RU');
  const silenceTimeoutMs = opts.silenceTimeoutMs ?? 0;

  /* feature-detect */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as SRWindow;
    setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const cleanup = useCallback(() => {
    if (silenceTimer.current) { clearTimeout(silenceTimer.current); silenceTimer.current = null; }
    const r = recRef.current;
    if (r) {
      r.onresult = null;
      r.onerror = null;
      r.onend = null;
      r.onstart = null;
    }
    recRef.current = null;
  }, []);

  const stop = useCallback(() => {
    const r = recRef.current;
    if (r) {
      try { r.stop(); } catch {}
    }
    setListening(false);
    if (silenceTimer.current) { clearTimeout(silenceTimer.current); silenceTimer.current = null; }
  }, []);

  const start = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const w = window as SRWindow;
    const Cls = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Cls) {
      setError('Браузер не поддерживает голосовой ввод');
      setSupported(false);
      return;
    }
    setError(null);

    cleanup();

    const r = new Cls();
    r.lang = lang;
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;

    finalRef.current = '';
    setTranscript('');

    r.onstart = () => setListening(true);

    r.onresult = (e: SREvent) => {
      let interim = '';
      // results — массив. Перебираем от resultIndex до конца, копим финальные.
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const txt = res[0].transcript;
        if (res.isFinal) {
          finalRef.current += txt;
        } else {
          interim += txt;
        }
      }
      const full = (finalRef.current + interim).replace(/\s+/g, ' ').trim();
      setTranscript(full);
      onTranscriptRef.current?.(full, false);

      // silence-таймер: если silenceTimeoutMs задан, ресетим на каждый event
      if (silenceTimeoutMs > 0) {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        silenceTimer.current = setTimeout(() => {
          stop();
        }, silenceTimeoutMs);
      }
    };

    r.onerror = (e: SRError) => {
      // 'no-speech' — НЕ ошибка, просто молчание. Игнорим.
      if (e.error === 'no-speech') return;
      // 'aborted' — мы сами вызвали stop, тоже не ошибка.
      if (e.error === 'aborted') return;
      const msg = humanizeSpeechError(e.error);
      setError(msg);
      setListening(false);
    };

    r.onend = () => {
      setListening(false);
      // Финальный onTranscript(isFinal=true) — чтобы родитель понял что ввод закончен
      const full = finalRef.current.replace(/\s+/g, ' ').trim();
      if (full) onTranscriptRef.current?.(full, true);
      cleanup();
    };

    recRef.current = r;
    try {
      r.start();
    } catch (e) {
      setError(`Не удалось начать запись: ${(e as Error).message}`);
      setListening(false);
      cleanup();
    }
  }, [lang, silenceTimeoutMs, cleanup, stop]);

  const toggle = useCallback(async () => {
    if (listening) stop();
    else await start();
  }, [listening, start, stop]);

  const reset = useCallback(() => {
    finalRef.current = '';
    setTranscript('');
    setError(null);
  }, []);

  // unmount → stop
  useEffect(() => {
    return () => { try { recRef.current?.abort(); } catch {} cleanup(); };
  }, [cleanup]);

  return { supported, listening, error, transcript, start, stop, toggle, reset };
}

function humanizeSpeechError(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Нет доступа к микрофону. Разреши в настройках браузера.';
    case 'audio-capture':
      return 'Не нашли микрофон';
    case 'network':
      return 'Ошибка сети при распознавании. Проверь интернет.';
    case 'language-not-supported':
      return 'Язык не поддерживается на этом устройстве';
    case 'bad-grammar':
      return 'Ошибка грамматики распознавания';
    default:
      return `Ошибка распознавания: ${code}`;
  }
}
