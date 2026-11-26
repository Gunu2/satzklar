import { useState } from 'react';
import { Volume2, Turtle } from 'lucide-react';
import { speakGerman } from '../../utils/speech';

interface AudioButtonProps {
  text: string;
  compact?: boolean;
  showShortcut?: boolean;
  className?: string;
}

export function AudioButton({
  text,
  compact = false,
  showShortcut = false,
  className = '',
}: AudioButtonProps) {
  const [speakingRate, setSpeakingRate] = useState<null | 0.75 | 1.0>(null);

  const handleSpeak = (rate: 0.75 | 1.0) => {
    speakGerman(
      text,
      rate,
      () => setSpeakingRate(rate),
      () => setSpeakingRate(null)
    );
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => handleSpeak(1.0)}
        title="Listen in German (1.0x normal speed)"
        aria-label="Listen to German sentence at normal speed"
        className={`inline-flex items-center gap-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
          compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
        } ${
          speakingRate === 1.0
            ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
            : 'bg-[var(--bg-surface)] text-[var(--ink-primary)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-well)]'
        }`}
      >
        <Volume2 className={`w-3.5 h-3.5 ${speakingRate === 1.0 ? 'animate-pulse' : ''}`} />
        <span>1.0×</span>
        {showShortcut && !compact && (
          <span className="hidden sm:inline-flex kbd ml-0.5 text-[10px] h-4 px-1">Space</span>
        )}
      </button>

      <button
        type="button"
        onClick={() => handleSpeak(0.75)}
        title="Listen slowly in German (0.75x slow speed)"
        aria-label="Listen to German sentence slowly at 0.75x speed"
        className={`inline-flex items-center gap-1 rounded-lg border font-medium transition-all cursor-pointer ${
          compact ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs sm:text-sm'
        } ${
          speakingRate === 0.75
            ? 'bg-[#059669] text-white border-[#059669] shadow-sm'
            : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-well)]'
        }`}
      >
        <Turtle className={`w-3.5 h-3.5 ${speakingRate === 0.75 ? 'animate-pulse' : ''}`} />
        <span>0.75×</span>
      </button>
    </div>
  );
}
