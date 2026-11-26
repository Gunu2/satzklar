import type { Gender } from '../types/grammar';

export const GENDER_STYLE_MAP: Record<
  Gender,
  { bg: string; text: string; border: string; dot: string }
> = {
  M: {
    bg: 'bg-[#2563EB]/10 dark:bg-[#2563EB]/20',
    text: 'text-[#1D4ED8] dark:text-[#60A5FA]',
    border: 'border-[#2563EB]/30 dark:border-[#3B82F6]/40',
    dot: 'bg-[#2563EB]',
  },
  F: {
    bg: 'bg-[#E11D48]/10 dark:bg-[#E11D48]/20',
    text: 'text-[#BE123C] dark:text-[#FB7185]',
    border: 'border-[#E11D48]/30 dark:border-[#F43F5E]/40',
    dot: 'bg-[#E11D48]',
  },
  N: {
    bg: 'bg-[#059669]/10 dark:bg-[#059669]/20',
    text: 'text-[#047857] dark:text-[#34D399]',
    border: 'border-[#059669]/30 dark:border-[#10B981]/40',
    dot: 'bg-[#059669]',
  },
  PL: {
    bg: 'bg-[#D97706]/10 dark:bg-[#D97706]/20',
    text: 'text-[#B45309] dark:text-[#FBBF24]',
    border: 'border-[#D97706]/30 dark:border-[#F59E0B]/40',
    dot: 'bg-[#D97706]',
  },
};

export function getGenderClasses(gender: Gender) {
  return GENDER_STYLE_MAP[gender];
}
