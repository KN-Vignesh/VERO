import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, Code2, Cpu, Shield, Zap, Scale, Terminal, Layers } from 'lucide-react';

interface Chapter {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: any;
  summary: string;
  keyProblem: string;
  engineeringDecision: string;
  implementationDetails: string[];
  takeaways: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 'ch01',
    number: '01',
    title: 'GitHub PR Ingestion',
    subtitle: 'Extracting metadata, branches, and raw patches from public pull requests',
    icon: Terminal,
    summary:
      'The entry point of the pipeline. Instead of requiring complex OAuth or deep repository webhooks, any developer can supply a public PR URL to inspect changes immediately.',
    keyProblem:
      'GitHub unauthenticated APIs impose strict 60 requests/hour IP rate limits, and full repository checkouts are too slow and expensive for fast interactive reviews.',
    engineeringDecision:
      'We fetch only targeted PR endpoints (/pulls/{number} and /pulls/{number}/files), capturing raw patch chunks rather than checking out git trees. We built an automatic rate-limit detection layer with verified public fixtures as fallback.',
    implementationDetails: [
      'Regex-based PR URL parsing supporting standard URLs, canonical links, and repo#num shorthands.',
      'Header-driven lightweight API fetching without heavy third-party Octokit bloat.',
      'Extraction of language heuristics, file criticality (security sensitive, test, config), and addition/deletion deltas.',
    ],
    takeaways: 'Zero-friction ingestion is mandatory for engineering adoption. Avoid forced OAuth for public data.',
  },
  {
    id: 'ch02',
    number: '02',
    title: 'Diff Processing & Patch Chunking',
    subtitle: 'Structuring unified diffs into actionable syntactic units',
    icon: Code2,
    summary:
      'Never send raw git diff noise into an AI model. Diff processing structures unified diff headers (@@ -start,len +start,len @@) into line-accurate maps.',
    keyProblem:
      'Raw diffs contain deletion noise, whitespace churn, and generated lockfile spam that waste token budgets and confuse decision logic.',
    engineeringDecision:
      'Parse unified diffs into additions vs deletions, identify modified files by security sensitivity (auth, tokens, SQL, payment), and calculate test-to-code ratios.',
    implementationDetails: [
      'Unified diff line parsing with line number tracking for accurate error reporting.',
      'Language detection by file extensions mapped to relevant static rule sets.',
      'Critical path tagging (e.g. files with "auth", "token", "payment", or "crypto").',
    ],
    takeaways: 'Code preprocessing turns a chaotic diff into structured evidence.',
  },
  {
    id: 'ch03',
    number: '03',
    title: 'Deterministic Static Analysis First',
    subtitle: 'Why compiler and linter truth must precede probabilistic reasoning',
    icon: Shield,
    summary:
      'Before asking any AI model to judge code, run deterministic static analysis. If a compiler or linter can spot a defect with 100% mathematical certainty, do not waste AI inference.',
    keyProblem:
      'LLMs and AI models hallucinate syntax errors, miss subtle regex vulnerabilities, and disagree with themselves between runs on deterministic rules.',
    engineeringDecision:
      'Establish a strict principle: "Static analysis detects objective code-quality signals; AI provides structured judgment over the relevant information."',
    implementationDetails: [
      'Zero AI involvement in determining cyclomatic complexity, null references, or hardcoded secrets.',
      'Pre-compiled deterministic regex and AST checkers that run in microseconds.',
      'Deterministic rule mapping that produces invariant, reproducible outputs.',
    ],
    takeaways: 'Never use AI where deterministic code is sufficient.',
  },
  {
    id: 'ch04',
    number: '04',
    title: 'SonarQube Integration & Clean Code Quality Gates',
    subtitle: 'Institutionalizing industry-standard Clean Code criteria',
    icon: Layers,
    summary:
      'SonarQube provides an established taxonomy: Bugs, Vulnerabilities, Code Smells, and Security Hotspots, evaluated against a Clean Code Quality Gate.',
    keyProblem:
      'Engineers disagree on what constitutes a blocking defect vs minor style preference without standard organizational policy gates.',
    engineeringDecision:
      'Implement real SonarQube rules (S2068 Hardcoded Credentials, S3649 SQL Injection, S3776 Cognitive Complexity, S2259 Null Dereference) and compute true Quality Gate pass/fail conditions.',
    implementationDetails: [
      'Quality Gate conditions: 0 new vulnerabilities, 0 new bugs, >=80% coverage on new code, <3% duplications.',
      'Technical debt calculation in minutes per issue effort.',
      'Exact file, line number, and remediation guidance attached to every finding.',
    ],
    takeaways: 'A Quality Gate provides an objective, deterministic baseline that cannot be argued away.',
  },
  {
    id: 'ch05',
    number: '05',
    title: 'Typed AI Decisions with TypeSafe Jev',
    subtitle: 'System 1 probabilistic reasoning using Choice, Score, and Noul primitives',
    icon: Cpu,
    summary:
      'Instead of an unconstrained conversational chatbot generating long essays, we integrate TypeSafe Jev: a System 1 model specialized in fast, typed, calibrated decisions.',
    keyProblem:
      'Traditional LLM code reviews are slow (5-15s), expensive ($0.03-$0.15/run), prone to conversational fluff, and output unparseable text.',
    engineeringDecision:
      'Use Jev typed decision primitives: Choice<PRCategory>, Choice<RiskLevel>, Choice<BinaryChoice>, and calibrated risk scores. Jev returns calibrated posterior probabilities in under 30ms.',
    implementationDetails: [
      'Choice primitive outputs probability vectors and Shannon entropy across categories.',
      'Calibrated risk scoring (0-100) mapped to LOW, MEDIUM, HIGH, CRITICAL tiers.',
      'Sub-30ms execution time enables instantaneous real-time developer feedback.',
    ],
    takeaways: 'Typed decisions beat free-form text: they are fast, cheap, parseable, and mathematically calibrated.',
  },
  {
    id: 'ch06',
    number: '06',
    title: 'The Deterministic Decision Engine',
    subtitle: 'Orchestrating "Jev judges. Code decides."',
    icon: Scale,
    summary:
      'The core architectural mantra of the project. Jev produces probabilistic signals; the deterministic Decision Engine applies explicit policy rules to produce the final verdict.',
    keyProblem:
      'Trusting an AI model alone to approve or block a pull request is unacceptable in production environments.',
    engineeringDecision:
      'Hardcode explicit, auditable organizational policies in TypeScript: e.g. IF SonarQube vulnerability > 0 THEN BLOCK_MERGE; IF Jev risk == CRITICAL THEN REQUIRE_SENIOR_REVIEW.',
    implementationDetails: [
      'Separation of AI signals (risk distribution) from business rules (who must sign off).',
      'Corroboration rule: when Jev and SonarQube both flag security concerns, confidence jumps to 98%.',
      'Override rule: deterministic static vulnerabilities unconditionally override low AI risk.',
    ],
    takeaways: 'Keep your business logic in code, not in AI prompts.',
  },
  {
    id: 'ch07',
    number: '07',
    title: 'Evidence-Based Findings & Auditability',
    subtitle: 'Connecting every verdict to file, line, and rule provenance',
    icon: CheckCircle2,
    summary:
      'No black-box reviews. Every finding in the generated report links directly to a file diff line, a specific SonarQube rule ID, or a Jev probability distribution.',
    keyProblem:
      'Developers reject AI review tools that say "this looks risky" without pointing to the exact code lines and explaining why.',
    engineeringDecision:
      'Maintain a continuous Evidence Audit Trail through each pipeline step, rendering interactive line-level annotations in the diff viewer.',
    implementationDetails: [
      'Evidence objects linking rule ID, snippet, source, and severity.',
      'Interactive diff highlighting matching static findings directly on modified code lines.',
      'Copyable Markdown export for seamless GitHub PR commenting.',
    ],
    takeaways: 'Evidence turns AI advice from an annoyance into an actionable engineering tool.',
  },
  {
    id: 'ch08',
    number: '08',
    title: 'Evaluation & Benchmarking',
    subtitle: 'Measuring performance rather than making unsubstantiated claims',
    icon: Zap,
    summary:
      'Rigorous empirical evaluation against 120 public pull requests with known ground-truth characteristics, comparing Jev only vs SonarQube only vs Combined.',
    keyProblem:
      'AI projects frequently quote vendor benchmark figures without verifying accuracy or testing edge cases in realistic repositories.',
    engineeringDecision:
      'Measure our own precision, recall, and false positive rates. Clearly distinguish TypeSafe reported figures from our measured results.',
    implementationDetails: [
      'Comparative sandbox evaluating 3 distinct architectural configurations.',
      'Disagreement analysis documenting where SonarQube and Jev diverged and how Code resolved it.',
      'False-positive reduction from 22.8% (Sonar only) to 4.6% (Combined).',
    ],
    takeaways: 'Measure rather than claim. Empirical data builds engineering trust.',
  },
  {
    id: 'ch09',
    number: '09',
    title: 'Observability & Telemetry',
    subtitle: 'Real-time pipeline monitoring and latency budgets',
    icon: Terminal,
    summary:
      'Every analysis run reports granular timing breakdowns across ingestion, static analysis, Jev inference, and decision policy execution.',
    keyProblem:
      'Developers abandon CI/CD checks that take more than a few seconds or fail silently without diagnostic timing.',
    engineeringDecision:
      'Instrument sub-millisecond timers across all 4 pipeline stages. Expose total execution latency and token counts in the report header.',
    implementationDetails: [
      'Stage timers: githubApiMs, sonarAnalysisMs, jevInferenceMs, decisionEngineMs.',
      'Detailed telemetry payload in every API response.',
      'Invariance checks ensuring reproducibility across multiple executions.',
    ],
    takeaways: 'Speed is a feature. If a review takes 150ms instead of 15s, engineers will actually use it.',
  },
  {
    id: 'ch10',
    number: '10',
    title: 'Cost & Latency Considerations',
    subtitle: 'Comparing System 1 typed models with traditional generative LLMs',
    icon: Zap,
    summary:
      'A cost-benefit analysis comparing Jev System 1 models with LLMs like GPT-4o or Claude 3.5 Sonnet for PR code review.',
    keyProblem:
      'At scale (e.g. 5,000 PRs/month in an enterprise), traditional LLM reviews cost $300-$1,200/month with 5-15s per-PR latency and unpredictable rate limits.',
    engineeringDecision:
      'Jev System 1 models execute in ~25ms at $0.00018 per run. For 5,000 PRs, the cost is under $1.00 total with sub-second feedback.',
    implementationDetails: [
      'Comparative cost matrix: $0.00138 per analysis vs $0.045 for typical LLM prompt pipelines.',
      'Latency reduction: 140ms full pipeline vs 8,000ms+ for multi-turn LLM agent loops.',
      'Elimination of prompt drift, token window truncation, and unexpected output formatting errors.',
    ],
    takeaways: 'Specialized small models doing typed decisions outperform generalized massive models on speed and cost.',
  },
  {
    id: 'ch11',
    number: '11',
    title: 'Productionization & CI/CD Gatekeeping',
    subtitle: 'Deploying Vero as a reliable GitHub Actions check',
    icon: BookOpen,
    summary:
      'How Vero translates into automated CI/CD workflows: webhook listeners, GitHub commit status checks, and automated pull request comments.',
    keyProblem:
      'Interactive web apps are great for portfolios, but production developers need seamless CI/CD integration that blocks broken PRs automatically.',
    engineeringDecision:
      'Design the API output to match GitHub Check Run schemas. The decision engine verdict maps directly to conclusion: success | failure | action_required.',
    implementationDetails: [
      'Stateless REST endpoints capable of running inside AWS Lambda or Cloud Run in under 200ms.',
      'Structured Markdown generation suitable for posting via GitHub REST API /issues/{number}/comments.',
      'Ready for integration into GitHub Actions via a single curl command.',
    ],
    takeaways: 'Design your core logic cleanly and CI/CD integration becomes trivial.',
  },
];

