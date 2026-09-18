import React, { useState } from 'react';
import {
  ShieldAlert,
  Bug,
  Flame,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileCode,
  ExternalLink,
} from 'lucide-react';
import { SonarQubeAnalysis, SonarIssue } from '../types.js';

interface SonarQubePillarProps {
  sonar: SonarQubeAnalysis;
  onSelectIssue?: (issue: SonarIssue) => void;
}

export const SonarQubePillar: React.FC<SonarQubePillarProps> = ({ sonar, onSelectIssue }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showConditions, setShowConditions] = useState<boolean>(false);

  const filteredIssues =
    filterType === 'ALL'
      ? sonar.issues
      : sonar.issues.filter((i) => i.type === filterType || i.severity === filterType);

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'BLOCKER':
        return 'bg-red-600 text-white';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800';
      case 'MAJOR':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
      case 'MINOR':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800';
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header with Quality Gate */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              SonarQube Static Analysis
            </h3>
            <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              Deterministic Rules
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Automated code-quality rules, security vulnerabilities, and Clean Code Quality Gate evaluation.
          </p>
        </div>

        {/* Quality Gate Status Badge */}
        <div
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider ${
            sonar.qualityGate === 'PASSED'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
              : sonar.qualityGate === 'FAILED'
              ? 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
          }`}
        >
          {sonar.qualityGate === 'PASSED' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : sonar.qualityGate === 'FAILED' ? (
            <XCircle className="h-4 w-4 text-red-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          )}
          <span>Quality Gate: {sonar.qualityGate}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Vulnerabilities */}
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Vulnerabilities</span>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                sonar.metrics.vulnerabilities > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-zinc-900 dark:text-zinc-100'
              }`}
            >
              {sonar.metrics.vulnerabilities}
            </span>
            <span className="text-[10px] text-zinc-400">0 allowed</span>
          </div>
        </div>

        {/* Bugs */}
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Bugs</span>
            <Bug className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                sonar.metrics.bugs > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-900 dark:text-zinc-100'
              }`}
            >
              {sonar.metrics.bugs}
            </span>
            <span className="text-[10px] text-zinc-400">0 allowed</span>
          </div>
        </div>

        {/* Code Smells */}
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Code Smells</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {sonar.metrics.codeSmells}
            </span>
            <span className="text-[10px] text-zinc-500">{sonar.metrics.technicalDebtMinutes}m debt</span>
          </div>
        </div>

        {/* Coverage on New Code */}
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Code Coverage</span>
            <FileSpreadsheet className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                sonar.metrics.coveragePercent < 80
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {sonar.metrics.coveragePercent}%
            </span>
            <span className="text-[10px] text-zinc-400">target: ≥80%</span>
          </div>
        </div>
      </div>

      {/* Quality Gate Conditions Toggle */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowConditions(!showConditions)}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <span>{showConditions ? 'Hide' : 'Inspect'} Clean Code Quality Gate Conditions</span>
          {showConditions ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showConditions && (
          <div className="mt-2 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Metric</th>
                  <th className="px-3 py-2 font-medium">Condition</th>
                  <th className="px-3 py-2 font-medium">Actual</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                {sonar.conditions.map((cond, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                    <td className="px-3 py-2 font-sans font-medium text-zinc-800 dark:text-zinc-200">
                      {cond.metric}
                    </td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                      {cond.comparator} {cond.threshold}
                    </td>
                    <td className="px-3 py-2 font-bold text-zinc-900 dark:text-zinc-100">
                      {cond.actual}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          cond.status === 'PASSED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : cond.status === 'FAILED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {cond.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sonar Issues List */}
      <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Detected Static Analysis Findings ({sonar.issues.length})
          </h4>
          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-[11px]">
            {['ALL', 'VULNERABILITY', 'BUG', 'CODE_SMELL', 'SECURITY_HOTSPOT'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterType(f)}
                className={`rounded-lg px-2 py-1 font-medium transition ${
                  filterType === f
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-zinc-200 p-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            No issues found matching current filter.
          </div>
        ) : (
          <div className="mt-3 space-y-2.5">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => onSelectIssue?.(issue)}
                className="group cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getSeverityBadgeClass(
                        issue.severity
                      )}`}
                    >
                      {issue.severity}
                    </span>
                    <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Rule {issue.ruleId}: {issue.ruleName}
                    </span>
                  </div>
                  <span className="rounded bg-zinc-200/70 px-2 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                    Effort: {issue.effort}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1.5 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  <FileCode className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium">{issue.file}</span>
                  <span>:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">L{issue.line}</span>
                </div>

                <p className="mt-1.5 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {issue.message}
                </p>

                {issue.evidenceSnippet && (
                  <div className="mt-2 rounded-lg bg-zinc-900 p-2 font-mono text-[11px] text-zinc-200 overflow-x-auto dark:bg-black">
                    <code>+ {issue.evidenceSnippet}</code>
                  </div>
                )}

                {issue.remediation && (
                  <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Remediation: </span>
                    {issue.remediation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
