import { PullRequestMetadata, PullRequestFile } from '../types.js';
import { SAMPLE_PRS } from './sampleFixtures.js';

export interface ParsedPrUrl {
  owner: string;
  repo: string;
  pullNumber: number;
  canonicalUrl: string;
}

export function parseGitHubPrUrl(input: string): ParsedPrUrl | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // Pattern 1: https://github.com/owner/repo/pull/123 or http:// or without scheme
  const standardMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/pull\/(\d+)/i);
  if (standardMatch) {
    const owner = standardMatch[1];
    const repo = standardMatch[2];
    const pullNumber = parseInt(standardMatch[3], 10);
    return {
      owner,
      repo,
      pullNumber,
      canonicalUrl: `https://github.com/${owner}/${repo}/pull/${pullNumber}`,
    };
  }

  // Pattern 2: owner/repo/pull/123 or owner/repo#123
  const shorthandMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/pull\/|#)(\d+)$/i);
  if (shorthandMatch) {
    const owner = shorthandMatch[1];
    const repo = shorthandMatch[2];
    const pullNumber = parseInt(shorthandMatch[3], 10);
    return {
      owner,
      repo,
      pullNumber,
      canonicalUrl: `https://github.com/${owner}/${repo}/pull/${pullNumber}`,
    };
  }

  return null;
}

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript-react',
    js: 'javascript',
    jsx: 'javascript-react',
    cs: 'csharp',
    py: 'python',
    go: 'go',
    rs: 'rust',
    java: 'java',
    rb: 'ruby',
    php: 'php',
    cpp: 'cpp',
    c: 'c',
    h: 'c-header',
    json: 'json',
    yml: 'yaml',
    yaml: 'yaml',
    toml: 'toml',
    md: 'markdown',
    sql: 'sql',
    sh: 'bash',
  };
  return map[ext] || 'plaintext';
}

function isSecuritySensitivePath(path: string): boolean {
  const lower = path.toLowerCase();
  return (
    lower.includes('auth') ||
    lower.includes('token') ||
    lower.includes('secret') ||
    lower.includes('payment') ||
    lower.includes('crypt') ||
    lower.includes('password') ||
    lower.includes('security') ||
    lower.includes('permission') ||
    lower.includes('session') ||
    lower.includes('oauth') ||
    lower.includes('gateway')
  );
}

function isTestPath(path: string): boolean {
  const lower = path.toLowerCase();
  return (
    lower.includes('test') ||
    lower.includes('spec') ||
    lower.includes('__tests__') ||
    lower.endsWith('.test.ts') ||
    lower.endsWith('.spec.ts') ||
    lower.endsWith('test.py') ||
    lower.endsWith('test.go')
  );
}

function isConfigPath(path: string): boolean {
  const lower = path.toLowerCase();
  return (
    lower.endsWith('.json') ||
    lower.endsWith('.yaml') ||
    lower.endsWith('.yml') ||
    lower.endsWith('.toml') ||
    lower.endsWith('.env') ||
    lower.includes('config') ||
    lower.endsWith('dockerfile')
  );
}

export async function fetchPullRequestData(
  parsed: ParsedPrUrl,
  userGithubToken?: string
): Promise<{ metadata: PullRequestMetadata; files: PullRequestFile[]; source: 'github_live_api' | 'verified_public_fixture' }> {
  const key = `${parsed.owner}/${parsed.repo}/pull/${parsed.pullNumber}`;

  // Prioritize user-supplied token; fallback to server environment token
  const token = (userGithubToken && userGithubToken.trim()) || process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Vero-PR-Analysis-Engine/1.0',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }

  try {
    const prRes = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.pullNumber}`, {
      headers,
    });

    if (prRes.ok) {
      const prData = await prRes.json();

      // Fetch files
      let filesData: any[] = [];
      const filesRes = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.pullNumber}/files?per_page=30`,
        { headers }
      );
      if (filesRes.ok) {
        filesData = await filesRes.json();
      }

      const metadata: PullRequestMetadata = {
        url: parsed.canonicalUrl,
        owner: parsed.owner,
        repo: parsed.repo,
        number: parsed.pullNumber,
        title: prData.title || `PR #${parsed.pullNumber}`,
        description: prData.body || 'No description provided by author.',
        author: {
          login: prData.user?.login || 'anonymous',
          avatarUrl: prData.user?.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        },
        baseBranch: prData.base?.ref || 'main',
        headBranch: prData.head?.ref || 'head',
        state: prData.merged_at ? 'merged' : (prData.state === 'closed' ? 'closed' : 'open'),
        createdAt: prData.created_at || new Date().toISOString(),
        updatedAt: prData.updated_at || new Date().toISOString(),
        additions: prData.additions ?? 0,
        deletions: prData.deletions ?? 0,
        changedFilesCount: prData.changed_files ?? filesData.length,
        commitsCount: prData.commits ?? 1,
      };

      const files: PullRequestFile[] = filesData.map((f: any) => ({
        filename: f.filename,
        status: f.status || 'modified',
        additions: f.additions ?? 0,
        deletions: f.deletions ?? 0,
        changes: f.changes ?? ((f.additions || 0) + (f.deletions || 0)),
        patch: f.patch,
        language: detectLanguage(f.filename),
        isTestFile: isTestPath(f.filename),
        isConfigFile: isConfigPath(f.filename),
        isSecuritySensitive: isSecuritySensitivePath(f.filename),
      }));

      return { metadata, files, source: 'github_live_api' };
    }

    // If rate limited or not found, check known fixtures
    if (SAMPLE_PRS[key]) {
      return {
        metadata: SAMPLE_PRS[key].metadata,
        files: SAMPLE_PRS[key].files,
        source: 'verified_public_fixture',
      };
    }

    // If public GitHub hit 403 or 404, throw informative error
    const errorText = await prRes.text();
    if (prRes.status === 403 && errorText.includes('rate limit')) {
      // If we don't have this exact fixture, check case-insensitivity
      const matchedKey = Object.keys(SAMPLE_PRS).find(k => k.toLowerCase() === key.toLowerCase());
      if (matchedKey) {
        return {
          metadata: SAMPLE_PRS[matchedKey].metadata,
          files: SAMPLE_PRS[matchedKey].files,
          source: 'verified_public_fixture',
        };
      }
      throw new Error(`GitHub API rate limit exceeded for unauthenticated requests. You can test with our built-in public sample PRs (e.g., KN-Vignesh/PR-Sentinel-Demo/pull/1 or facebook/react/pull/28271) or add a GITHUB_TOKEN to .env.`);
    }

    throw new Error(`GitHub API returned status ${prRes.status} (${prRes.statusText}) for ${parsed.canonicalUrl}`);
  } catch (err: any) {
    // Check fallback sample
    const matchedKey = Object.keys(SAMPLE_PRS).find(k => k.toLowerCase() === key.toLowerCase());
    if (matchedKey) {
      return {
        metadata: SAMPLE_PRS[matchedKey].metadata,
        files: SAMPLE_PRS[matchedKey].files,
        source: 'verified_public_fixture',
      };
    }
    throw err;
  }
}
