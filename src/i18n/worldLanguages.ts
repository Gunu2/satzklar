export interface WorldLanguage {
  code: string; // ISO / Google Translate language code
  nativeName: string;
  englishName: string;
  flag: string;
  rtl?: boolean;
  instant?: boolean; // Has instant zero-latency built-in dictionary in translations.ts
}

/**
 * Comprehensive global directory of 100+ world languages (plus full 130+ via Google Website Translator)
 * so learners from every country can study German with instructions & explanations in their own language,
 * while German learning sentences remain strictly protected (`translate="no" class="notranslate"`).
 */
export const WORLD_LANGUAGES: WorldLanguage[] = [
  // 14 Instant Built-In Languages (zero-latency UI + full-page explanation auto-translation)
  { code: 'en', nativeName: 'English', englishName: 'English', flag: '🇬🇧', instant: true },
  { code: 'id', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian', flag: '🇮🇩', instant: true },
  { code: 'de', nativeName: 'Deutsch (Immersion)', englishName: 'German', flag: '🇩🇪', instant: true },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸', instant: true },
  { code: 'fr', nativeName: 'Français', englishName: 'French', flag: '🇫🇷', instant: true },
  { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', flag: '🇹🇷', instant: true },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', flag: '🇸🇦', rtl: true, instant: true },
  { code: 'zh-CN', nativeName: '中文 (简体)', englishName: 'Chinese (Simplified)', flag: '🇨🇳', instant: true },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', flag: '🇯🇵', instant: true },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean', flag: '🇰🇷', instant: true },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', flag: '🇧🇷', instant: true },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳', instant: true },
  { code: 'vi', nativeName: 'Tiếng Việt', englishName: 'Vietnamese', flag: '🇻🇳', instant: true },
  { code: 'uk', nativeName: 'Українська', englishName: 'Ukrainian', flag: '🇺🇦', instant: true },

  // Asia & Pacific
  { code: 'ms', nativeName: 'Bahasa Melayu', englishName: 'Malay', flag: '🇲🇾' },
  { code: 'jv', nativeName: 'Basa Jawa', englishName: 'Javanese', flag: '🇮🇩' },
  { code: 'su', nativeName: 'Basa Sunda', englishName: 'Sundanese', flag: '🇮🇩' },
  { code: 'tl', nativeName: 'Filipino / Tagalog', englishName: 'Filipino', flag: '🇵🇭' },
  { code: 'th', nativeName: 'ไทย', englishName: 'Thai', flag: '🇹🇭' },
  { code: 'zh-TW', nativeName: '中文 (繁體)', englishName: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', flag: '🇧🇩' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', flag: '🇵🇰', rtl: true },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', flag: '🇮🇳' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', flag: '🇮🇳' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', flag: '🇮🇳' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', flag: '🇮🇳' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', flag: '🇮🇳' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', flag: '🇮🇳' },
  { code: 'ne', nativeName: 'नेपाली', englishName: 'Nepali', flag: '🇳🇵' },
  { code: 'si', nativeName: 'සිංහල', englishName: 'Sinhala', flag: '🇱🇰' },
  { code: 'my', nativeName: 'မြန်မာဘာသာ', englishName: 'Myanmar (Burmese)', flag: '🇲🇲' },
  { code: 'km', nativeName: 'ខ្មែរ', englishName: 'Khmer', flag: '🇰🇭' },
  { code: 'lo', nativeName: 'ລາວ', englishName: 'Lao', flag: '🇱🇦' },
  { code: 'mn', nativeName: 'Монгол', englishName: 'Mongolian', flag: '🇲🇳' },
  { code: 'kk', nativeName: 'Қазақша', englishName: 'Kazakh', flag: '🇰🇿' },
  { code: 'uz', nativeName: 'Oʻzbekcha', englishName: 'Uzbek', flag: '🇺🇿' },
  { code: 'ky', nativeName: 'Кыргызча', englishName: 'Kyrgyz', flag: '🇰🇬' },
  { code: 'tg', nativeName: 'Тоҷикӣ', englishName: 'Tajik', flag: '🇹🇯' },
  { code: 'tk', nativeName: 'Türkmençe', englishName: 'Turkmen', flag: '🇹🇲' },

  // Middle East & Central Asia
  { code: 'fa', nativeName: 'فارسی', englishName: 'Persian (Farsi)', flag: '🇮🇷', rtl: true },
  { code: 'he', nativeName: 'עברית', englishName: 'Hebrew', flag: '🇮🇱', rtl: true },
  { code: 'ku', nativeName: 'Kurdî (Kurmanji)', englishName: 'Kurdish', flag: '🌐' },
  { code: 'ps', nativeName: 'پښتو', englishName: 'Pashto', flag: '🇦🇫', rtl: true },
  { code: 'az', nativeName: 'Azərbaycanca', englishName: 'Azerbaijani', flag: '🇦🇿' },
  { code: 'ka', nativeName: 'ქართული', englishName: 'Georgian', flag: '🇬🇪' },
  { code: 'hy', nativeName: 'Հայերեն', englishName: 'Armenian', flag: '🇦🇲' },

  // Europe
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', flag: '🇷🇺' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian', flag: '🇮🇹' },
  { code: 'nl', nativeName: 'Nederlands', englishName: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', nativeName: 'Polski', englishName: 'Polish', flag: '🇵🇱' },
  { code: 'ro', nativeName: 'Română', englishName: 'Romanian', flag: '🇷🇴' },
  { code: 'el', nativeName: 'Ελληνικά', englishName: 'Greek', flag: '🇬🇷' },
  { code: 'cs', nativeName: 'Čeština', englishName: 'Czech', flag: '🇨🇿' },
  { code: 'sk', nativeName: 'Slovenčina', englishName: 'Slovak', flag: '🇸🇰' },
  { code: 'hu', nativeName: 'Magyar', englishName: 'Hungarian', flag: '🇭🇺' },
  { code: 'bg', nativeName: 'Български', englishName: 'Bulgarian', flag: '🇧🇬' },
  { code: 'sr', nativeName: 'Српски', englishName: 'Serbian', flag: '🇷🇸' },
  { code: 'hr', nativeName: 'Hrvatski', englishName: 'Croatian', flag: '🇭🇷' },
  { code: 'bs', nativeName: 'Bosanski', englishName: 'Bosnian', flag: '🇧🇦' },
  { code: 'sl', nativeName: 'Slovenščina', englishName: 'Slovenian', flag: '🇸🇮' },
  { code: 'sq', nativeName: 'Shqip', englishName: 'Albanian', flag: '🇦🇱' },
  { code: 'mk', nativeName: 'Македонски', englishName: 'Macedonian', flag: '🇲🇰' },
  { code: 'sv', nativeName: 'Svenska', englishName: 'Swedish', flag: '🇸🇪' },
  { code: 'no', nativeName: 'Norsk', englishName: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', nativeName: 'Dansk', englishName: 'Danish', flag: '🇩🇰' },
  { code: 'fi', nativeName: 'Suomi', englishName: 'Finnish', flag: '🇫🇮' },
  { code: 'is', nativeName: 'Íslenska', englishName: 'Icelandic', flag: '🇮🇸' },
  { code: 'lt', nativeName: 'Lietuvių', englishName: 'Lithuanian', flag: '🇱🇹' },
  { code: 'lv', nativeName: 'Latviešu', englishName: 'Latvian', flag: '🇱🇻' },
  { code: 'et', nativeName: 'Eesti', englishName: 'Estonian', flag: '🇪🇪' },
  { code: 'be', nativeName: 'Беларуская', englishName: 'Belarusian', flag: '🇧🇾' },
  { code: 'ca', nativeName: 'Català', englishName: 'Catalan', flag: '🇪🇸' },
  { code: 'eu', nativeName: 'Euskara', englishName: 'Basque', flag: '🇪🇸' },
  { code: 'gl', nativeName: 'Galego', englishName: 'Galician', flag: '🇪🇸' },
  { code: 'ga', nativeName: 'Gaeilge', englishName: 'Irish', flag: '🇮🇪' },
  { code: 'cy', nativeName: 'Cymraeg', englishName: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'mt', nativeName: 'Malti', englishName: 'Maltese', flag: '🇲🇹' },
  { code: 'lb', nativeName: 'Lëtzebuergesch', englishName: 'Luxembourgish', flag: '🇱🇺' },

  // Africa
  { code: 'sw', nativeName: 'Kiswahili', englishName: 'Swahili', flag: '🇰🇪' },
  { code: 'am', nativeName: 'አማርኛ', englishName: 'Amharic', flag: '🇪🇹' },
  { code: 'af', nativeName: 'Afrikaans', englishName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'yo', nativeName: 'Yorùbá', englishName: 'Yoruba', flag: '🇳🇬' },
  { code: 'ha', nativeName: 'Hausa', englishName: 'Hausa', flag: '🇳🇬' },
  { code: 'ig', nativeName: 'Igbo', englishName: 'Igbo', flag: '🇳🇬' },
  { code: 'zu', nativeName: 'isiZulu', englishName: 'Zulu', flag: '🇿🇦' },
  { code: 'xh', nativeName: 'isiXhosa', englishName: 'Xhosa', flag: '🇿🇦' },
  { code: 'so', nativeName: 'Soomaali', englishName: 'Somali', flag: '🇸🇴' },
  { code: 'mg', nativeName: 'Malagasy', englishName: 'Malagasy', flag: '🇲🇬' },
  { code: 'rw', nativeName: 'Kinyarwanda', englishName: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'sn', nativeName: 'chiShona', englishName: 'Shona', flag: '🇿🇼' },
  { code: 'ti', nativeName: 'ትግርኛ', englishName: 'Tigrinya', flag: '🇪🇷' },
  { code: 'om', nativeName: 'Afaan Oromoo', englishName: 'Oromo', flag: '🇪🇹' },

  // Americas & Oceania
  { code: 'ht', nativeName: 'Kreyòl Ayisyen', englishName: 'Haitian Creole', flag: '🇭🇹' },
  { code: 'qu', nativeName: 'Runasimi', englishName: 'Quechua', flag: '🇵🇪' },
  { code: 'gn', nativeName: 'Avañeʼẽ', englishName: 'Guarani', flag: '🇵🇾' },
  { code: 'mi', nativeName: 'Te Reo Māori', englishName: 'Maori', flag: '🇳🇿' },
  { code: 'sm', nativeName: 'Gagana Sāmoa', englishName: 'Samoan', flag: '🇼🇸' },
  { code: 'haw', nativeName: 'ʻŌlelo Hawaiʻi', englishName: 'Hawaiian', flag: '🌺' },
  { code: 'eo', nativeName: 'Esperanto', englishName: 'Esperanto', flag: '🌐' },
];
