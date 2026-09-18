import React, { useState } from 'react';
import { FileCode, Plus, Minus, AlertCircle, ShieldAlert, Check } from 'lucide-react';
import { PullRequestFile, SonarIssue } from '../types.js';

interface DiffInspectorProps {
  files: PullRequestFile[];
  sonarIssues: SonarIssue[];
  selectedIssue?: SonarIssue | null;
}

export const DiffInspector: React.FC<DiffInspectorProps> = ({
  files,
  sonarIssues,
  selectedIssue,
}) => {
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);

  const currentFile = files[activeFileIndex] || files[0];
  const fileIssues = sonarIssues.filter((i) => i.file === currentFile?.filename);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              PR Code Diff & Evidence Inspector
            </h3>
            <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {files.length} Files
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Interactive unified diff viewer with line-level static analysis & security annotations.
          </p>
        </div>

        {fileIssues.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:border-red-900 dark:text-red-300">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>{fileIssues.length} issues in this file</span>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* File Navigator Sidebar */}
        <div className="space-y-1.5 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-zinc-100 dark:border-zinc-800 lg:pr-3 pb-3 lg:pb-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Changed Files
          </div>
          <div className="space-y-1 max-h-72 lg:max-h-96 overflow-y-auto">
            {files.map((file, idx) => {
              const issuesInFile = sonarIssues.filter((i) => i.file === file.filename).length;
              return (
                <button
                  key={file.filename}
                  type="button"
                  onClick={() => setActiveFileIndex(idx)}
                  className={`w-full text-left rounded-lg p-2 transition text-xs font-mono flex flex-col gap-1 ${
                    activeFileIndex === idx
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate font-semibold">{file.filename.split('/').pop()}</span>
                    {issuesInFile > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                          activeFileIndex === idx
                            ? 'bg-red-500 text-white'
                            : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {issuesInFile}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] opacity-75">
                    <span className="truncate">{file.filename}</span>
                    <span className="shrink-0 font-mono">
                      +{file.additions}/-{file.deletions}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Diff Content Viewer */}
        <div className="lg:col-span-3">
          {currentFile ? (
            <div className="rounded-xl border border-zinc-200 bg-zinc-950 text-zinc-100 font-mono text-xs overflow-hidden dark:border-zinc-800">
              {/* File header bar */}
              <div className="flex items-center justify-between bg-zinc-900 px-4 py-2 border-b border-zinc-800 text-[11px] text-zinc-400">
                <span className="font-semibold text-zinc-200">{currentFile.filename}</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">+{currentFile.additions}</span>
                  <span className="text-red-400">-{currentFile.deletions}</span>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300 uppercase text-[10px]">
                    {currentFile.language}
                  </span>
                </div>
              </div>

              {/* Code lines */}
              <div className="max-h-96 overflow-y-auto overflow-x-auto p-2">
                {currentFile.patch ? (
                  <pre className="text-[11px] leading-5 font-mono">
                    {currentFile.patch.split('\n').map((line, lineIdx) => {
                      const isHeader = line.startsWith('@@');
                      const isAddition = line.startsWith('+') && !line.startsWith('+++');
                      const isDeletion = line.startsWith('-') && !line.startsWith('---');

                      // Check if any sonar issue points to this line or text
                      const matchedIssue = fileIssues.find((issue) =>
                        issue.evidenceSnippet && line.includes(issue.evidenceSnippet.substring(0, 30))
                      );

                      return (
                        <div key={lineIdx}>
                          <div
                            className={`flex px-2 py-0.5 ${
                              isAddition
                                ? 'bg-emerald-950/40 text-emerald-300'
                                : isDeletion
                                ? 'bg-red-950/40 text-red-300'
                                : isHeader
                                ? 'bg-zinc-900 text-zinc-400 font-bold py-1'
                                : 'text-zinc-400'
                            } ${matchedIssue ? 'ring-1 ring-red-500 bg-red-950/60' : ''}`}
                          >
                            <span className="w-8 shrink-0 select-none text-zinc-600 text-right pr-2">
                              {lineIdx + 1}
                            </span>
                            <span className="select-none w-4 shrink-0 font-bold">
                              {isAddition ? '+' : isDeletion ? '-' : ' '}
                            </span>
                            <span className="whitespace-pre">{line.replace(/^[+-]/, '')}</span>
                          </div>

                          {matchedIssue && (
                            <div className="my-1.5 ml-12 mr-2 rounded-lg border border-red-800 bg-red-950/90 p-2.5 text-red-200 font-sans text-xs">
                              <div className="flex items-center gap-2 font-bold font-mono">
                                <ShieldAlert className="h-4 w-4 text-red-400" />
                                <span>SonarQube [{matchedIssue.ruleId}]: {matchedIssue.ruleName}</span>
                              </div>
                              <p className="mt-1 text-[11px] text-red-100">{matchedIssue.message}</p>
                              {matchedIssue.remediation && (
                                <p className="mt-1 text-[10px] text-red-300">
                                  <strong>Remediation: </strong> {matchedIssue.remediation}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </pre>
                ) : (
                  <div className="p-8 text-center text-zinc-500">
                    Binary file or large patch not previewed inline.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500">No file selected.</div>
          )}
        </div>
      </div>
    </div>
  );
};
