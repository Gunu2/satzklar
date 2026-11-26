import { useEffect, useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import {
  ADJECTIVE_ENDINGS,
  DEFINITE_ARTICLES,
  INDEFINITE_ARTICLES,
  PREPOSITION_GROUPS,
} from '../../data/grammarReference';
import { GenderBadge } from '../layout/GenderBadge';

interface GrammarDrawerProps {
  open: boolean;
  onClose: () => void;
}

type DrawerTab = 'articles' | 'prepositions' | 'wordorder' | 'adjectives';

export function GrammarDrawer({ open, onClose }: GrammarDrawerProps) {
  const [tab, setTab] = useState<DrawerTab>('articles');

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      id="grammar-reference-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Quick-Reference Grammar Cheat Sheet"
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside className="w-full max-w-xl h-full bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col animate-slide-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#2563EB]" />
            <div>
              <h2 className="font-display font-extrabold text-lg text-[var(--ink-primary)] leading-tight">
                Quick-Reference Grammar
              </h2>
              <p className="text-xs text-[var(--ink-muted)]">
                Safe to open mid-drill — your quiz progress stays intact.
              </p>
            </div>
          </div>
          <button
            id="btn-close-grammar-drawer"
            type="button"
            onClick={onClose}
            aria-label="Close grammar reference drawer"
            className="p-2 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-well)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-well)]/50 grid grid-cols-4 gap-1">
          {(
            [
              { id: 'articles', label: 'Articles' },
              { id: 'prepositions', label: 'Preps' },
              { id: 'wordorder', label: 'Word Order' },
              { id: 'adjectives', label: 'Adjectives' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              id={`drawer-tab-${item.id}`}
              type="button"
              onClick={() => setTab(item.id)}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === item.id
                  ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {tab === 'articles' && (
            <>
              <div className="space-y-2.5">
                <h3 className="font-display font-bold text-sm text-[var(--ink-primary)]">
                  Definite Articles (the)
                </h3>
                <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[var(--bg-well)] border-b border-[var(--border-subtle)]">
                        <th className="p-2.5 font-mono text-xs text-[var(--ink-muted)]">Case</th>
                        <th className="p-2.5"><GenderBadge gender="M" size="xs" /></th>
                        <th className="p-2.5"><GenderBadge gender="F" size="xs" /></th>
                        <th className="p-2.5"><GenderBadge gender="N" size="xs" /></th>
                        <th className="p-2.5"><GenderBadge gender="PL" size="xs" /></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {DEFINITE_ARTICLES.map((row) => (
                        <tr key={row.caseName} className="bg-[var(--bg-surface)]">
                          <td className="p-2.5">
                            <span className="font-bold block text-[var(--ink-primary)]">
                              {row.caseName}
                            </span>
                            <span className="font-mono text-[10px] text-[var(--ink-muted)]">
                              {row.question}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono font-bold text-[#1D4ED8] dark:text-[#60A5FA]">
                            {row.M}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-[#BE123C] dark:text-[#FB7185]">
                            {row.F}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-[#047857] dark:text-[#34D399]">
                            {row.N}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-[#B45309] dark:text-[#FBBF24]">
                            {row.PL}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2.5">
                <h3 className="font-display font-bold text-sm text-[var(--ink-primary)]">
                  Indefinite & Negative Articles (ein / kein / mein)
                </h3>
                <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[var(--bg-well)] border-b border-[var(--border-subtle)]">
                        <th className="p-2.5 font-mono text-xs text-[var(--ink-muted)]">Case</th>
                        <th className="p-2.5"><GenderBadge gender="M" size="xs" /></th>
                        <th className="p-2.5"><GenderBadge gender="F" size="xs" /></th>
                        <th className="p-2.5"><GenderBadge gender="N" size="xs" /></th>
                        <th className="p-2.5"><GenderBadge gender="PL" size="xs" /></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {INDEFINITE_ARTICLES.map((row) => (
                        <tr key={row.caseName} className="bg-[var(--bg-surface)]">
                          <td className="p-2.5 font-bold text-[var(--ink-primary)]">
                            {row.caseName}
                          </td>
                          <td className="p-2.5 font-mono font-semibold text-[#1D4ED8] dark:text-[#60A5FA]">
                            {row.M}
                          </td>
                          <td className="p-2.5 font-mono font-semibold text-[#BE123C] dark:text-[#FB7185]">
                            {row.F}
                          </td>
                          <td className="p-2.5 font-mono font-semibold text-[#047857] dark:text-[#34D399]">
                            {row.N}
                          </td>
                          <td className="p-2.5 font-mono font-semibold text-[#B45309] dark:text-[#FBBF24]">
                            {row.PL}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {tab === 'prepositions' && (
            <div className="space-y-4">
              {PREPOSITION_GROUPS.map((group) => (
                <div key={group.caseName} className="paper-well rounded-2xl p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display font-bold text-base text-[var(--ink-primary)]">
                      {group.caseName}
                    </h3>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--ink-secondary)]">
                      {group.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--ink-secondary)]">{group.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {group.items.map((item) => (
                      <div
                        key={item.prep}
                        className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-2.5"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-mono font-bold text-sm text-[var(--ink-primary)]">
                            {item.prep}
                          </span>
                          <span className="text-[11px] text-[var(--ink-muted)]">
                            {item.meaning}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                          {item.example}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'wordorder' && (
            <div className="space-y-4">
              <div className="paper-well rounded-2xl p-4 space-y-2.5">
                <h3 className="font-display font-bold text-base text-[var(--ink-primary)]">
                  The German Satzklammer (Sentence Bracket)
                </h3>
                <p className="text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed">
                  Main clauses always lock the <strong>conjugated verb</strong> into Position 2. Any second verb part (infinitive, Partizip II, or separable prefix) snaps to the very end.
                </p>
                <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
                  <div className="rounded-lg p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span className="block font-mono text-[10px] text-[var(--ink-muted)]">Pos 1</span>
                    <span className="font-bold text-xs text-[var(--ink-primary)]">Heute</span>
                  </div>
                  <div className="rounded-lg p-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-700">
                    <span className="block font-mono text-[10px] text-[#2563EB] dark:text-blue-300">
                      Pos 2 (Verb)
                    </span>
                    <span className="font-bold text-xs text-[#1D4ED8] dark:text-blue-200">
                      muss
                    </span>
                  </div>
                  <div className="rounded-lg p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span className="block font-mono text-[10px] text-[var(--ink-muted)]">
                      Middle
                    </span>
                    <span className="font-bold text-xs text-[var(--ink-primary)]">ich früh</span>
                  </div>
                  <div className="rounded-lg p-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700">
                    <span className="block font-mono text-[10px] text-[#059669] dark:text-emerald-300">
                      End Bracket
                    </span>
                    <span className="font-bold text-xs text-[#047857] dark:text-emerald-200">
                      aufstehen.
                    </span>
                  </div>
                </div>
              </div>

              <div className="paper-well rounded-2xl p-4 space-y-2">
                <h3 className="font-display font-bold text-base text-[var(--ink-primary)]">
                  TeKaMoLo (Middle Field Rhythm)
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--ink-secondary)]">
                  <li>
                    <strong className="font-mono text-[#2563EB] dark:text-[#60A5FA]">Te</strong>mporal (When?): <em>heute, morgen, um 8 Uhr</em>
                  </li>
                  <li>
                    <strong className="font-mono text-[#E11D48] dark:text-[#FB7185]">Ka</strong>usal (Why?): <em>wegen des Regens, aus Freude</em>
                  </li>
                  <li>
                    <strong className="font-mono text-[#059669] dark:text-[#34D399]">Mo</strong>dal (How?): <em>gern, schnell, mit dem Zug</em>
                  </li>
                  <li>
                    <strong className="font-mono text-[#D97706] dark:text-[#FBBF24]">Lo</strong>kal (Where?): <em>nach Berlin, ins Büro</em>
                  </li>
                </ul>
              </div>

              <div className="paper-well rounded-2xl p-4 space-y-2">
                <h3 className="font-display font-bold text-base text-[var(--ink-primary)]">
                  Subordinate Clauses (weil, dass, obwohl, wenn)
                </h3>
                <p className="text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed">
                  Subordinating conjunctions send the conjugated verb to the <strong>absolute end</strong>:
                  <br />
                  <code className="font-mono text-xs text-[var(--ink-primary)]">
                    ..., weil ich Deutsch <strong>lerne</strong>.
                  </code>
                  <br />
                  Fronted Nebensatz triggers <strong>Verb, Verb</strong>:
                  <br />
                  <code className="font-mono text-xs text-[var(--ink-primary)]">
                    Wenn es regnet, <strong>bleibe</strong> ich hier.
                  </code>
                </p>
              </div>
            </div>
          )}

          {tab === 'adjectives' && (
            <div className="space-y-5">
              {(
                [
                  ADJECTIVE_ENDINGS.weak,
                  ADJECTIVE_ENDINGS.mixed,
                  ADJECTIVE_ENDINGS.strong,
                ] as const
              ).map((table) => (
                <div key={table.title} className="space-y-2">
                  <h3 className="font-display font-bold text-sm text-[var(--ink-primary)]">
                    {table.title}
                  </h3>
                  <p className="text-xs text-[var(--ink-secondary)]">{table.tip}</p>
                  <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[var(--bg-well)] border-b border-[var(--border-subtle)]">
                          <th className="p-2 font-mono text-[var(--ink-muted)]">Case</th>
                          <th className="p-2"><GenderBadge gender="M" size="xs" /></th>
                          <th className="p-2"><GenderBadge gender="F" size="xs" /></th>
                          <th className="p-2"><GenderBadge gender="N" size="xs" /></th>
                          <th className="p-2"><GenderBadge gender="PL" size="xs" /></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)]">
                        {table.rows.map((r) => (
                          <tr key={r.caseName} className="bg-[var(--bg-surface)]">
                            <td className="p-2 font-bold text-[var(--ink-primary)]">
                              {r.caseName.slice(0, 3)}.
                            </td>
                            <td className="p-2 font-mono text-[#1D4ED8] dark:text-[#60A5FA]">
                              {r.M}
                            </td>
                            <td className="p-2 font-mono text-[#BE123C] dark:text-[#FB7185]">
                              {r.F}
                            </td>
                            <td className="p-2 font-mono text-[#047857] dark:text-[#34D399]">
                              {r.N}
                            </td>
                            <td className="p-2 font-mono text-[#B45309] dark:text-[#FBBF24]">
                              {r.PL}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
