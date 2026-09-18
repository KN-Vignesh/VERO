import {
  PullRequestMetadata,
  PullRequestFile,
  SonarQubeAnalysis,
  JevDecision,
  DeterministicPolicyRule,
  FinalAssessment,
  EvidenceItem,
  RiskLevel,
} from '../types.js';

export function runDeterministicDecisionEngine(
  pr: PullRequestMetadata,
  files: PullRequestFile[],
  sonar: SonarQubeAnalysis,
  jev: JevDecision
): FinalAssessment {
  const policies: DeterministicPolicyRule[] = [];
  const evidenceAuditTrail: EvidenceItem[] = [];

  // Policy 1: SonarQube Vulnerability Check
  const hasVulnerabilities = sonar.metrics.vulnerabilities > 0;
  policies.push({
    id: 'POL-01-SEC-VULN',
    name: 'SonarQube Vulnerability Guard',
    conditionDescription: 'IF SonarQube vulnerability > 0 THEN REQUIRE_SECURITY_REVIEW & BLOCK_MERGE',
    conditionMet: hasVulnerabilities,
    effect: 'REQUIRE_SECURITY_REVIEW',
    severity: 'CRITICAL',
    reason: hasVulnerabilities
      ? `Detected ${sonar.metrics.vulnerabilities} static vulnerability violation(s) (e.g., hardcoded secrets or unparameterized queries).`
      : 'Zero static vulnerabilities detected by SonarQube rules.',
    evidenceSources: ['SONARQUBE'],
    evidenceDetails: hasVulnerabilities
      ? sonar.issues
          .filter((i) => i.type === 'VULNERABILITY')
          .map((i) => `Rule ${i.ruleId} in ${i.file}:${i.line}`)
          .join(', ')
      : 'Zero vulnerabilities on modified lines.',
  });

  // Policy 2: Jev Critical Risk or Sonar Blocker
  const hasSonarBlocker = sonar.issues.some((i) => i.severity === 'BLOCKER');
  const isJevCritical = jev.risk.selected === 'CRITICAL';
  const requiresSeniorReview = hasSonarBlocker || isJevCritical;
  policies.push({
    id: 'POL-02-SENIOR-REVIEW',
    name: 'Critical Architecture & Blocker Escalation',
    conditionDescription: 'IF Jev risk == CRITICAL OR SonarQube Blocker > 0 THEN REQUIRE_SENIOR_REVIEW',
    conditionMet: requiresSeniorReview,
    effect: 'REQUIRE_SENIOR_REVIEW',
    severity: 'HIGH',
    reason: requiresSeniorReview
      ? `Escalation triggered: ${isJevCritical ? 'Jev classified PR risk as CRITICAL' : ''} ${hasSonarBlocker ? 'SonarQube detected BLOCKER-level issue' : ''}.`
      : 'Neither Jev CRITICAL risk nor SonarQube BLOCKER issues detected.',
    evidenceSources: ['JEV', 'SONARQUBE'],
    evidenceDetails: `Jev Risk: ${jev.risk.selected} (${(jev.risk.confidence * 100).toFixed(1)}%), Sonar Blockers: ${sonar.issues.filter((i) => i.severity === 'BLOCKER').length}`,
  });

  // Policy 3: Jev Security Concern + Security Hotspot Corroboration
  const isJevSecurityYes = jev.securityConcern.selected === 'YES';
  const hasHotspots = sonar.metrics.securityHotspots > 0;
  const securityCorroborated = isJevSecurityYes && (hasHotspots || hasVulnerabilities);
  policies.push({
    id: 'POL-03-CORROBORATED-SECURITY',
    name: 'Probabilistic AI + Deterministic Security Corroboration',
    conditionDescription: 'IF Jev security_risk == YES AND (SonarQube hotspots > 0 OR vulnerabilities > 0) THEN BLOCK_MERGE',
    conditionMet: securityCorroborated,
    effect: 'BLOCK_MERGE',
    severity: 'CRITICAL',
    reason: securityCorroborated
      ? 'High-confidence security alert: Jev probabilistic intent classifier and SonarQube static rules both independently flagged security risks.'
      : 'No dual-engine security confirmation required.',
    evidenceSources: ['JEV', 'SONARQUBE'],
    evidenceDetails: `Jev Security Concern: ${jev.securityConcern.selected}, Sonar Hotspots: ${sonar.metrics.securityHotspots}, Vulnerabilities: ${sonar.metrics.vulnerabilities}`,
  });

  // Policy 4: Clean Code Quality Gate Failure
  const isQualityGateFailed = sonar.qualityGate === 'FAILED';
  policies.push({
    id: 'POL-04-QUALITY-GATE',
    name: 'SonarQube Clean Code Quality Gate',
    conditionDescription: 'IF SonarQube Quality Gate == FAILED THEN BLOCK_MERGE',
    conditionMet: isQualityGateFailed,
    effect: 'BLOCK_MERGE',
    severity: 'HIGH',
    reason: isQualityGateFailed
      ? 'Pull request violates organizational Clean Code Quality Gate conditions.'
      : 'Pull request satisfies Clean Code quality thresholds.',
    evidenceSources: ['SONARQUBE'],
    evidenceDetails: sonar.conditions
      .filter((c) => c.status === 'FAILED')
      .map((c) => `${c.metric} (actual: ${c.actual}, threshold: ${c.threshold})`)
      .join('; ') || 'All gate conditions passed',
  });

  // Policy 5: Test Coverage Guard
  const nonTestFiles = files.filter((f) => !f.isTestFile && !f.isConfigFile);
  const codeAdditions = nonTestFiles.reduce((acc, f) => acc + f.additions, 0);
  const testAdditions = files.filter((f) => f.isTestFile).reduce((acc, f) => acc + f.additions, 0);
  const missingTests = codeAdditions > 60 && testAdditions === 0;
  policies.push({
    id: 'POL-05-TEST-COVERAGE',
    name: 'New Code Unit Test Requirement',
    conditionDescription: 'IF code additions > 60 AND test additions == 0 THEN REQUIRE_TEST_COVERAGE',
    conditionMet: missingTests,
    effect: 'REQUIRE_TEST_COVERAGE',
    severity: 'MEDIUM',
    reason: missingTests
      ? `Substantial logic change (+${codeAdditions} lines) introduced without accompanying unit tests.`
      : `Test additions adequate or diff under threshold (+${testAdditions} test lines vs +${codeAdditions} code lines).`,
    evidenceSources: ['GITHUB'],
    evidenceDetails: `Code additions: +${codeAdditions}, Test additions: +${testAdditions}`,
  });

  // Policy 6: Expedited Low-Risk Merge Eligibility
  const isLowRiskExpedited =
    !hasVulnerabilities &&
    !hasSonarBlocker &&
    sonar.qualityGate === 'PASSED' &&
    jev.risk.selected === 'LOW' &&
    jev.securityConcern.selected === 'NO' &&
    pr.additions < 100;

  policies.push({
    id: 'POL-06-EXPEDITED-ELIGIBLE',
    name: 'Expedited Low-Risk Autonomous Path',
    conditionDescription: 'IF Jev risk == LOW AND Jev security == NO AND Sonar Gate == PASSED AND diff < 100 THEN APPROVE_EXPEDITED',
    conditionMet: isLowRiskExpedited,
    effect: 'APPROVE_EXPEDITED',
    severity: 'INFO',
    reason: isLowRiskExpedited
      ? 'Pull request meets all strict criteria for expedited fast-track merging.'
      : 'Change requires standard peer review due to risk classification, diff volume, or static findings.',
    evidenceSources: ['GITHUB', 'SONARQUBE', 'JEV'],
    evidenceDetails: `Diff: +${pr.additions}/-${pr.deletions}, Jev Risk: ${jev.risk.selected}, Sonar Gate: ${sonar.qualityGate}`,
  });

  // Compile Evidence Audit Trail
  // 1. GitHub diff evidence
  evidenceAuditTrail.push({
    id: 'EVID-GH-01',
    category: 'METADATA',
    source: 'GITHUB',
    title: 'Pull Request Scope & Dimensions',
    snippet: `${pr.changedFilesCount} files changed, +${pr.additions} additions, -${pr.deletions} deletions across ${pr.commitsCount} commits`,
    implication: `Base branch: ${pr.baseBranch} ← Head: ${pr.headBranch} by @${pr.author.login}`,
  });

  // 2. SonarQube static evidence
  sonar.issues.forEach((issue, idx) => {
    evidenceAuditTrail.push({
      id: `EVID-SONAR-${idx + 1}`,
      category: 'STATIC_ANALYSIS',
      source: 'SONARQUBE',
      title: `${issue.severity} ${issue.type}: [${issue.ruleId}] ${issue.ruleName}`,
      file: issue.file,
      line: issue.line,
      snippet: issue.evidenceSnippet,
      ruleOrModel: issue.ruleId,
      implication: issue.message,
    });
  });

  // 3. Jev probabilistic evidence
  evidenceAuditTrail.push({
    id: 'EVID-JEV-01',
    category: 'PROBABILISTIC_DECISION',
    source: 'JEV',
    title: `Jev PR Category Decision: ${jev.category.selected}`,
    snippet: `Entropy: ${jev.category.entropy} bits, Confidence: ${(jev.category.confidence * 100).toFixed(1)}%`,
    ruleOrModel: jev.model,
    implication: `Posterior probabilities: ${Object.entries(jev.category.probabilities)
      .map(([k, v]) => `${k}: ${(v * 100).toFixed(0)}%`)
      .join(', ')}`,
  });

  evidenceAuditTrail.push({
    id: 'EVID-JEV-02',
    category: 'PROBABILISTIC_DECISION',
    source: 'JEV',
    title: `Jev Risk Tier Decision: ${jev.risk.selected} (Calibrated Score: ${jev.calibratedScore}/100)`,
    snippet: `Evaluated ${jev.tokensEvaluated} diff tokens in ${jev.latencyMs}ms System 1 inference`,
    ruleOrModel: jev.model,
    implication: `Probability distribution: ${Object.entries(jev.risk.probabilities)
      .map(([k, v]) => `${k}: ${(v * 100).toFixed(0)}%`)
      .join(', ')}`,
  });

  // Synthesize Deterministic Verdict
  let verdict: FinalAssessment['verdict'] = 'STANDARD_REVIEW_REQUIRED';
  let verdictLabel = 'Standard Peer Review Required';
  let overallRisk: RiskLevel = jev.risk.selected;

  if (hasVulnerabilities || securityCorroborated) {
    verdict = 'SECURITY_REVIEW_REQUIRED';
    verdictLabel = 'Merge Blocked: Security Sign-off Required';
    overallRisk = 'CRITICAL';
  } else if (isQualityGateFailed || hasSonarBlocker) {
    verdict = 'MERGE_BLOCKED';
    verdictLabel = 'Merge Blocked: Quality Gate Failed';
    if (overallRisk === 'LOW') overallRisk = 'HIGH';
  } else if (requiresSeniorReview) {
    verdict = 'SENIOR_REVIEW_REQUIRED';
    verdictLabel = 'Senior Staff Architecture Review Required';
  } else if (isLowRiskExpedited) {
    verdict = 'EXPEDITED_MERGE_OK';
    verdictLabel = 'Eligible for Expedited Merge';
    overallRisk = 'LOW';
  }

  // Summary statements based purely on real evidence
  const summaryStatements: string[] = [];
  if (hasVulnerabilities) {
    summaryStatements.push(
      `Detected ${sonar.metrics.vulnerabilities} deterministic security vulnerability violation(s) that directly breach repository security policy.`
    );
  }
  if (isJevSecurityYes) {
    summaryStatements.push(
      `Jev typed probabilistic model flagged high security concern with ${(jev.securityConcern.confidence * 100).toFixed(1)}% certainty.`
    );
  }
  if (sonar.metrics.cognitiveComplexity > 15) {
    summaryStatements.push(
      `Cognitive complexity in modified methods reached ${sonar.metrics.cognitiveComplexity} (threshold: 15), creating long-term maintainability debt.`
    );
  }
  if (missingTests) {
    summaryStatements.push(
      `New business logic added without accompanying regression tests (+${codeAdditions} lines).`
    );
  }
  if (isLowRiskExpedited) {
    summaryStatements.push(
      'Clean static scan with passed Quality Gate and low probabilistic risk classification across all boundary metrics.'
    );
  }

  // Recommended actions
  const recommendedActions: string[] = [];
  if (hasVulnerabilities) {
    recommendedActions.push('Remediate all flagged SonarQube vulnerabilities before re-running review.');
    recommendedActions.push('Extract any hardcoded tokens/secrets to an encrypted vault or environment variables.');
  }
  if (sonar.issues.some((i) => i.ruleId === 'S3649')) {
    recommendedActions.push('Replace string concatenation in SQL queries with parameterized statements.');
  }
  if (missingTests) {
    recommendedActions.push('Add unit tests covering the new branch conditions and error handling paths.');
  }
  if (sonar.qualityGate === 'FAILED') {
    recommendedActions.push('Address Quality Gate failure conditions to satisfy organizational Clean Code baseline.');
  }
  if (recommendedActions.length === 0) {
    recommendedActions.push('Standard single-approver sign-off is sufficient for merge.');
  }

  const activePolicies = policies.filter((p) => p.conditionMet);

  // Confidence percentage
  const confidencePercent = Math.round(
    (jev.risk.confidence * 0.4 + (sonar.qualityGate === 'PASSED' ? 0.95 : 0.98) * 0.6) * 100
  );

  return {
    verdict,
    verdictLabel,
    overallRisk,
    confidencePercent,
    summaryStatements,
    recommendedActions,
    activePolicies,
    evidenceAuditTrail,
  };
}
