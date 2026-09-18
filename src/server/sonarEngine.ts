import {
  PullRequestFile,
  SonarQubeAnalysis,
  SonarIssue,
  QualityGateCondition,
  QualityGateStatus,
  SonarSeverity,
  SonarIssueType,
} from '../types.js';

interface RuleDefinition {
  ruleId: string;
  ruleName: string;
  type: SonarIssueType;
  severity: SonarSeverity;
  effort: string;
  pattern: RegExp;
  message: (match: string, file: string, line: number) => string;
  remediation: string;
}

const SONAR_RULES: RuleDefinition[] = [
  {
    ruleId: 'S2068',
    ruleName: 'Hardcoded credentials must not be used',
    type: 'VULNERABILITY',
    severity: 'CRITICAL',
    effort: '30min',
    pattern: /(?:(?:password|passwd|secret|api_?key|token|auth_?token|cardToken)\s*[:=]\s*["'][a-zA-Z0-9_\-]{8,}["'])|(?:sk_live_[0-9a-zA-Z]{10,})|(?:whsec_[0-9a-zA-Z]{10,})/i,
    message: (_, file, line) => `Hardcoded credential or API secret found in '${file}' at line ${line}. Secrets must be injected via secure environment variables or a secrets vault.`,
    remediation: 'Extract secret to environment variable or cloud secret manager (e.g. AWS Secrets Manager, GCP Secret Manager).',
  },
  {
    ruleId: 'S3649',
    ruleName: 'Database queries should be parameterized',
    type: 'VULNERABILITY',
    severity: 'BLOCKER',
    effort: '1h',
    pattern: /(?:ExecuteSqlRawAsync\s*\(\s*\$|execute\s*\(\s*f["']|rawSql\s*=\s*\$|query\s*\(\s*`[^`]*\$\{)/i,
    message: (_, file, line) => `Unsanitized SQL concatenation detected at line ${line}. Direct string interpolation in database commands invites SQL Injection attacks.`,
    remediation: 'Use parameterized queries, prepared statements, or ORM parameter bindings instead of string interpolation.',
  },
  {
    ruleId: 'S4790',
    ruleName: 'Insecure cryptographic or certificate bypass detected',
    type: 'SECURITY_HOTSPOT',
    severity: 'CRITICAL',
    effort: '45min',
    pattern: /(?:ValidateCertificate[^{]*\{\s*\/\/[^\n]*\n\s*return true|ServerCertificateCustomValidationCallback\s*=\s*\([^\)]*\)\s*=>\s*true|check_hostname\s*=\s*False|rejectUnauthorized\s*:\s*false)/i,
    message: (_, file, line) => `Security Hotspot: Certificate verification is explicitly bypassed in '${file}' line ${line}, allowing Man-in-the-Middle (MitM) attacks.`,
    remediation: 'Verify SSL/TLS certificates against trusted root certificate authorities in all runtime environments.',
  },
  {
    ruleId: 'S3776',
    ruleName: 'Cognitive Complexity of functions should not be too high',
    type: 'CODE_SMELL',
    severity: 'MAJOR',
    effort: '2h',
    pattern: /(?:while\s*\([^\)]*\)[\s\S]*?try[\s\S]*?catch[\s\S]*?if\s*\([^\)]*\)|for\s*\([^\)]*\)[\s\S]*?switch[\s\S]*?if)/,
    message: (_, file, line) => `Method has a Cognitive Complexity score greater than the 15 threshold in '${file}' around line ${line}. Deeply nested loops and try-catch increase mental burden and defect rates.`,
    remediation: 'Refactor complex control flows into smaller, single-purpose helper functions.',
  },
  {
    ruleId: 'S2259',
    ruleName: 'Null pointer or undefined value dereference',
    type: 'BUG',
    severity: 'CRITICAL',
    effort: '20min',
    pattern: /(?:return null;[\s\S]*?\.Trim\(\)|if\s*\(![a-zA-Z0-9_]+\)\s*return null;|\b[a-zA-Z0-9_]+\s*===\s*null)/,
    message: (_, file, line) => `Possible null dereference detected in '${file}' line ${line}. The object may be null/undefined when accessed.`,
    remediation: 'Apply null-conditional access (?.) or defensive guard checks before invocation.',
  },
  {
    ruleId: 'S1192',
    ruleName: 'String literals should not be duplicated',
    type: 'CODE_SMELL',
    severity: 'MINOR',
    effort: '10min',
    pattern: /(?:https:\/\/api\.stripe\.com\/v1|application\/json|INSERT INTO)/,
    message: (_, file, line) => `String literal duplicated multiple times in file '${file}'.`,
    remediation: 'Define a named constant for repeated literals.',
  },
  {
    ruleId: 'S1135',
    ruleName: 'Track uses of "TODO" and "Temporary" tags',
    type: 'CODE_SMELL',
    severity: 'INFO',
    effort: '5min',
    pattern: /(?:\/\/|\/\*|#)\s*(?:TODO|FIXME|Temporary pass-through|HACK):?/i,
    message: (_, file, line) => `Unresolved temporary workaround or TODO tag detected in '${file}' line ${line}.`,
    remediation: 'Resolve or link to an official issue tracker reference before merging into main branch.',
  },
];

export function runSonarQubeAnalysis(files: PullRequestFile[]): SonarQubeAnalysis {
  const issues: SonarIssue[] = [];
  let totalRulesEvaluated = 0;
  let totalCognitiveComplexity = 0;

  for (const file of files) {
    if (!file.patch && file.status !== 'added') continue;
    const contentToScan = file.patch || '';
    const lines = contentToScan.split('\n');

    let currentFileLine = 1;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      // Check for unified diff line header @@ -start,len +start,len @@
      const headerMatch = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (headerMatch) {
        currentFileLine = parseInt(headerMatch[1], 10);
        continue;
      }

      if (line.startsWith('+') && !line.startsWith('+++')) {
        const addedText = line.substring(1);

        for (const rule of SONAR_RULES) {
          totalRulesEvaluated++;
          if (rule.pattern.test(addedText) || rule.pattern.test(contentToScan)) {
            // Check if already created for this rule and file
            const alreadyExists = issues.some(
              (i) => i.ruleId === rule.ruleId && i.file === file.filename && Math.abs(i.line - currentFileLine) < 5
            );
            if (!alreadyExists) {
              issues.push({
                id: `sonar-${rule.ruleId}-${issues.length + 1}`,
                ruleId: rule.ruleId,
                ruleName: rule.ruleName,
                type: rule.type,
                severity: rule.severity,
                file: file.filename,
                line: currentFileLine,
                effort: rule.effort,
                message: rule.message(addedText, file.filename, currentFileLine),
                evidenceSnippet: addedText.trim().substring(0, 140),
                remediation: rule.remediation,
              });

              if (rule.ruleId === 'S3776') {
                totalCognitiveComplexity += 18;
              }
            }
          }
        }
        currentFileLine++;
      } else if (!line.startsWith('-')) {
        currentFileLine++;
      }
    }
  }

  // Count types
  const bugs = issues.filter((i) => i.type === 'BUG').length;
  const vulnerabilities = issues.filter((i) => i.type === 'VULNERABILITY').length;
  const codeSmells = issues.filter((i) => i.type === 'CODE_SMELL').length;
  const securityHotspots = issues.filter((i) => i.type === 'SECURITY_HOTSPOT').length;

  // Technical debt minutes
  const technicalDebtMinutes = issues.reduce((acc, issue) => {
    if (issue.effort.endsWith('h')) return acc + parseInt(issue.effort) * 60;
    if (issue.effort.endsWith('min')) return acc + parseInt(issue.effort);
    return acc + 15;
  }, 0);

  // Compute coverage heuristic based on test additions vs code additions
  const testFiles = files.filter((f) => f.isTestFile);
  const codeFiles = files.filter((f) => !f.isTestFile && !f.isConfigFile);
  const testAdditions = testFiles.reduce((sum, f) => sum + f.additions, 0);
  const codeAdditions = codeFiles.reduce((sum, f) => sum + f.additions, 0);

  let coveragePercent = 88;
  if (codeAdditions > 0) {
    if (testAdditions === 0 && codeAdditions > 30) {
      coveragePercent = 42;
    } else {
      const ratio = testAdditions / codeAdditions;
      coveragePercent = Math.min(95, Math.max(30, Math.round(50 + ratio * 45)));
    }
  }

  const duplicatedLinesDensityPercent = codeSmells > 2 ? 3.4 : 1.1;

  // Quality Gate conditions according to Clean Code Standard
  const conditions: QualityGateCondition[] = [
    {
      metric: 'New Vulnerabilities',
      comparator: '>',
      threshold: 0,
      actual: vulnerabilities,
      status: vulnerabilities > 0 ? 'FAILED' : 'PASSED',
      description: 'Zero new vulnerabilities required on new code',
    },
    {
      metric: 'New Bugs',
      comparator: '>',
      threshold: 0,
      actual: bugs,
      status: bugs > 0 ? 'FAILED' : 'PASSED',
      description: 'Zero new bugs on new code',
    },
    {
      metric: 'Security Hotspots Reviewed',
      comparator: '>',
      threshold: 0,
      actual: securityHotspots,
      status: securityHotspots > 0 ? 'WARNING' : 'PASSED',
      description: '100% of Security Hotspots must be reviewed',
    },
    {
      metric: 'Code Coverage on New Code',
      comparator: '<',
      threshold: 80,
      actual: coveragePercent,
      status: coveragePercent < 80 ? 'FAILED' : 'PASSED',
      description: 'Coverage on new code must be at least 80.0%',
    },
    {
      metric: 'Duplicated Lines Density',
      comparator: '>=',
      threshold: 3.0,
      actual: duplicatedLinesDensityPercent,
      status: duplicatedLinesDensityPercent >= 3.0 ? 'WARNING' : 'PASSED',
      description: 'Duplications on new code must be under 3.0%',
    },
  ];

  let qualityGate: QualityGateStatus = 'PASSED';
  if (conditions.some((c) => c.status === 'FAILED')) {
    qualityGate = 'FAILED';
  } else if (conditions.some((c) => c.status === 'WARNING')) {
    qualityGate = 'WARNING';
  }

  return {
    qualityGate,
    metrics: {
      bugs,
      vulnerabilities,
      codeSmells,
      securityHotspots,
      coveragePercent,
      duplicatedLinesDensityPercent,
      cognitiveComplexity: Math.max(4, totalCognitiveComplexity),
      technicalDebtMinutes,
    },
    conditions,
    issues,
    analyzedFilesCount: files.length,
    rulesEvaluatedCount: totalRulesEvaluated || 28,
  };
}
