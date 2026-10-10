import { ThemeType } from '../types/report';

export interface ThemeConfig {
  id: ThemeType;
  label: string;
  badgeBg: string;
  headerGradient: string;
  accentText: string;
  accentBorder: string;
  accentBg: string;
  accentBgHover: string;
  accentRing: string;
  cardHeaderBg: string;
  badgeActiveBg: string;
  primaryButton: string;
  chipColor: string;
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  burgundy: {
    id: 'burgundy',
    label: 'Burgundy (Default BNN)',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
    headerGradient: 'from-[#580b1d] via-[#731228] to-[#8a1835]',
    accentText: 'text-[#8a1835]',
    accentBorder: 'border-rose-300 focus:border-[#8a1835]',
    accentBg: 'bg-rose-50',
    accentBgHover: 'hover:bg-rose-100',
    accentRing: 'focus:ring-[#8a1835]',
    cardHeaderBg: 'bg-rose-50/70 border-rose-100',
    badgeActiveBg: 'bg-[#731228] text-white',
    primaryButton: 'bg-[#731228] hover:bg-[#5b0e1f] text-white focus:ring-rose-900',
    chipColor: '#731228',
  },
  sage: {
    id: 'sage',
    label: 'Sage Green',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    headerGradient: 'from-[#193b2c] via-[#24523d] to-[#2d664c]',
    accentText: 'text-[#24523d]',
    accentBorder: 'border-emerald-300 focus:border-[#24523d]',
    accentBg: 'bg-emerald-50',
    accentBgHover: 'hover:bg-emerald-100',
    accentRing: 'focus:ring-[#24523d]',
    cardHeaderBg: 'bg-emerald-50/70 border-emerald-100',
    badgeActiveBg: 'bg-[#24523d] text-white',
    primaryButton: 'bg-[#24523d] hover:bg-[#1a3c2c] text-white focus:ring-emerald-900',
    chipColor: '#24523d',
  },
  blue: {
    id: 'blue',
    label: 'Biru Kedinasan',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    headerGradient: 'from-[#0e274d] via-[#163a75] to-[#1e4c9a]',
    accentText: 'text-[#163a75]',
    accentBorder: 'border-blue-300 focus:border-[#163a75]',
    accentBg: 'bg-blue-50',
    accentBgHover: 'hover:bg-blue-100',
    accentRing: 'focus:ring-[#163a75]',
    cardHeaderBg: 'bg-blue-50/70 border-blue-100',
    badgeActiveBg: 'bg-[#163a75] text-white',
    primaryButton: 'bg-[#163a75] hover:bg-[#0f2a55] text-white focus:ring-blue-900',
    chipColor: '#163a75',
  },
};
