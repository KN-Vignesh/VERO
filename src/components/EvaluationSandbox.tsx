import React, { useState } from 'react';
import { BarChart3, Scale, AlertOctagon, CheckCircle2, ShieldAlert, Cpu, Sparkles, TrendingUp } from 'lucide-react';
import {
  BENCHMARK_CONFIGURATIONS,
  DISAGREEMENT_SCENARIOS,
  TYPESAFE_REPORTED_VS_PROJECT_MEASURED,
} from '../server/evaluationData.js';

export const EvaluationSandbox: React.FC = () => {
  const [selectedDisagreement, setSelectedDisagreement] = useState<string>('DISAGREE-01');

  const currentDisagreement =
    DISAGREEMENT_SCENARIOS.find((d) => d.id === selectedDisagreement) || DISAGREEMENT_SCENARIOS[0];

  return (
    <div className="mx-auto max-w-6xl py-6">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Empirical Measurements • Section 17-19</span>
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl dark:text-zinc-50">
          Evaluation, Benchmarks & Disagreement Analysis
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Comparing <strong>Jev Only</strong> vs <strong>SonarQube Only</strong> vs{' '}
          <strong>Vero (Combined)</strong> across precision, recall, false positive rates, and real production pull requests.
        </p>
      </div>

      {/* 3 Configurations Comparative Matrix */}
      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Architectural Configuration Comparison
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {BENCHMARK_CONFIGURATIONS.map((config, idx) => {
            const isCombined = idx === 2;
            return (
              <div
                key={config.name}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  isCombined
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-md ring-1 ring-zinc-900 dark:ring-zinc-100'
                    : 'border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isCombined
                          ? 'text-zinc-300 dark:text-zinc-600'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      Config 0{idx + 1}
                    </span>
                    {isCombined && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                        Final Architecture
                      </span>
                    )}
                  </div>

                  <h4 className="mt-2 text-base font-bold tracking-tight">{config.name}</h4>
                  <p
                    className={`mt-1 text-xs leading-relaxed ${
                      isCombined
                        ? 'text-zinc-300 dark:text-zinc-600'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {config.description}
                  </p>

                  {/* Key Metrics Grid */}
                  <div className="mt-5 grid grid-cols-2 gap-2.5 font-mono">
                    <div
                      className={`rounded-xl p-2.5 ${
                        isCombined
                          ? 'bg-zinc-800 dark:bg-zinc-200'
                          : 'bg-zinc-50 dark:bg-zinc-800/60'
                      }`}
                    >
                      <span
                        className={`text-[10px] uppercase font-sans font-semibold ${
                          isCombined ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400'
                        }`}
                      >
                        Risk Precision
                      </span>
                      <div className="mt-1 text-lg font-bold">{config.precisionRiskPercent}%</div>
                    </div>

                    <div
                      className={`rounded-xl p-2.5 ${
                        isCombined
                          ? 'bg-zinc-800 dark:bg-zinc-200'
                          : 'bg-zinc-50 dark:bg-zinc-800/60'
                      }`}
                    >
                      <span
                        className={`text-[10px] uppercase font-sans font-semibold ${
                          isCombined ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400'
                        }`}
                      >
                        Security Recall
                      </span>
                      <div className="mt-1 text-lg font-bold">{config.recallSecurityPercent}%</div>
                    </div>

                    <div
                      className={`rounded-xl p-2.5 ${
                        isCombined
                          ? 'bg-zinc-800 dark:bg-zinc-200'
                          : 'bg-zinc-50 dark:bg-zinc-800/60'
                      }`}
                    >
                      <span
                        className={`text-[10px] uppercase font-sans font-semibold ${
                          isCombined ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400'
                        }`}
                      >
                        False Positive
                      </span>
                      <div className="mt-1 text-lg font-bold">
                        {config.falsePositiveRatePercent}%
                      </div>
                    </div>

                    <div
                      className={`rounded-xl p-2.5 ${
                        isCombined
                          ? 'bg-zinc-800 dark:bg-zinc-200'
                          : 'bg-zinc-50 dark:bg-zinc-800/60'
                      }`}
                    >
                      <span
                        className={`text-[10px] uppercase font-sans font-semibold ${
                          isCombined ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400'
                        }`}
                      >
                        Avg Latency
                      </span>
                      <div className="mt-1 text-lg font-bold">{config.avgLatencyMs}ms</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-zinc-200/20 pt-3 text-xs space-y-2">
                  <div className="font-semibold">Key Strengths:</div>
                  <ul className="space-y-1 text-[11px] opacity-90">
                    {config.strengths.slice(0, 2).map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-400" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disagreement Analysis Section (Section 10 & 17) */}
      <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Real Disagreement Scenarios: How "Code Decides"
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Case studies where SonarQube and Jev held opposing assessments, and how deterministic decision policies resolved the conflict.
            </p>
          </div>

          {/* Scenario Selectors */}
          <div className="flex items-center gap-1.5">
            {DISAGREEMENT_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedDisagreement(scenario.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition ${
                  selectedDisagreement === scenario.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {scenario.id}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Scenario Card */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-mono font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {currentDisagreement.id}
            </span>
            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {currentDisagreement.title}
            </h4>
          </div>

          <div className="rounded-xl bg-zinc-50 p-3 text-xs text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">PR Scenario: </span>
            {currentDisagreement.prSummary}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-xs dark:border-red-900/50 dark:bg-red-950/20">
              <div className="flex items-center gap-1.5 font-bold text-red-800 dark:text-red-400">
                <ShieldAlert className="h-4 w-4" />
                <span>SonarQube Finding (Deterministic)</span>
              </div>
              <p className="mt-2 leading-relaxed text-zinc-700 dark:text-zinc-300">
                {currentDisagreement.sonarFinding}
              </p>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 text-xs dark:border-indigo-900/50 dark:bg-indigo-950/20">
              <div className="flex items-center gap-1.5 font-bold text-indigo-800 dark:text-indigo-400">
                <Cpu className="h-4 w-4" />
                <span>TypeSafe Jev Judgment (Probabilistic)</span>
              </div>
              <p className="mt-2 leading-relaxed text-zinc-700 dark:text-zinc-300">
                {currentDisagreement.jevJudgment}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-900 p-4 text-xs text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
            <div className="flex items-center gap-1.5 font-bold">
              <Scale className="h-4 w-4" />
              <span>Deterministic Decision Engine Resolution</span>
            </div>
            <p className="mt-2 leading-relaxed opacity-95">
              {currentDisagreement.deterministicResolution}
            </p>
            <div className="mt-3 border-t border-zinc-700 pt-2 font-mono text-[11px] opacity-80 dark:border-zinc-300">
              <strong>Engineering Principle: </strong>
              {currentDisagreement.engineeringLesson}
            </div>
          </div>
        </div>
      </div>

      {/* Section 18: TypeSafe Reported vs Project Measured */}
      <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Benchmarking Integrity: TypeSafe Reported vs Project Measured
            </h3>
            <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Section 18 Mandate
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Adhering strictly to Master Prompt Principle 7: "Measure rather than claim. Clearly distinguish TypeSafe's reported results vs my project's measured results."
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* TypeSafe Reported */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
              <span>TypeSafe Whitepaper Claims</span>
              <span className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-[10px] dark:bg-zinc-700">
                Vendor Reported
              </span>
            </div>
            <div className="mt-3 space-y-2 font-mono">
              <div className="flex justify-between border-b border-zinc-200/60 pb-1.5 dark:border-zinc-700/60">
                <span className="text-zinc-500">System 1 Latency:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {TYPESAFE_REPORTED_VS_PROJECT_MEASURED.typesafeReported.system1Latency}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/60 pb-1.5 dark:border-zinc-700/60">
                <span className="text-zinc-500">Choice Accuracy:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {TYPESAFE_REPORTED_VS_PROJECT_MEASURED.typesafeReported.choiceAccuracyBenchmark}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/60 pb-1.5 dark:border-zinc-700/60">
                <span className="text-zinc-500">Cost vs Generative LLM:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {TYPESAFE_REPORTED_VS_PROJECT_MEASURED.typesafeReported.costAdvantageOverLlm}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Calibration Error:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {TYPESAFE_REPORTED_VS_PROJECT_MEASURED.typesafeReported.zeroShotCalibrationError}
                </span>
              </div>
            </div>
          </div>

          {/* Project Measured */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between font-bold text-emerald-950 dark:text-emerald-200">
              <span>Vero Independent Measurements</span>
              <span className="rounded bg-emerald-200 px-1.5 py-0.5 font-mono text-[10px] text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
                Verified Experiment
              </span>
            </div>
            <div className="mt-3 space-y-2 font-mono text-zinc-800 dark:text-zinc-200">
              <div className="flex justify-between border-b border-emerald-200/60 pb-1.5 dark:border-emerald-800/60">
                <span className="text-zinc-500 dark:text-zinc-400">Dataset Scope:</span>
                <span className="font-bold">120 Public PRs</span>
              </div>
              <div className="flex justify-between border-b border-emerald-200/60 pb-1.5 dark:border-emerald-800/60">
                <span className="text-zinc-500 dark:text-zinc-400">Measured Latency:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {TYPESAFE_REPORTED_VS_PROJECT_MEASURED.projectMeasured.measuredAvgLatency}
                </span>
              </div>
              <div className="flex justify-between border-b border-emerald-200/60 pb-1.5 dark:border-emerald-800/60">
                <span className="text-zinc-500 dark:text-zinc-400">Combined Precision:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {TYPESAFE_REPORTED_VS_PROJECT_MEASURED.projectMeasured.measuredPrecisionCombined}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Cost Per PR:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {TYPESAFE_REPORTED_VS_PROJECT_MEASURED.projectMeasured.measuredCostPerPr}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
