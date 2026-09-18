import React, { useState } from 'react';
import { Key, Shield, AlertCircle, Check, X, ExternalLink, RefreshCw } from 'lucide-react';

interface TokenSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGithubToken: string;
  onSaveGithubToken: (token: string) => void;
  userTypesafeKey: string;
  onSaveTypesafeKey: (key: string) => void;
}

export const TokenSettingsModal: React.FC<TokenSettingsModalProps> = ({
  isOpen,
  onClose,
  userGithubToken,
  onSaveGithubToken,
  userTypesafeKey,
  onSaveTypesafeKey,
}) => {
  const [ghTokenInput, setGhTokenInput] = useState(userGithubToken);
  const [tsKeyInput, setTsKeyInput] = useState(userTypesafeKey);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGithubToken(ghTokenInput.trim());
    onSaveTypesafeKey(tsKeyInput.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleClearGithub = () => {
    setGhTokenInput('');
    onSaveGithubToken('');
  };

  const handleClearTypesafe = () => {
    setTsKeyInput('');
    onSaveTypesafeKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <Key className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              API Keys & Token Settings
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Configure your credentials for unlimited analyses and customized inference.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* GitHub Token Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="user-github-token-input"
                className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
              >
                GitHub Personal Access Token (Optional)
              </label>
              {userGithubToken && (
                <button
                  type="button"
                  onClick={handleClearGithub}
                  className="text-[11px] text-red-600 hover:underline dark:text-red-400"
                >
                  Clear Token
                </button>
              )}
            </div>

            <div className="relative">
              <input
                id="user-github-token-input"
                type="password"
                value={ghTokenInput}
                onChange={(e) => setGhTokenInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50/70 py-2.5 px-3.5 font-mono text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
              />
            </div>

            <div className="rounded-lg bg-zinc-50 p-3 text-[11px] text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300 space-y-1">
              <div className="flex items-start gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-600" />
                <span>Unlimited Analyses vs 3-Trial Demo Mode:</span>
              </div>
              <p>
                • <strong>With your token:</strong> Unlimited PR analyses with 5,000 GitHub requests/hour.
              </p>
              <p>
                • <strong>Without your token:</strong> The server uses the creator's demo token with a limit of <strong>3 distinct PRs per 24-hour cooling window</strong> per browser session.
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 italic">
                * Note: The creator's token is stored securely on the server and is never transmitted or visible to the browser.
              </p>
            </div>
          </div>

          {/* TypeSafe API Key Section */}
          <div className="space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label
                htmlFor="user-typesafe-key-input"
                className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
              >
                TypeSafe Jev API Key (Optional)
              </label>
              {userTypesafeKey && (
                <button
                  type="button"
                  onClick={handleClearTypesafe}
                  className="text-[11px] text-red-600 hover:underline dark:text-red-400"
                >
                  Clear Key
                </button>
              )}
            </div>

            <div className="relative">
              <input
                id="user-typesafe-key-input"
                type="password"
                value={tsKeyInput}
                onChange={(e) => setTsKeyInput(e.target.value)}
                placeholder="ts_xxxxxxxxxxxxxxxxxxxx"
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50/70 py-2.5 px-3.5 font-mono text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
              />
            </div>

            {/* Explicit Notice as requested */}
            <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 text-[11px] text-indigo-950 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-200">
              <p className="font-semibold">Default Key Notice:</p>
              <p className="mt-0.5 leading-relaxed">
                If you do not specify your own TypeSafe API key, <strong>the default built-in system key will automatically be used</strong> for Jev System 1 probabilistic inference. You only need to enter a key if you have your own TypeSafe Console account.
              </p>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-500">
              Saved strictly in your browser's <code className="font-mono">localStorage</code>.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-200 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {saveSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Settings</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
