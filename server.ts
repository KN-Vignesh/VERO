import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { parseGitHubPrUrl, fetchPullRequestData } from './src/server/github.js';
import { runSonarQubeAnalysis } from './src/server/sonarEngine.js';
import { runJevInference } from './src/server/jevEngine.js';
import { runDeterministicDecisionEngine } from './src/server/decisionEngine.js';
import { SAMPLE_PRS } from './src/server/sampleFixtures.js';
import {
  BENCHMARK_CONFIGURATIONS,
  DISAGREEMENT_SCENARIOS,
  TYPESAFE_REPORTED_VS_PROJECT_MEASURED,
} from './src/server/evaluationData.js';
import { AnalysisResult, TrialStatus } from './src/types.js';

// Server-side trial session storage (in-memory, mapped by client session ID / IP)
interface SessionUsage {
  coolingStart: number;
  distinctPrs: Set<string>;
  history: Array<{ url: string; timestamp: number; title: string }>;
}

const sessionStore = new Map<string, SessionUsage>();
const COOLING_PERIOD_MS = 24 * 60 * 60 * 1000; // 24-hour cooling window
const MAX_FREE_DISTINCT_PRS = 3;

function getOrUpdateSession(sessionId: string): SessionUsage {
  let session = sessionStore.get(sessionId);
  const now = Date.now();

  if (!session) {
    session = {
      coolingStart: now,
      distinctPrs: new Set<string>(),
      history: [],
    };
    sessionStore.set(sessionId, session);
    return session;
  }

  // Check if 24-hour cooling period has elapsed
  if (now - session.coolingStart >= COOLING_PERIOD_MS) {
    session.coolingStart = now;
    session.distinctPrs.clear();
  }

  return session;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Vero - Code computes. Static analysis detects. Jev decides.',
      model: 'TypeSafe Jev System 1',
      version: '1.0.0',
    });
  });

  // API Route: Sample PRs
  app.get('/api/sample-prs', (req, res) => {
    const list = Object.entries(SAMPLE_PRS).map(([key, data]) => ({
      key,
      url: data.metadata.url,
      title: data.metadata.title,
      repo: `${data.metadata.owner}/${data.metadata.repo}`,
      number: data.metadata.number,
      author: data.metadata.author.login,
      additions: data.metadata.additions,
      deletions: data.metadata.deletions,
      filesCount: data.metadata.changedFilesCount,
    }));
    res.json(list);
  });

  // API Route: Evaluation & Benchmarking Data
  app.get('/api/evaluation-benchmarks', (req, res) => {
    res.json({
      configurations: BENCHMARK_CONFIGURATIONS,
      disagreements: DISAGREEMENT_SCENARIOS,
      measuredVsReported: TYPESAFE_REPORTED_VS_PROJECT_MEASURED,
    });
  });

  // API Route: Query current trial & token status
  app.get('/api/trial-status', (req, res) => {
    const userGithubToken = (req.headers['x-user-github-token'] as string) || '';
    const userTypesafeKey = (req.headers['x-user-typesafe-key'] as string) || '';
    const sessionId = (req.headers['x-client-session-id'] as string) || req.ip || 'anonymous-client';

    const hasUserToken = Boolean(userGithubToken && userGithubToken.trim().length > 0);
    const hasUserTypesafeKey = Boolean(userTypesafeKey && userTypesafeKey.trim().length > 0);
    const session = getOrUpdateSession(sessionId);

    const coolingResetMs = Math.max(0, session.coolingStart + COOLING_PERIOD_MS - Date.now());

    const status: TrialStatus = {
      isUsingCustomToken: hasUserToken,
      trialsUsed: hasUserToken ? 0 : session.distinctPrs.size,
      trialsMax: MAX_FREE_DISTINCT_PRS,
      trialsRemaining: hasUserToken ? 999 : Math.max(0, MAX_FREE_DISTINCT_PRS - session.distinctPrs.size),
      coolingPeriodHours: 24,
      coolingResetMs: hasUserToken ? 0 : coolingResetMs,
      coolingStart: session.coolingStart,
      distinctPrsAnalyzed: Array.from(session.distinctPrs),
      usingDefaultTypeSafeKey: !hasUserTypesafeKey,
    };

    res.json(status);
  });

  // API Route: Analyze PR
  app.post('/api/analyze-pr', async (req, res) => {
    const startTime = Date.now();
    const { prUrl } = req.body;

    const userGithubToken = (req.headers['x-user-github-token'] as string) || '';
    const userTypesafeKey = (req.headers['x-user-typesafe-key'] as string) || '';
    const sessionId = (req.headers['x-client-session-id'] as string) || req.ip || 'anonymous-client';

    const hasUserGithubToken = Boolean(userGithubToken && userGithubToken.trim().length > 0);
    const hasUserTypesafeKey = Boolean(userTypesafeKey && userTypesafeKey.trim().length > 0);

    if (!prUrl || typeof prUrl !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid public GitHub Pull Request URL.' });
    }

    const parsed = parseGitHubPrUrl(prUrl);
    if (!parsed) {
      return res.status(400).json({
        error:
          'Invalid GitHub Pull Request URL format. Expected format: https://github.com/owner/repository/pull/123 or owner/repository#123',
      });
    }

    // Trial Quota Enforcement if visitor is using the shared server token
    const session = getOrUpdateSession(sessionId);
    const canonicalKey = parsed.canonicalUrl.toLowerCase();
    const alreadyAnalyzedThisPr = session.distinctPrs.has(canonicalKey);

    if (!hasUserGithubToken) {
      if (!alreadyAnalyzedThisPr && session.distinctPrs.size >= MAX_FREE_DISTINCT_PRS) {
        const remainingHours = Math.ceil(
          Math.max(0, session.coolingStart + COOLING_PERIOD_MS - Date.now()) / (1000 * 60 * 60)
        );
        return res.status(429).json({
          error: `24-Hour Free Trial Limit Reached: You have analyzed ${MAX_FREE_DISTINCT_PRS} distinct Pull Requests using the shared demo token. Please provide your own GitHub Personal Access Token in Settings for unlimited analyses, or wait ${remainingHours} hours for the 24-hour cooling window to reset.`,
          trialLimitReached: true,
          coolingResetMs: Math.max(0, session.coolingStart + COOLING_PERIOD_MS - Date.now()),
          trialsUsed: session.distinctPrs.size,
          trialsMax: MAX_FREE_DISTINCT_PRS,
        });
      }
    }

    try {
      // Step 1: GitHub PR Ingestion (uses user's token or secure server-side GITHUB_TOKEN)
      const ghStart = Date.now();
      const { metadata, files, source } = await fetchPullRequestData(
        parsed,
        hasUserGithubToken ? userGithubToken.trim() : undefined
      );
      const ghMs = Date.now() - ghStart;

      // Step 2: SonarQube Deterministic Static Analysis (Zero cost, fully local rules)
      const sonarStart = Date.now();
      const sonarQube = runSonarQubeAnalysis(files);
      const sonarMs = Date.now() - sonarStart;

      // Step 3: TypeSafe Jev Structured Probabilistic Inference
      const jevStart = Date.now();
      const jev = await runJevInference(
        metadata,
        files,
        hasUserTypesafeKey ? userTypesafeKey.trim() : undefined
      );
      const jevMs = Date.now() - jevStart;

      // Step 4: Deterministic Decision Engine ("Jev judges. Code decides.")
      const decisionStart = Date.now();
      const assessment = runDeterministicDecisionEngine(metadata, files, sonarQube, jev);
      const decisionMs = Date.now() - decisionStart;

      const totalMs = Date.now() - startTime;

      // If this was using the free trial and is a distinct PR, record it now
      if (!hasUserGithubToken) {
        if (!alreadyAnalyzedThisPr) {
          if (session.distinctPrs.size === 0) {
            session.coolingStart = Date.now();
          }
          session.distinctPrs.add(canonicalKey);
        }
        session.history.unshift({
          url: parsed.canonicalUrl,
          timestamp: Date.now(),
          title: metadata.title,
        });
      }

      const coolingResetMs = Math.max(0, session.coolingStart + COOLING_PERIOD_MS - Date.now());

      const trialStatus: TrialStatus = {
        isUsingCustomToken: hasUserGithubToken,
        trialsUsed: hasUserGithubToken ? 0 : session.distinctPrs.size,
        trialsMax: MAX_FREE_DISTINCT_PRS,
        trialsRemaining: hasUserGithubToken ? 999 : Math.max(0, MAX_FREE_DISTINCT_PRS - session.distinctPrs.size),
        coolingPeriodHours: 24,
        coolingResetMs: hasUserGithubToken ? 0 : coolingResetMs,
        coolingStart: session.coolingStart,
        distinctPrsAnalyzed: Array.from(session.distinctPrs),
        usingDefaultTypeSafeKey: !hasUserTypesafeKey,
      };

      const result: AnalysisResult = {
        pullRequest: metadata,
        files,
        sonarQube,
        jev,
        assessment,
        trialStatus,
        telemetry: {
          githubApiMs: ghMs,
          sonarAnalysisMs: sonarMs,
          jevInferenceMs: jevMs,
          decisionEngineMs: decisionMs,
          totalMs,
          analyzedAt: new Date().toISOString(),
          dataSource: source,
        },
      };

      res.json(result);
    } catch (err: any) {
      console.error('Analysis error:', err);
      res.status(500).json({
        error: err.message || 'Failed to analyze Pull Request. Please verify the URL is public and accessible.',
      });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vero Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
