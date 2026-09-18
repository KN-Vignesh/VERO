import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar.js';
import { PrInputHero } from './components/PrInputHero.js';
import { SummaryCard } from './components/SummaryCard.js';
import { VerdictBanner } from './components/VerdictBanner.js';
import { SonarQubePillar } from './components/SonarQubePillar.js';
import { JevPillar } from './components/JevPillar.js';
import { DecisionEnginePillar } from './components/DecisionEnginePillar.js';
import { DiffInspector } from './components/DiffInspector.js';
import { EngineeringChapters } from './components/EngineeringChapters.js';
import { EvaluationSandbox } from './components/EvaluationSandbox.js';
import { JevArchitectureGuide } from './components/JevArchitectureGuide.js';
import { PortfolioIntegrationGuide } from './components/PortfolioIntegrationGuide.js';
import { TokenSettingsModal } from './components/TokenSettingsModal.js';
import { TrialHistoryBanner } from './components/TrialHistoryBanner.js';
import {
  AnalysisResult,
  SonarIssue,
  DeterministicPolicyRule,
  TrialStatus,
  TrialHistoryItem,
} from './types.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('analyzer');
  const [currentUrl, setCurrentUrl] = useState<string>(
    'https://github.com/KN-Vignesh/PR-Sentinel-Demo/pull/1'
  );
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<SonarIssue | null>(null);
  const [hasCopiedMarkdown, setHasCopiedMarkdown] = useState<boolean>(false);

  // Token & Trial Management States
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [userGithubToken, setUserGithubToken] = useState<string>(() => {
    return localStorage.getItem('prs_user_github_token') || '';
  });
  const [userTypesafeKey, setUserTypesafeKey] = useState<string>(() => {
    return localStorage.getItem('prs_user_typesafe_key') || '';
  });
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [trialHistory, setTrialHistory] = useState<TrialHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('prs_trial_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Unique client session ID for browser persistence
  const [clientSessionId] = useState<string>(() => {
    let sid = localStorage.getItem('prs_client_session_id');
    if (!sid) {
      sid = 'prs_client_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('prs_client_session_id', sid);
    }
    return sid;
  });

  // Save tokens to localStorage
  const handleSaveGithubToken = (token: string) => {
    setUserGithubToken(token);
    if (token) {
      localStorage.setItem('prs_user_github_token', token);
    } else {
      localStorage.removeItem('prs_user_github_token');
    }
    fetchTrialStatus(token, userTypesafeKey);
  };

  const handleSaveTypesafeKey = (key: string) => {
    setUserTypesafeKey(key);
    if (key) {
      localStorage.setItem('prs_user_typesafe_key', key);
    } else {
      localStorage.removeItem('prs_user_typesafe_key');
    }
    fetchTrialStatus(userGithubToken, key);
  };

  // Fetch current trial quota and 24h cooling status
  const fetchTrialStatus = useCallback(
    async (ghToken?: string, tsKey?: string) => {
      try {
        const headers: Record<string, string> = {
          'x-client-session-id': clientSessionId,
        };
        const activeGh = ghToken !== undefined ? ghToken : userGithubToken;
        const activeTs = tsKey !== undefined ? tsKey : userTypesafeKey;
        if (activeGh) headers['x-user-github-token'] = activeGh;
        if (activeTs) headers['x-user-typesafe-key'] = activeTs;

        const res = await fetch('/api/trial-status', { headers });
        if (res.ok) {
          const data: TrialStatus = await res.json();
          setTrialStatus(data);
        }
      } catch (e) {
        console.error('Failed to fetch trial status:', e);
      }
    },
    [clientSessionId, userGithubToken, userTypesafeKey]
  );

  useEffect(() => {
    fetchTrialStatus();
  }, [fetchTrialStatus]);

  // Clear local browser analysis history
  const handleClearHistory = () => {
    setTrialHistory([]);
    localStorage.removeItem('prs_trial_history');
  };

  // Trigger analysis
  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentUrl(url);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-client-session-id': clientSessionId,
      };
      if (userGithubToken) headers['x-user-github-token'] = userGithubToken;
      if (userTypesafeKey) headers['x-user-typesafe-key'] = userTypesafeKey;

      const response = await fetch('/api/analyze-pr', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prUrl: url }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          // Trial quota exceeded
          if (errData.trialsUsed !== undefined) {
            setTrialStatus((prev) =>
              prev
                ? {
                    ...prev,
                    trialsUsed: errData.trialsUsed,
                    coolingResetMs: errData.coolingResetMs || prev.coolingResetMs,
                  }
                : null
            );
          }
          throw new Error(
            errData.error ||
              'Trial limit reached: 3 distinct Pull Requests have been analyzed in this 24-hour cooling period. Specify your GitHub Personal Access Token in Settings for unlimited analyses.'
          );
        }
        throw new Error(errData.error || `HTTP error ${response.status}: Failed to analyze PR`);
      }

      const data: AnalysisResult = await response.json();
      setAnalysis(data);
      if (data.trialStatus) {
        setTrialStatus(data.trialStatus);
      }

      // Add to local browser history
      const historyItem: TrialHistoryItem = {
        id: `${data.pullRequest.owner}-${data.pullRequest.repo}-${data.pullRequest.number}-${Date.now()}`,
        url: data.pullRequest.url,
        repo: `${data.pullRequest.owner}/${data.pullRequest.repo}`,
        number: data.pullRequest.number,
        title: data.pullRequest.title,
        timestamp: new Date().toISOString(),
        verdict: data.assessment.verdictLabel,
        risk: data.assessment.overallRisk,
        usedCustomToken: Boolean(userGithubToken && userGithubToken.trim().length > 0),
      };

      setTrialHistory((prev) => {
        // Filter out prior entry of exact same PR url so latest is on top
        const filtered = prev.filter((item) => item.url.toLowerCase() !== data.pullRequest.url.toLowerCase());
        const updated = [historyItem, ...filtered].slice(0, 30);
        localStorage.setItem('prs_trial_history', JSON.stringify(updated));
        return updated;
      });

      if (activeTab !== 'analyzer') {
        setActiveTab('analyzer');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred during PR analysis');
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial analysis automatically on mount for immediate interactive experience
  useEffect(() => {
    handleAnalyze('https://github.com/KN-Vignesh/PR-Sentinel-Demo/pull/1');
  }, []);

  // Copy Markdown review report
  const handleCopyMarkdown = () => {
    if (!analysis) return;
    const { pullRequest, assessment, sonarQube, jev } = analysis;

    const md = `## Vero Engineering Review

**PR:** [${pullRequest.owner}/${pullRequest.repo} #${pullRequest.number}](${pullRequest.url}) - *${pullRequest.title}*
**Verdict:** **${assessment.verdictLabel}** (Risk: ${assessment.overallRisk} | Confidence: ${assessment.confidencePercent}%)

### Summary Findings
${assessment.summaryStatements.map((s) => `- ${s}`).join('\n')}

### Deterministic Quality Gate (SonarQube)
- **Status:** Quality Gate **${sonarQube.qualityGate}**
- **Vulnerabilities:** ${sonarQube.metrics.vulnerabilities}
- **Bugs:** ${sonarQube.metrics.bugs}
- **Code Smells:** ${sonarQube.metrics.codeSmells} (${sonarQube.metrics.technicalDebtMinutes}m technical debt)
- **Coverage on New Code:** ${sonarQube.metrics.coveragePercent}% (Threshold: >=80%)

### TypeSafe Jev Structured Decisions (System 1)
- **PR Category:** \`${jev.category.selected}\` (${(jev.category.confidence * 100).toFixed(0)}% confidence)
- **Calibrated Risk Score:** ${jev.calibratedScore}/100 (\`${jev.risk.selected}\`)
- **Security Concern:** \`${jev.securityConcern.selected}\` (${(jev.securityConcern.confidence * 100).toFixed(0)}%)
- **Human Review Warranted:** \`${jev.humanReviewWarranted.selected}\`

### Triggered Policy Rules
${assessment.activePolicies
  .filter((r: DeterministicPolicyRule) => r.conditionMet)
  .map((r: DeterministicPolicyRule) => `- [**${r.id}**] ${r.name} → **${r.effect}**: ${r.reason}`)
  .join('\n')}

*Generated in ${analysis.telemetry.totalMs}ms by Vero with zero LLM chat hallucination.*
`;

    navigator.clipboard.writeText(md);
    setHasCopiedMarkdown(true);
    setTimeout(() => setHasCopiedMarkdown(false), 2500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-zinc-900 selection:text-white dark:bg-zinc-950 dark:text-zinc-100">
      {/* Top Navbar with Settings Button */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="px-4 pb-16 pt-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {activeTab === 'analyzer' && (
          <div className="space-y-6">
            {/* Trial Quota, Live 24h Cooling Timer & Browser History Bar */}
            <TrialHistoryBanner
              trialStatus={trialStatus}
              history={trialHistory}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onSelectPr={(url) => handleAnalyze(url)}
              onClearHistory={handleClearHistory}
              userGithubToken={userGithubToken}
              userTypesafeKey={userTypesafeKey}
            />

            {/* PR Ingestion Hero Card */}
            <PrInputHero
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              error={error}
              currentUrl={currentUrl}
            />

            {/* Analysis Results View */}
            {analysis && (
              <div className="space-y-6">
                {/* 1. Final Verdict Banner */}
                <VerdictBanner
                  assessment={analysis.assessment}
                  onCopyMarkdown={handleCopyMarkdown}
                  hasCopied={hasCopiedMarkdown}
                />

                {/* 2. PR Summary & Ingestion Metadata */}
                <SummaryCard pr={analysis.pullRequest} telemetry={analysis.telemetry} />

                {/* 3. Dual Columns: SonarQube & TypeSafe Jev */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <SonarQubePillar
                    sonar={analysis.sonarQube}
                    onSelectIssue={(issue) => {
                      setSelectedIssue(issue);
                    }}
                  />
                  <JevPillar
                    jev={analysis.jev}
                    onOpenExplainer={() => setActiveTab('architecture')}
                  />
                </div>

                {/* 4. Deterministic Decision Engine (Policy Rules & Evidence Trail) */}
                <DecisionEnginePillar
                  policies={analysis.assessment.activePolicies}
                  evidenceTrail={analysis.assessment.evidenceAuditTrail}
                />

                {/* 5. Interactive Diff & Evidence Inspector */}
                <DiffInspector
                  files={analysis.files}
                  sonarIssues={analysis.sonarQube.issues}
                  selectedIssue={selectedIssue}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'journey' && <EngineeringChapters />}

        {activeTab === 'evaluation' && <EvaluationSandbox />}

        {activeTab === 'architecture' && <JevArchitectureGuide />}

        {activeTab === 'portfolio' && <PortfolioIntegrationGuide />}
      </main>

      {/* Token & API Key Configuration Modal */}
      <TokenSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userGithubToken={userGithubToken}
        onSaveGithubToken={handleSaveGithubToken}
        userTypesafeKey={userTypesafeKey}
        onSaveTypesafeKey={handleSaveTypesafeKey}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Vero</span>
            <span>•</span>
            <span>AI Pull Request Analysis Engine</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Code computes. Static analysis detects. Jev decides.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-zinc-600 hover:text-zinc-900 underline dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Token & Key Settings
            </button>
            <span>•</span>
            <span>Crafted for portfolio showcase by </span>
            <a
              href="https://github.com/KN-Vignesh"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-900 underline hover:text-zinc-700 dark:text-zinc-100"
            >
              KN-Vignesh
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
