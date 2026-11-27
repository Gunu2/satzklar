import type { ListeningLine } from '../types/grammar';
import { isSpeechSupported } from './speech';

export interface TranscriptPlaybackController {
  stop: () => void;
}

function getGermanVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  const all = window.speechSynthesis.getVoices();
  const de = all.filter((v) => v.lang.toLowerCase().startsWith('de'));
  return de;
}

/**
 * Plays a multi-turn German exam listening track line by line with distinct pitch/voices
 * per speaker role so dialogues sound natural and clear — 100% browser-local.
 */
export function playListeningTrack(
  lines: ListeningLine[],
  rate: 0.75 | 1.0,
  callbacks: {
    onLineStart: (index: number) => void;
    onComplete: () => void;
  },
  startIndex = 0
): TranscriptPlaybackController {
  let cancelled = false;
  let fallbackTimer: number | null = null;

  const clearFallback = () => {
    if (fallbackTimer !== null) {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  };

  const stop = () => {
    cancelled = true;
    clearFallback();
    if (isSpeechSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore cancel errors
      }
    }
  };

  if (lines.length === 0 || startIndex >= lines.length) {
    callbacks.onComplete();
    return { stop };
  }

  const voices = getGermanVoices();

  const pickVoiceForRole = (
    role: ListeningLine['voiceRole']
  ): { voice: SpeechSynthesisVoice | null; pitch: number } => {
    if (voices.length === 0) {
      return {
        voice: null,
        pitch: role === 'speakerB' ? 0.88 : role === 'speakerA' ? 1.08 : 1.0,
      };
    }
    if (role === 'speakerB' && voices.length >= 2) {
      return { voice: voices[1], pitch: 0.94 };
    }
    if (role === 'narrator' && voices.length >= 3) {
      return { voice: voices[2], pitch: 1.0 };
    }
    return {
      voice: voices[0],
      pitch: role === 'speakerB' ? 0.88 : role === 'speakerA' ? 1.06 : 1.0,
    };
  };

  const playNext = (idx: number) => {
    if (cancelled) return;
    if (idx >= lines.length) {
      callbacks.onComplete();
      return;
    }

    const line = lines[idx];
    callbacks.onLineStart(idx);

    if (!isSpeechSupported()) {
      // Graceful timed progression if speechSynthesis isn't available
      fallbackTimer = window.setTimeout(() => {
        playNext(idx + 1);
      }, Math.max(1200, (line.text.length * 55) / rate));
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.lang = 'de-DE';
      utterance.rate = rate;

      const { voice, pitch } = pickVoiceForRole(line.voiceRole);
      utterance.pitch = pitch;
      if (voice) {
        utterance.voice = voice;
      }

      let advanced = false;
      const advance = () => {
        if (advanced || cancelled) return;
        advanced = true;
        clearFallback();
        // Slight natural pause between speaker turns
        fallbackTimer = window.setTimeout(() => {
          playNext(idx + 1);
        }, 420);
      };

      utterance.onend = advance;
      utterance.onerror = advance;

      // Safety fallback in case headless/mobile browser never fires onend
      const maxWaitMs = Math.max(2800, (line.text.length * 90) / rate + 1800);
      fallbackTimer = window.setTimeout(advance, maxWaitMs);

      window.speechSynthesis.speak(utterance);
    } catch {
      fallbackTimer = window.setTimeout(() => {
        playNext(idx + 1);
      }, 1500);
    }
  };

  playNext(startIndex);

  return { stop };
}
