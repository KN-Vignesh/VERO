import React, { useState } from 'react';
import { Search, Sparkles, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PrInputHeroProps {
  onAnalyze: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  currentUrl: string;
}

const PRESET_PRS = [
  {
    id: 'demo-payment',
    label: 'KN-Vignesh/PR-Sentinel-Demo #1',
    description: 'Payment retry + SQL concat + hardcoded token (Critical Vulnerability)',
    url: 'https://github.com/KN-Vignesh/PR-Sentinel-Demo/pull/1',
    tag: 'Security Flaw',
    tagColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
  },
  {
    id: 'demo-react',
    label: 'facebook/react #28271',
    description: 'Scheduler microtask starvation loop fix (Complex Architecture)',
    url: 'https://github.com/facebook/react/pull/28271',
    tag: 'Core Refactor',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  },
  {
    id: 'demo-flask',
    label: 'pallets/flask #5012',
    description: 'Type hint modernization & dependency bump (Low Risk)',
    url: 'https://github.com/pallets/flask/pull/5012',
    tag: 'Low Risk',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  },
];

export const PrInputHero: React.FC<PrInputHeroProps> = ({
  onAnalyze,
  isLoading,
  error,
  currentUrl,
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl || 'https://github.com/KN-Vignesh/PR-Sentinel-Demo/pull/1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || isLoading) return;
    onAnalyze(inputUrl.trim());
  };

  const handleSelectPreset = (url: string) => {
    setInputUrl(url);
    onAnalyze(url);
  };

  return (
    <div className="mx-auto w-full max-w-4xl py-6">
      {/* Title & Philosophy Banner */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          <ShieldCheck className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
          <span>Code computes. Static analysis detects. Jev decides.</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
          AI Pull Request Analysis
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Provide a public GitHub Pull Request URL. Get an evidence-based engineering assessment
          combining real PR diffs, SonarQube static analysis, TypeSafe Jev typed AI choices, and deterministic decision rules.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="pr-url-input" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Public GitHub Pull Request URL
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                id="pr-url-input"
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://github.com/organization/repository/pull/123"
                disabled={isLoading}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 py-3 pl-10 pr-4 text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
              />
            </div>
            <button
              id="analyze-pr-button"
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Analyzing PR...</span>
                </>
              ) : (
                <>
                  <span>Analyze PR</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick Preset PRs */}
          <div className="pt-2">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Or explore with one-click verified samples:
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {PRESET_PRS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  disabled={isLoading}
                  className={`group flex flex-col items-start rounded-lg border p-2.5 text-left transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80 ${
                    inputUrl === preset.url
                      ? 'border-zinc-900 bg-zinc-50/80 ring-1 ring-zinc-900 dark:border-zinc-400 dark:bg-zinc-800'
                      : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-1">
                    <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {preset.label}
                    </span>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium border ${preset.tagColor}`}>
                      {preset.tag}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Loading Progress Stages */}
        {isLoading && (
          <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-zinc-100" />
              <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                Executing 4-Stage Evidence Pipeline...
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-600 sm:grid-cols-4 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>1. GitHub Ingestion</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>2. SonarQube Static</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>3. Jev Decision AI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>4. Policy Rules</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div>
              <p className="font-semibold">Analysis Failed</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
