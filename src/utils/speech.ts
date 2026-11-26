/**
 * Zero-API-key German (de-DE) Text-to-Speech using the browser's Web Speech API.
 * Gracefully degrades when speechSynthesis is unavailable (e.g., headless environments).
 */

let cachedGermanVoice: SpeechSynthesisVoice | null = null;

function pickGermanVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Prefer high-quality native de-DE voices
  const preferred =
    voices.find(
      (v) =>
        v.lang.toLowerCase() === 'de-de' &&
        (v.name.includes('Google') ||
          v.name.includes('Anna') ||
          v.name.includes('Markus') ||
          v.name.includes('Katja') ||
          v.name.includes('Natural'))
    ) ||
    voices.find((v) => v.lang.toLowerCase() === 'de-de') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('de'));

  cachedGermanVoice = preferred ?? null;
  return cachedGermanVoice;
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopGermanSpeech(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore cancellation errors in restricted browsers
  }
}

export function speakGerman(
  text: string,
  rate: 0.75 | 1.0 = 1.0,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (!isSpeechSupported() || !text.trim()) {
    onEnd?.();
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const voice = cachedGermanVoice ?? pickGermanVoice();
    if (voice) {
      utterance.voice = voice;
    }

    let ended = false;
    const finish = () => {
      if (!ended) {
        ended = true;
        onEnd?.();
      }
    };

    utterance.onstart = () => onStart?.();
    utterance.onend = finish;
    utterance.onerror = finish;

    // Fallback safety timer in case headless/mobile browser never fires onend
    const estimatedMs = Math.max(2000, (text.length * 85) / rate + 1500);
    window.setTimeout(finish, estimatedMs);

    onStart?.();
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    onEnd?.();
    return false;
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedGermanVoice = pickGermanVoice();
  };
}
