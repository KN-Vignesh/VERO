import React from 'react';
import { Cpu, Zap, Activity, Info, HelpCircle } from 'lucide-react';
import { JevDecision } from '../types.js';

interface JevPillarProps {
  jev: JevDecision;
  onOpenExplainer?: () => void;
}

export const JevPillar: React.FC<JevPillarProps> = ({ jev, onOpenExplainer }) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900';
      case 'MEDIUM':
        return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900';
      default:
        return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900';
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              TypeSafe Jev Structured Decisions
            </h3>
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-mono text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
              System 1 Model
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Typed decision primitives (Choice & Score) with calibrated probabilities — zero LLM chat hallucination.
          </p>
        </div>

        {/* Telemetry pill */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
            <Zap className="h-3 w-3 text-amber-500" />
            <span>{jev.latencyMs}ms inference</span>
          </span>
          <span className="rounded-md bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
            {jev.tokensEvaluated} tokens
          </span>
          {onOpenExplainer && (
            <button
              onClick={onOpenExplainer}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              title="What is TypeSafe Jev?"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Decision Primitives Grid */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Decision 1: PR Category (Choice) */}
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Primitive: Choice&lt;PRCategory&gt;
            </span>
            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {(jev.category.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {jev.category.selected}
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              Entropy: {jev.category.entropy} bits
            </span>
          </div>

          {/* Probability Distribution */}
          <div className="mt-3 space-y-1.5">
            {Object.entries(jev.category.probabilities)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 4)
              .map(([cat, prob]) => (
                <div key={cat} className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between font-mono">
                    <span className="text-zinc-600 dark:text-zinc-400">{cat}</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-200">
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className="h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                      style={{ width: `${prob * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Decision 2: Risk Level (Score / Choice) */}
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Primitive: Choice&lt;RiskLevel&gt;
            </span>
            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Score: {jev.calibratedScore}/100
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span
              className={`rounded-lg border px-2.5 py-1 text-sm font-bold tracking-wide ${getRiskColor(
                jev.risk.selected
              )}`}
            >
              {jev.risk.selected}
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              Confidence: {(jev.risk.confidence * 100).toFixed(1)}%
            </span>
          </div>

          {/* Probability Distribution */}
          <div className="mt-3 space-y-1.5">
            {Object.entries(jev.risk.probabilities).map(([level, prob]) => (
              <div key={level} className="space-y-0.5 text-[11px]">
                <div className="flex justify-between font-mono">
                  <span className="text-zinc-600 dark:text-zinc-400">{level}</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-200">
                    {(prob * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className={`h-1.5 rounded-full ${
                      level === 'CRITICAL'
                        ? 'bg-red-600'
                        : level === 'HIGH'
                        ? 'bg-orange-500'
                        : level === 'MEDIUM'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${prob * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decision 3: Security Concern (Binary Choice) */}
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Primitive: Choice&lt;Binary&gt;
            </span>
            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {(jev.securityConcern.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-500">Security Concern:</div>
              <div
                className={`text-xl font-bold ${
                  jev.securityConcern.selected === 'YES'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {jev.securityConcern.selected}
              </div>
            </div>
            <div className="text-right font-mono text-xs text-zinc-600 dark:text-zinc-400">
              <div>YES: {(jev.securityConcern.probabilities.YES * 100).toFixed(1)}%</div>
              <div>NO: {(jev.securityConcern.probabilities.NO * 100).toFixed(1)}%</div>
            </div>
          </div>

          <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="bg-red-500"
              style={{ width: `${jev.securityConcern.probabilities.YES * 100}%` }}
            />
            <div
              className="bg-emerald-500"
              style={{ width: `${jev.securityConcern.probabilities.NO * 100}%` }}
            />
          </div>
        </div>

        {/* Decision 4: Human Review Warranted (Binary Choice) */}
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Primitive: Choice&lt;Binary&gt;
            </span>
            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {(jev.humanReviewWarranted.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-500">Human Review Warranted:</div>
              <div
                className={`text-xl font-bold ${
                  jev.humanReviewWarranted.selected === 'YES'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {jev.humanReviewWarranted.selected}
              </div>
            </div>
            <div className="text-right font-mono text-xs text-zinc-600 dark:text-zinc-400">
              <div>YES: {(jev.humanReviewWarranted.probabilities.YES * 100).toFixed(1)}%</div>
              <div>NO: {(jev.humanReviewWarranted.probabilities.NO * 100).toFixed(1)}%</div>
            </div>
          </div>

          <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="bg-amber-500"
              style={{ width: `${jev.humanReviewWarranted.probabilities.YES * 100}%` }}
            />
            <div
              className="bg-emerald-500"
              style={{ width: `${jev.humanReviewWarranted.probabilities.NO * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Structured Reasoning Pointers */}
      <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Structured Context Evaluated
        </h4>
        <div className="mt-2.5 space-y-1 text-xs font-mono text-zinc-600 dark:text-zinc-400">
          {jev.reasoningPointers.map((pointer, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-indigo-500">▸</span>
              <span>{pointer}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
