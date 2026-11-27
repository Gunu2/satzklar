/**
 * Strict Anti-Bully, Anti-Harassment & Anti-Cybercrime Moderation Layer.
 * Runs locally before any message or nickname can be posted in public rooms or 1-on-1 DMs.
 */

const BLOCKED_USERS_KEY = 'satzklar_chat_blocked_users_v1';
const REPORTED_MSGS_KEY = 'satzklar_chat_reported_msgs_v1';

export interface ModerationResult {
  allowed: boolean;
  category?: 'bullying' | 'cybercrime' | 'spam' | 'length';
  reason?: string;
}

// Multi-language profanity, bullying, slurs, harassment, and threats (EN / ID / DE)
const BULLYING_PATTERNS: RegExp[] = [
  /\b(fuck|fucking|f\*ck|shit|bitch|asshole|bastard|slut|whore|cunt|retard|idiot|moron|stupid\s+loser|kill\s+yourself|kys|go\s+die|nazi|hitler|rape|porn|nudes|sexting|dickpic)\b/i,
  /\b(anjing|bangsat|kontol|memek|ngentot|tolol|goblok|bajingan|keparat|brengsek|pecun|lonte|babi\s+lu|mati\s+aja|bunuh\s+diri|bodoh\s+banget)\b/i,
  /\b(arschloch|hurensohn|fotze|wichser|schlampe|scheiße\s+du|halt\s+die\s+fresse|verpiss\s+dich|bring\s+dich\s+um|vollidiot|missgeburt)\b/i,
];

// Anti-cybercrime, phishing, scam, financial solicitation, gambling, and off-platform harvesting
const CYBERCRIME_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern: /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|xyz|top|click|site|io|me|ly|gg|cc|ru|cn|tk)\b)/i,
    reason:
      'External links & URLs are blocked to protect learners from phishing and malicious websites.',
  },
  {
    pattern: /\b(wa\.me|t\.me|whatsapp|telegram|signal\s+me|add\s+my\s+wa|dm\s+ig|chat\s+wa|nomor\s+wa|no\s+hp)\b/i,
    reason:
      'Sharing WhatsApp/Telegram handles or moving learners off-platform is blocked for your safety.',
  },
  {
    pattern: /(\+?\d[\d\s\-().]{7,}\d)/,
    reason:
      'Phone numbers, bank accounts, and long numeric IDs are blocked to prevent doxxing and scams.',
  },
  {
    pattern: /\b(crypto|bitcoin|btc|usdt|eth|binance|forex|binary\s+option|investasi\s+bodong|cuan\s+cepat|slot\s+gacor|judol|judi\s+online|pinjol|dana\s+kaget|transfer\s+uang|send\s+money|wire\s+transfer|gift\s+card|western\s+union|sugar\s+daddy|sugar\s+mommy)\b/i,
    reason:
      'Financial solicitation, crypto/investment promos, and gambling scams are strictly prohibited.',
  },
  {
    pattern: /\b(otp|one[\s-]time\s+password|pin\s+atm|cvv|credit\s+card\s+number|seed\s+phrase|private\s+key|password\s+kamu|kode\s+verifikasi|rekening\s+bank|ktp|nik\s+ktp)\b/i,
    reason:
      'Asking for or sharing sensitive credentials (OTP, PIN, bank/ID details) is strictly blocked.',
  },
  {
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    reason:
      'Posting email addresses inside chat messages is blocked to protect your privacy.',
  },
];

export function moderateChatMessage(
  rawText: string,
  options?: { lastSentAt?: number; lastText?: string }
): ModerationResult {
  const text = rawText.trim();

  if (!text) {
    return {
      allowed: false,
      category: 'length',
      reason: 'Message cannot be empty.',
    };
  }

  if (text.length > 500) {
    return {
      allowed: false,
      category: 'length',
      reason: 'Messages are limited to 500 characters to keep the room readable.',
    };
  }

  // 1. Anti-Bullying / Harassment / Hate speech (checked first — zero tolerance)
  for (const pattern of BULLYING_PATTERNS) {
    if (pattern.test(text)) {
      return {
        allowed: false,
        category: 'bullying',
        reason:
          'Message blocked by Anti-Bullying Guard: abusive, toxic, or disrespectful language is not allowed in SatzKlar.',
      };
    }
  }

  // 2. Anti-Cybercrime / Anti-Scam / Anti-Phishing (checked immediately)
  for (const rule of CYBERCRIME_PATTERNS) {
    if (rule.pattern.test(text)) {
      return {
        allowed: false,
        category: 'cybercrime',
        reason: `Blocked by Anti-Cybercrime Guard: ${rule.reason}`,
      };
    }
  }

  // 3. Rate limit: 2.5 seconds between messages
  if (options?.lastSentAt && Date.now() - options.lastSentAt < 2500) {
    return {
      allowed: false,
      category: 'spam',
      reason: 'Please wait a couple of seconds before sending another message (anti-spam).',
    };
  }

  // Duplicate message prevention
  if (
    options?.lastText &&
    options.lastText.trim().toLowerCase() === text.toLowerCase()
  ) {
    return {
      allowed: false,
      category: 'spam',
      reason: 'Duplicate message blocked to keep the chat clean.',
    };
  }

  // Excessive repeated characters spam (e.g., "aaaaaaaaaa")
  if (/(.)\1{7,}/.test(text)) {
    return {
      allowed: false,
      category: 'spam',
      reason: 'Excessive repeated characters are blocked (anti-spam).',
    };
  }

  // Aggressive ALL-CAPS shouting check
  const letters = text.replace(/[^a-zA-ZäöüÄÖÜß]/g, '');
  if (letters.length >= 22) {
    const upperCount = letters.replace(/[^A-ZÄÖÜ]/g, '').length;
    if (upperCount / letters.length > 0.85) {
      return {
        allowed: false,
        category: 'spam',
        reason: 'Please avoid ALL-CAPS shouting so the study room stays calm and welcoming.',
      };
    }
  }

  return { allowed: true };
}

export function validateNickname(raw: string): { ok: boolean; cleaned: string; error?: string } {
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (cleaned.length < 2 || cleaned.length > 24) {
    return { ok: false, cleaned, error: 'Nickname must be 2–24 characters.' };
  }
  const mod = moderateChatMessage(cleaned);
  if (!mod.allowed) {
    return {
      ok: false,
      cleaned,
      error: 'Please choose a clean, respectful study nickname (no links, numbers, or profanity).',
    };
  }
  return { ok: true, cleaned };
}

export function validateBio(raw: string): { ok: boolean; cleaned: string; error?: string } {
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (!cleaned) return { ok: true, cleaned: '' };
  if (cleaned.length > 140) {
    return { ok: false, cleaned, error: 'Bio must be 140 characters or less.' };
  }
  const mod = moderateChatMessage(cleaned);
  if (!mod.allowed) {
    return {
      ok: false,
      cleaned,
      error: 'Bio cannot contain links, contact handles, or inappropriate language.',
    };
  }
  return { ok: true, cleaned };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function loadBlockedUsers(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BLOCKED_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function saveBlockedUsers(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // Ignore storage errors
  }
}

export function loadReportedMessageIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(REPORTED_MSGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function saveReportedMessageIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(REPORTED_MSGS_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // Ignore storage errors
  }
}
