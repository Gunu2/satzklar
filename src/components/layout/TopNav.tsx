import {
  BookOpen,
  Flame,
  Zap,
  AlertTriangle,
  Stethoscope,
  Sun,
  Moon,
  Settings,
  Compass,
  Award,
} from 'lucide-react';
import type { ActiveTab } from '../../types/grammar';

interface TopNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  streakDays: number;
  xp: number;
  mistakeCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenGrammarDrawer: () => void;
  onOpenSettings: () => void;
  inActiveDrill?: boolean;
}

export function TopNav({
  activeTab,
  onSelectTab,
  streakDays,
  xp,
  mistakeCount,
  theme,
  onToggleTheme,
  onOpenGrammarDrawer,
  onOpenSettings,
  inActiveDrill = false,
}: TopNavProps) {
  const navItems: Array<{
    id: ActiveTab;
    label: string;
    shortLabel: string;
    icon: typeof Compass;
    badge?: number;
  }> = [
    { id: 'roadmap', label: 'Roadmap', shortLabel: 'Learn', icon: Compass },
    { id: 'sprint', label: 'Verb Sprint', shortLabel: 'Sprint', icon: Zap },
    {
      id: 'vault',
      label: 'Weak Spots',
      shortLabel: 'Vault',
      icon: AlertTriangle,
      badge: mistakeCount > 0 ? mistakeCount : undefined,
    },
    { id: 'doctor', label: 'Sentence Doctor', shortLabel: 'Doctor', icon: Stethoscope },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/92 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <button
          id="nav-logo"
          type="button"
          onClick={() => onSelectTab('roadmap')}
          className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
        >
          <span className="w-9 h-9 rounded-xl bg-[#1C1917] dark:bg-slate-100 flex items-center justify-center shadow-sm transition-transform group-hover:scale-[1.03]">
            <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
              <path
                d="M7 8h5v3.2H9.8v9.6H12V24H7V8zm13 0h5v16h-5v-3.2h2.2v-9.6H20V8z"
                className="fill-[#FAF8F5] dark:fill-slate-900"
              />
              <circle cx="16" cy="12" r="2.2" fill="#2563EB" />
              <circle cx="16" cy="20" r="2.2" fill="#059669" />
            </svg>
          </span>
          <div className="leading-tight">
            <span className="block font-display font-extrabold text-lg tracking-tight text-[var(--ink-primary)]">
              SatzKlar
            </span>
            <span className="hidden sm:block text-[11px] font-medium text-[var(--ink-muted)]">
              German Grammar Studio
            </span>
          </div>
        </button>

        {/* Desktop Primary Tabs */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id && !inActiveDrill;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-0.5 min-w-5 h-5 px-1.5 rounded-full bg-[#E11D48] text-white font-mono text-[11px] font-bold inline-flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Streak, XP, Cheat Sheet, Settings, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Streak pill */}
          <div
            id="stat-streak"
            title="Daily study streak"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono font-bold text-[#D97706]"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{streakDays}d</span>
          </div>

          {/* XP pill */}
          <div
            id="stat-xp"
            title="Total Mastery XP"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono font-bold text-[#2563EB] dark:text-[#60A5FA]"
          >
            <Award className="w-3.5 h-3.5" />
            <span>{xp} XP</span>
          </div>

          {/* Quick-Reference Grammar Drawer Button */}
          <button
            id="btn-grammar-drawer"
            type="button"
            onClick={onOpenGrammarDrawer}
            title="Quick-Reference Grammar Cheat Sheet (keeps quiz progress)"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline">Cheat Sheet</span>
          </button>

          {/* Settings */}
          <button
            id="btn-settings"
            type="button"
            onClick={onOpenSettings}
            title="Settings, Gemini BYOK & Backup"
            aria-label="Open Settings"
            className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            id="btn-theme-toggle"
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Warm Paper Light Mode' : 'Switch to Low-Glare Slate Dark Mode'}
            aria-label="Toggle color theme"
            className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 px-2 py-1.5 grid grid-cols-4 gap-1"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id && !inActiveDrill;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                active
                  ? 'bg-[var(--bg-well)] text-[var(--ink-primary)]'
                  : 'text-[var(--ink-muted)]'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#E11D48] text-white font-mono text-[9px] font-bold inline-flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
