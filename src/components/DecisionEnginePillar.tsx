import React, { useState } from 'react';
import { Scale, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Shield, FileSearch } from 'lucide-react';
import { DeterministicPolicyRule, EvidenceItem } from '../types.js';

interface DecisionEnginePillarProps {
  policies: DeterministicPolicyRule[];
  evidenceTrail: EvidenceItem[];
}

export const DecisionEnginePillar: React.FC<DecisionEnginePillarProps> = ({
  policies,
  evidenceTrail,
}) => {
  const [activeTab, setActiveTab] = useState<'POLICIES' | 'AUDIT'>('POLICIES');

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Deterministic Decision Engine
            </h3>
            <span className="rounded bg-zinc-900 px-2 py-0.5 text-[11px] font-mono text-white dark:bg-zinc-100 dark:text-zinc-900">
              Jev judges. Code decides.
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Explicit, auditable policies that combine GitHub diff metrics, SonarQube static violations, and Jev typed signals.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('POLICIES')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
              activeTab === 'POLICIES'
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Rules Trace ({policies.filter((p) => p.conditionMet).length}/{policies.length} Active)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AUDIT')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
              activeTab === 'AUDIT'
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Evidence Trail ({evidenceTrail.length})
          </button>
        </div>
      </div>

      {activeTab === 'POLICIES' ? (
        <div className="mt-5 space-y-3">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className={`rounded-xl border p-4 transition-all ${
                policy.conditionMet
                  ? policy.severity === 'CRITICAL'
                    ? 'border-red-300 bg-red-50/50 dark:border-red-900/60 dark:bg-red-950/20'
                    : policy.severity === 'HIGH'
                    ? 'border-orange-300 bg-orange-50/50 dark:border-orange-900/60 dark:bg-orange-950/20'
                    : 'border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50'
                  : 'border-zinc-200/60 bg-white/60 opacity-60 dark:border-zinc-800/60 dark:bg-zinc-900/40'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                      policy.conditionMet
                        ? 'bg-red-600 text-white dark:bg-red-500'
                        : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {policy.conditionMet ? '!' : '✓'}
                  </span>
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {policy.id}
                  </span>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {policy.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      policy.conditionMet
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {policy.conditionMet ? `TRIGGERED → ${policy.effect}` : 'Condition Not Met'}
                  </span>
                </div>
              </div>

              {/* Condition Rule Logic */}
              <div className="mt-2 rounded-lg bg-zinc-100/80 px-3 py-1.5 font-mono text-[11px] text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
                <code>{policy.conditionDescription}</code>
              </div>

              {/* Rationale & Evidence Source */}
              <div className="mt-2.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs">
                <p className="text-zinc-700 dark:text-zinc-300">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Result: </span>
                  {policy.reason}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Sources:</span>
                  {policy.evidenceSources.map((source) => (
                    <span
                      key={source}
                      className="rounded bg-zinc-200/70 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>

              {policy.evidenceDetails && (
                <div className="mt-2 border-t border-zinc-200/60 pt-2 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <span className="font-semibold">Evidence: </span>
                  <span className="font-mono">{policy.evidenceDetails}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 space-y-2.5">
          {evidenceTrail.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/40"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200">
                    {item.source}
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </span>
                </div>
                {item.file && (
                  <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                    {item.file}:{item.line}
                  </span>
                )}
              </div>

              {item.snippet && (
                <div className="mt-1.5 rounded bg-zinc-900 p-2 font-mono text-[11px] text-zinc-200 overflow-x-auto dark:bg-black">
                  <code>{item.snippet}</code>
                </div>
              )}

              <p className="mt-1.5 text-zinc-600 dark:text-zinc-400">{item.implication}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
