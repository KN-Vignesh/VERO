import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  Key,
  History,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { TrialStatus, TrialHistoryItem } from '../types.js';

interface TrialHistoryBannerProps {
  trialStatus: TrialStatus | null;
  history: TrialHistoryItem[];
  onOpenSettings: () => void;
  onSelectPr: (url: string) => void;
  onClearHistory: () => void;
  userGithubToken: string;
  userTypesafeKey: string;
}

export const TrialHistoryBanner: React.FC<TrialHistoryBannerProps> = ({
  trialStatus,
  history,
  onOpenSettings,
  onSelectPr,
  onClearHistory,
  userGithubToken,
  userTypesafeKey,
}) => {
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [remainingTimeText, setRemainingTimeText] = useState<string>('');

  // Live countdown timer for 24-hour cooling window
  useEffect(() => {
    if (!trialStatus || trialStatus.isUsingCustomToken || trialStatus.coolingResetMs <= 0) {
      setRemainingTimeText('');
      return;
    }

    const targetTime = Date.now() + trialStatus.coolingResetMs;

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetTime - now;
      if (diff <= 0) {
        setRemainingTimeText('Ready to reset');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setRemainingTimeText(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [trialStatus]);

  const isCustomToken = Boolean(userGithubToken && userGithubToken.trim().length > 0);
  const trialsUsed = trialStatus ? trialStatus.trialsUsed : 0;
  const trialsMax = trialStatus ? trialStatus.trialsMax : 3;
  const isLimitReached = !isCustomToken && trialsUsed >= trialsMax;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Top Row: Quota Bar & Quick Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Token & Trial Info */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {isCustomToken ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Unlimited Analyses Active (Using Your GitHub Token)</span>
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isLimitReached
                    ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                    : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Demo Quota: {trialsUsed} of {trialsMax} Distinct PRs Used
                </span>
              </span>
            )}

            {/* TypeSafe Notice Pill */}
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-mono text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800">
              <Sparkles className="h-3 w-3" />
              <span>
                TypeSafe: {userTypesafeKey ? 'Custom Key' : 'Default Built-in Key'}
              </span>
            </span>
          </div>

          {/* Subtext description */}
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {isCustomToken ? (
              <span>Your token is applied directly. No limits or cooling delays.</span>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  Using server demo key (max 3 distinct PRs per 24h). Creator token is securely isolated on the server.
                </span>
                {remainingTimeText && (
                  <span className="font-mono font-medium text-amber-700 dark:text-amber-400">
                    • 24h Cooling Reset in: {remainingTimeText}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="open-token-settings-button"
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <Key className="h-3.5 w-3.5 text-zinc-500" />
            <span>{isCustomToken ? 'Token Settings' : 'Specify Your Token (Unlimited)'}</span>
          </button>

          <button
            id="toggle-trial-history-button"
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <History className="h-3.5 w-3.5 text-zinc-500" />
            <span>Browser History ({history.length})</span>
            {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Quota Progress Bar (when using demo mode) */}
      {!isCustomToken && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">
            <span>24-Hour Trial Usage</span>
            <span>
              {trialsUsed} / {trialsMax} Distinct PRs ({Math.max(0, trialsMax - trialsUsed)} remaining)
            </span>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`transition-all duration-500 ${
                trialsUsed >= 3 ? 'bg-red-500' : trialsUsed === 2 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (trialsUsed / trialsMax) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Warning banner if limit reached */}
      {isLimitReached && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold">24-Hour Free Trial Limit Reached</p>
            <p className="mt-0.5 text-[11px]">
              You have analyzed {trialsMax} distinct PRs using the shared demo token. To continue analyzing more pull requests immediately without waiting for the 24-hour cooling reset, please{' '}
              <button
                type="button"
                onClick={onOpenSettings}
                className="font-bold underline hover:text-red-950 dark:hover:text-white"
              >
                specify your own GitHub Personal Access Token
              </button>
              .
            </p>
          </div>
        </div>
      )}

      {/* Expandable Browser Trial History Table */}
      {showHistory && (
        <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Browser Analysis History
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Stored in this browser's session history across tab and window closures.
              </p>
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              No pull requests analyzed in this browser session yet.
            </div>
          ) : (
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-xl border border-zinc-200/70 bg-zinc-50/50 p-3 transition hover:bg-zinc-100/70 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {item.repo} #{item.number}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                          item.risk === 'CRITICAL'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : item.risk === 'HIGH'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                            : item.risk === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {item.risk}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {item.usedCustomToken ? 'Custom Token' : 'Demo Token'}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-zinc-600 dark:text-zinc-300">
                      {item.title}
                    </p>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectPr(item.url)}
                      className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Re-analyze</span>
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      title="Open on GitHub"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
