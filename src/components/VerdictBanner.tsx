import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, ShieldX, Copy, Check } from 'lucide-react';
import { FinalAssessment } from '../types.js';

interface VerdictBannerProps {
  assessment: FinalAssessment;
  onCopyMarkdown: () => void;
  hasCopied: boolean;
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({
  assessment,
  onCopyMarkdown,
  hasCopied,
}) => {
  const isBlocked =
    assessment.verdict === 'MERGE_BLOCKED' || assessment.verdict === 'SECURITY_REVIEW_REQUIRED';
  const isExpedited = assessment.verdict === 'EXPEDITED_MERGE_OK';

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all ${
        isBlocked
          ? 'border-red-300 bg-red-50/70 text-red-950 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100'
          : isExpedited
          ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100'
          : 'border-amber-300 bg-amber-50/70 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Verdict Title & Status */}
        <div className="flex items-start gap-3.5">
          <div
            className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isBlocked
                ? 'bg-red-600 text-white dark:bg-red-500'
                : isExpedited
                ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                : 'bg-amber-600 text-white dark:bg-amber-500'
            }`}
          >
            {isBlocked ? (
              <ShieldX className="h-5 w-5" />
            ) : isExpedited ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold tracking-tight">
                {assessment.verdictLabel}
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  assessment.overallRisk === 'CRITICAL'
                    ? 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100'
                    : assessment.overallRisk === 'HIGH'
                    ? 'bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-100'
                    : assessment.overallRisk === 'MEDIUM'
                    ? 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100'
                    : 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100'
                }`}
              >
                Risk: {assessment.overallRisk}
              </span>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
                Confidence: {assessment.confidencePercent}%
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
              Evaluated by Deterministic Policy Engine combining SonarQube Clean Code heuristics and TypeSafe Jev System 1 probabilities.
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="shrink-0">
          <button
            id="copy-report-markdown-button"
            onClick={onCopyMarkdown}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {hasCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-zinc-500" />
                <span>Copy Review Markdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Findings */}
      {assessment.summaryStatements.length > 0 && (
        <div className="mt-4 rounded-xl bg-white/60 p-4 backdrop-blur-sm dark:bg-zinc-900/50">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Key Engineering Findings
          </h4>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
            {assessment.summaryStatements.map((statement, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                <span>{statement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Actions */}
      {assessment.recommendedActions.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">Recommended Action:</span>
          {assessment.recommendedActions.map((action, idx) => (
            <span
              key={idx}
              className="rounded-md border border-zinc-300/80 bg-white/80 px-2.5 py-1 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200"
            >
              {action}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
