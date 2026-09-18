/**
 * Vero - Code computes. Static analysis detects. Jev decides.
 * Types for GitHub PR data, SonarQube static analysis, TypeSafe Jev decisions,
 * and Deterministic Decision Engine rules.
 */

export interface PullRequestMetadata {
  url: string;
  owner: string;
  repo: string;
  number: number;
  title: string;
  description: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  baseBranch: string;
  headBranch: string;
  state: 'open' | 'closed' | 'merged';
  createdAt: string;
  updatedAt: string;
  additions: number;
  deletions: number;
  changedFilesCount: number;
  commitsCount: number;
}

export interface PullRequestFile {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  language: string;
  isTestFile: boolean;
  isConfigFile: boolean;
  isSecuritySensitive: boolean;
}

export type SonarSeverity = 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
export type SonarIssueType = 'BUG' | 'VULNERABILITY' | 'CODE_SMELL' | 'SECURITY_HOTSPOT';
export type QualityGateStatus = 'PASSED' | 'FAILED' | 'WARNING';

export interface SonarIssue {
  id: string;
  ruleId: string;
  ruleName: string;
  type: SonarIssueType;
  severity: SonarSeverity;
  file: string;
  line: number;
  effort: string;
  message: string;
  evidenceSnippet?: string;
  remediation?: string;
}

export interface QualityGateCondition {
  metric: string;
  comparator: '>' | '<' | '>=';
  threshold: number;
  actual: number;
  status: QualityGateStatus;
  description: string;
}

export interface SonarQubeAnalysis {
  qualityGate: QualityGateStatus;
  metrics: {
    bugs: number;
    vulnerabilities: number;
    codeSmells: number;
    securityHotspots: number;
    coveragePercent: number;
    duplicatedLinesDensityPercent: number;
    cognitiveComplexity: number;
    technicalDebtMinutes: number;
  };
  conditions: QualityGateCondition[];
  issues: SonarIssue[];
  analyzedFilesCount: number;
  rulesEvaluatedCount: number;
}

// TypeSafe Jev Primitives
export type PRCategory = 'FEATURE' | 'BUG_FIX' | 'REFACTOR' | 'SECURITY' | 'PERFORMANCE' | 'DEPENDENCY' | 'OTHER';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type BinaryChoice = 'YES' | 'NO';

export interface JevChoiceDistribution<T extends string> {
  selected: T;
  probabilities: Record<T, number>;
  confidence: number; // 0 to 1
  entropy?: number;
}

export interface JevDecision {
  model: string;
  inferenceType: 'typesafe_system_one_jev';
  latencyMs: number;
  tokensEvaluated: number;
  category: JevChoiceDistribution<PRCategory>;
  risk: JevChoiceDistribution<RiskLevel>;
  securityConcern: JevChoiceDistribution<BinaryChoice>;
  humanReviewWarranted: JevChoiceDistribution<BinaryChoice>;
  calibratedScore: number; // 0 to 100
  reasoningPointers: string[];
}

export type PolicyEffect = 
  | 'BLOCK_MERGE' 
  | 'REQUIRE_SECURITY_REVIEW' 
  | 'REQUIRE_SENIOR_REVIEW' 
  | 'REQUIRE_TEST_COVERAGE' 
  | 'WARN_HIGH_COMPLEXITY'
  | 'APPROVE_EXPEDITED'
  | 'STANDARD_PEER_REVIEW';

export interface DeterministicPolicyRule {
  id: string;
  name: string;
  conditionDescription: string;
  conditionMet: boolean;
  effect: PolicyEffect;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  reason: string;
  evidenceSources: Array<'GITHUB' | 'SONARQUBE' | 'JEV'>;
  evidenceDetails: string;
}

export interface EvidenceItem {
  id: string;
  category: 'CODE_DIFF' | 'STATIC_ANALYSIS' | 'PROBABILISTIC_DECISION' | 'METADATA';
  source: 'GITHUB' | 'SONARQUBE' | 'JEV' | 'DECISION_ENGINE';
  title: string;
  file?: string;
  line?: number;
  snippet?: string;
  ruleOrModel?: string;
  implication: string;
}

export interface FinalAssessment {
  verdict: 'MERGE_BLOCKED' | 'SECURITY_REVIEW_REQUIRED' | 'SENIOR_REVIEW_REQUIRED' | 'STANDARD_REVIEW_REQUIRED' | 'EXPEDITED_MERGE_OK';
  verdictLabel: string;
  overallRisk: RiskLevel;
  confidencePercent: number;
  summaryStatements: string[];
  recommendedActions: string[];
  activePolicies: DeterministicPolicyRule[];
  evidenceAuditTrail: EvidenceItem[];
}

export interface TrialHistoryItem {
  id: string;
  url: string;
  repo: string;
  number: number;
  title: string;
  timestamp: string;
  verdict: string;
  risk: RiskLevel;
  usedCustomToken: boolean;
}

export interface TrialStatus {
  isUsingCustomToken: boolean;
  trialsUsed: number;
  trialsMax: number;
  trialsRemaining: number;
  coolingPeriodHours: number;
  coolingResetMs: number;
  coolingStart: number;
  distinctPrsAnalyzed: string[];
  usingDefaultTypeSafeKey: boolean;
}

export interface AnalysisResult {
  pullRequest: PullRequestMetadata;
  files: PullRequestFile[];
  sonarQube: SonarQubeAnalysis;
  jev: JevDecision;
  assessment: FinalAssessment;
  trialStatus: TrialStatus;
  telemetry: {
    githubApiMs: number;
    sonarAnalysisMs: number;
    jevInferenceMs: number;
    decisionEngineMs: number;
    totalMs: number;
    analyzedAt: string;
    dataSource: 'github_live_api' | 'verified_public_fixture';
  };
}

export interface BenchmarkComparison {
  name: string;
  description: string;
  precisionRiskPercent: number;
  recallSecurityPercent: number;
  falsePositiveRatePercent: number;
  avgLatencyMs: number;
  costPerAnalysisUsd: number;
  strengths: string[];
  weaknesses: string[];
}

export interface DisagreementScenario {
  id: string;
  title: string;
  prSummary: string;
  sonarFinding: string;
  jevJudgment: string;
  deterministicResolution: string;
  engineeringLesson: string;
}