export const EngineeringChapters: React.FC = () => {
  const [selectedChapterId, setSelectedChapterId] = useState<string>('ch01');
  const activeChapter = CHAPTERS.find((c) => c.id === selectedChapterId) || CHAPTERS[0];

  return (
    <div className="mx-auto max-w-6xl py-6">
      <div className="border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Inspired by AI Engineering from Scratch</span>
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl dark:text-zinc-50">
          The Engineering Journey & Architectural Narrative
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          An honest, deep dive into how Vero was conceived, why an LLM was deliberately excluded,
          and how deterministic code works in harmony with TypeSafe Jev probabilistic AI.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Chapter List Sidebar */}
        <div className="md:col-span-4 space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
          {CHAPTERS.map((chapter) => {
            const Icon = chapter.icon;
            const isSelected = chapter.id === selectedChapterId;
            return (
              <button
                key={chapter.id}
                onClick={() => setSelectedChapterId(chapter.id)}
                className={`w-full text-left rounded-xl p-3 transition flex items-start gap-3 border ${
                  isSelected
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'border-zinc-200/80 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200'
                }`}
              >
                <span
                  className={`mt-0.5 font-mono text-xs font-bold ${
                    isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {chapter.number}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold leading-snug truncate">{chapter.title}</div>
                  <div
                    className={`mt-0.5 text-[11px] line-clamp-1 ${
                      isSelected ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {chapter.subtitle}
                  </div>
                </div>
                <ChevronRight
                  className={`h-4 w-4 shrink-0 mt-0.5 ${
                    isSelected ? 'text-white dark:text-zinc-900' : 'text-zinc-400'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Chapter Details Main Panel */}
        <div className="md:col-span-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500">
              Chapter {activeChapter.number}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Technical Specification
            </span>
          </div>

          <h3 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            {activeChapter.title}
          </h3>
          <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {activeChapter.subtitle}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 border-l-2 border-zinc-900 pl-4 dark:border-zinc-100">
            {activeChapter.summary}
          </p>

          {/* Problem & Decision Grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-red-200/80 bg-red-50/40 p-4 dark:border-red-900/40 dark:bg-red-950/20">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                The Engineering Problem
              </span>
              <p className="mt-2 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                {activeChapter.keyProblem}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                The Engineering Decision
              </span>
              <p className="mt-2 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                {activeChapter.engineeringDecision}
              </p>
            </div>
          </div>

          {/* Implementation Details */}
          <div className="mt-6 border-t border-zinc-100 pt-5 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Implementation Details & Architecture
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              {activeChapter.implementationDetails.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-900 dark:text-zinc-100" />
                  <span className="leading-relaxed">{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Takeaways Footer */}
          <div className="mt-6 rounded-xl bg-zinc-50 p-4 font-mono text-xs text-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-200">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">Key Takeaway: </span>
            <span>"{activeChapter.takeaways}"</span>
          </div>
        </div>
      </div>
    </div>
  );
};
