import type { Gender } from '../../types/grammar';
import { GENDER_META } from '../../data/grammarReference';
import { getGenderClasses } from '../../utils/genderStyles';

interface GenderBadgeProps {
  gender: Gender;
  showArticle?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function GenderBadge({
  gender,
  showArticle = false,
  size = 'sm',
  className = '',
}: GenderBadgeProps) {
  const styles = getGenderClasses(gender);
  const meta = GENDER_META[gender];

  const sizeClass =
    size === 'xs'
      ? 'text-[10px] px-1.5 py-0.5 gap-1'
      : size === 'md'
        ? 'text-xs px-2.5 py-1 gap-1.5'
        : 'text-[11px] px-2 py-0.5 gap-1';

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold rounded-md border tracking-tight whitespace-nowrap ${styles.bg} ${styles.text} ${styles.border} ${sizeClass} ${className}`}
      title={`${meta.label} (${meta.article})`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} aria-hidden="true" />
      {showArticle && <span className="font-sans font-semibold">{meta.article}</span>}
      <span>{meta.short}</span>
    </span>
  );
}
