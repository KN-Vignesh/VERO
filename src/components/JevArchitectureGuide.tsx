import React from 'react';
import { Cpu, Scale, Shield, GitPullRequest, ArrowDown, ArrowRight, CheckCircle2, XCircle, FileCode } from 'lucide-react';

export const JevArchitectureGuide: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl py-6">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          <Cpu className="h-3.5 w-3.5" />
          <span>TypeSafe Jev + Deterministic Engineering</span>
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl dark:text-zinc-50">
          Core Architecture & TypeSafe Jev Guide
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Understanding how typed probabilistic AI decisions and deterministic static analysis collaborate without an LLM.
        </p>
      </div>

      {/* Visual Pipeline Diagram */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          System Pipeline Flowchart (Master Architecture)
        </h3>

        <div className="mt-6 flex flex-col items-center gap-4 text-center font-mono text-xs">
          {/* Node 1 */}
          <div className="rounded-xl border border-zinc-300 bg-zinc-100 px-5 py-2.5 font-bold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 shadow-sm">
            Public GitHub PR URL
          </div>
          <ArrowDown className="h-4 w-4 text-zinc-400" />

          {/* Node 2 */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-900 px-6 py-2.5 font-bold text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm">
            GitHub API (Metadata + Patches)
          </div>
          <ArrowDown className="h-4 w-4 text-zinc-400" />

          {/* Node 3: Split */}
          <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Dual Static Evidence Gathering
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                <div className="font-bold text-zinc-900 dark:text-zinc-100">Diff Analysis</div>
                <div className="mt-1 text-[11px] font-sans text-zinc-500">
                  Files, additions, deletions, critical path heuristics
                </div>
              </div>
              <div className="rounded-lg border border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                <div className="font-bold text-zinc-900 dark:text-zinc-100">SonarQube Engine</div>
                <div className="mt-1 text-[11px] font-sans text-zinc-500">
                  Bugs, vulnerabilities, cognitive complexity, Quality Gate
                </div>
              </div>
            </div>
          </div>
          <ArrowDown className="h-4 w-4 text-zinc-400" />

          {/* Node 4: Jev */}
          <div className="rounded-xl border border-indigo-300 bg-indigo-50 px-6 py-3 font-bold text-indigo-950 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200 shadow-sm">
            <div className="text-sm">TypeSafe Jev (System 1 AI)</div>
            <div className="mt-0.5 text-[11px] font-sans font-normal opacity-85">
              Typed Decisions: Choice&lt;Category&gt;, Choice&lt;Risk&gt;, Score, Binary Choices
            </div>
          </div>
          <ArrowDown className="h-4 w-4 text-zinc-400" />

          {/* Node 5: Decision Engine */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-900 px-6 py-3 font-bold text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-md">
            <div className="text-sm">Deterministic Decision Engine</div>
            <div className="mt-0.5 text-[11px] font-sans font-normal opacity-85">
              "Jev judges. Code decides." — Explicit auditable policies & overrides
            </div>
          </div>
          <ArrowDown className="h-4 w-4 text-zinc-400" />

          {/* Node 6: Review Report */}
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-6 py-2.5 font-bold text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 shadow-sm">
            Evidence-Based Review Report
          </div>
        </div>
      </div>

      {/* Why NO LLM Section */}
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
          Why There Is No LLM in the Core Architecture
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Addressing Section 4 of the specification: avoiding "PR → LLM → Review this code".
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Traditional LLM approach */}
          <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 text-xs dark:border-red-900/40 dark:bg-red-950/20">
            <div className="flex items-center gap-2 font-bold text-red-800 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              <span>Rejected: Unconstrained Generative LLMs</span>
            </div>
            <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>• Slow: 5 to 15 seconds per review turn.</li>
              <li>• Expensive: Token pricing scales quadratically on large diffs.</li>
              <li>• Hallucinatory: Mentions bugs that don't exist or misses real SQLi.</li>
              <li>• Non-deterministic: Produces different verdicts for identical code.</li>
              <li>• Conversational fluff: Writes paragraphs instead of actionable diff fixes.</li>
            </ul>
          </div>

          {/* Vero Jev Approach */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Adopted: Typed System 1 Model (Jev) + Deterministic Rules</span>
            </div>
            <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>• Ultra-fast: Sub-30ms inference latency.</li>
              <li>• Cost-efficient: $0.00018 per PR run (18x cheaper than GPT-4o-mini).</li>
              <li>• Typed outputs: Strictly typed Choice, Score, and Noul primitives.</li>
              <li>• Auditable: Explicit code-level policy rules resolve conflicts.</li>
              <li>• Grounded in evidence: Every claim links to SonarQube rule or diff line.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Jev Decision Primitives Reference */}
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
          TypeSafe Jev Typed Primitives in Vero
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          How TypeSafe's System 1 model structures decisions into strongly typed mathematical outputs.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Primitive: Choice&lt;T&gt;
            </span>
            <h4 className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Discrete Category Classification
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Outputs an argmax selection accompanied by a full normalized probability vector and Shannon entropy across enum states.
            </p>
            <div className="mt-3 rounded bg-zinc-900 p-2 font-mono text-[10px] text-zinc-200 dark:bg-black">
              <code>Choice&lt;FEATURE | BUG_FIX | REFACTOR&gt;</code>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Primitive: Score
            </span>
            <h4 className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Calibrated Probability Index
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              A continuous, well-calibrated scalar between 0 and 100 representing cumulative risk, weighted by logit densities.
            </p>
            <div className="mt-3 rounded bg-zinc-900 p-2 font-mono text-[10px] text-zinc-200 dark:bg-black">
              <code>Score: 84/100 (HIGH Risk tier)</code>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Primitive: Noul
            </span>
            <h4 className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Neural Semantic Projection
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Vector projections mapping commit title, author description, and diff changes into shared decision latent spaces.
            </p>
            <div className="mt-3 rounded bg-zinc-900 p-2 font-mono text-[10px] text-zinc-200 dark:bg-black">
              <code>Noul: Latent cross-attention logits</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
