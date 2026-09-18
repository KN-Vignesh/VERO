import React from 'react';
import { GitPullRequest, BookOpen, BarChart3, Cpu, ExternalLink, ShieldCheck, Briefcase, Key } from 'lucide-react';

export type NavTab = 'analyzer' | 'journey' | 'evaluation' | 'architecture' | 'portfolio';

export interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('analyzer')}
          className="flex cursor-pointer items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
            <GitPullRequest className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Vero
              </span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                TypeSafe Jev + SonarQube
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Code computes. Static analysis detects. Jev decides.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden items-center gap-1 md:flex">
          <button
            id="nav-tab-analyzer"
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'analyzer'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            PR Analyzer
          </button>
          <button
            id="nav-tab-journey"
            onClick={() => setActiveTab('journey')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'journey'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Engineering Journey (11 Ch)
          </button>
          <button
            id="nav-tab-evaluation"
            onClick={() => setActiveTab('evaluation')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'evaluation'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Evaluation & Benchmarks
          </button>
          <button
            id="nav-tab-architecture"
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'architecture'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            <Cpu className="h-4 w-4" />
            Jev & Architecture
          </button>
          <button
            id="nav-tab-portfolio"
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'portfolio'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Portfolio Showcase
          </button>
        </nav>

        {/* Creator Links & Token Settings */}
        <div className="flex items-center gap-2 text-xs">
          {onOpenSettings && (
            <button
              id="navbar-open-token-settings"
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              title="Configure GitHub Token & TypeSafe API Key"
            >
              <Key className="h-3.5 w-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Keys & Tokens</span>
            </button>
          )}
          <a
            id="portfolio-link"
            href="https://kn-vignesh.github.io/Projects/#/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <span>KN-Vignesh</span>
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
          </a>
          <a
            id="github-profile-link"
            href="https://github.com/KN-Vignesh"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg bg-zinc-100 px-2.5 py-1.5 font-medium text-zinc-800 hover:bg-zinc-200 sm:inline-flex dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex border-t border-zinc-200 px-2 py-1.5 md:hidden dark:border-zinc-800 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('analyzer')}
          className={`shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ${
            activeTab === 'analyzer'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          PR Analyzer
        </button>
        <button
          onClick={() => setActiveTab('journey')}
          className={`shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ${
            activeTab === 'journey'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          Journey (11 Ch)
        </button>
        <button
          onClick={() => setActiveTab('evaluation')}
          className={`shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ${
            activeTab === 'evaluation'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          Benchmarks
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ${
            activeTab === 'architecture'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          Jev Guide
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ${
            activeTab === 'portfolio'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          Portfolio
        </button>
      </div>
    </header>
  );
};
