import React from 'react';
import { GitBranch, GitCommit, FileCode2, Clock, CheckCircle, ExternalLink, Zap } from 'lucide-react';
import { PullRequestMetadata } from '../types.js';

interface SummaryCardProps {
  pr: PullRequestMetadata;
  telemetry: {
    githubApiMs: number;
    sonarAnalysisMs: number;
    jevInferenceMs: number;
    decisionEngineMs: number;
    totalMs: number;
    dataSource: string;
  };
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ pr, telemetry }) => {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Top Repo & PR Number */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {pr.owner}/{pr.repo}
          </span>
          <span className="font-mono text-sm font-medium text-zinc-400 dark:text-zinc-500">
            #{pr.number}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
              pr.state === 'merged'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                : pr.state === 'closed'
                ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
          >
            {pr.state}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-1 text-[11px] font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            <Zap className="h-3 w-3 text-amber-500" />
            <span>Total pipeline: {telemetry.totalMs}ms</span>
          </span>
          <a
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <span>GitHub PR</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* PR Title & Description */}
      <div className="mt-4">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {pr.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {pr.description || 'No description provided.'}
        </p>
      </div>

      {/* Author & Branches */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <img
            src={pr.author.avatarUrl}
            alt={pr.author.login}
            className="h-5 w-5 rounded-full border border-zinc-200 dark:border-zinc-700"
          />
          <span className="font-medium text-zinc-800 dark:text-zinc-200">@{pr.author.login}</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono">
          <GitBranch className="h-3.5 w-3.5 text-zinc-400" />
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">{pr.baseBranch}</span>
          <span className="text-zinc-400">←</span>
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">{pr.headBranch}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 sm:grid-cols-4 dark:border-zinc-800">
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Files Changed
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {pr.changedFilesCount}
            </span>
            <FileCode2 className="h-4 w-4 text-zinc-400" />
          </div>
        </div>

        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Lines Modified
          </span>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono text-sm font-semibold">
            <span className="text-emerald-600 dark:text-emerald-400">+{pr.additions}</span>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="text-red-600 dark:text-red-400">-{pr.deletions}</span>
          </div>
        </div>

        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Commits
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {pr.commitsCount}
            </span>
            <GitCommit className="h-4 w-4 text-zinc-400" />
          </div>
        </div>

        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Jev Latency
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {telemetry.jevInferenceMs}ms
            </span>
            <span className="text-[10px] text-zinc-500">System 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
