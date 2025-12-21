'use client';

import React, { useState } from 'react';
import { Key, Trash2, RefreshCw, ExternalLink, Github, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function SettingsPanel() {
  const { resetAll, clearHistory, analysisHistory } = useAppStore();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveApiKey = () => {
    if (apiKey) {
      localStorage.setItem('census_api_key', apiKey);
    }
  };

  const handleClearHistory = () => {
    clearHistory();
  };

  const handleResetAll = () => {
    if (confirmReset) {
      resetAll();
      localStorage.removeItem('census_api_key');
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  return (
    <div className="p-5 space-y-6">
      {/* API Configuration */}
      <section className="space-y-3">
        <label className="text-2xs uppercase tracking-wider text-slate-500 font-medium">
          Census API Key
        </label>
        <div className="bg-carto-elevated/30 rounded-xl border border-carto-border/30 p-4 space-y-3">
          <p className="text-2xs text-slate-500">
            Required for live census data. Get a free key from the Census Bureau.
          </p>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Census API key"
              className={cn(
                'w-full pl-10 pr-4 py-2.5 bg-carto-surface/50 border border-carto-border/50',
                'rounded-lg text-sm text-slate-200 placeholder-slate-500',
                'focus:outline-none focus:border-slate-600 transition-colors'
              )}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="text-2xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showApiKey ? 'Hide' : 'Show'} key
            </button>
            <button
              onClick={handleSaveApiKey}
              disabled={!apiKey}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                apiKey
                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              )}
            >
              Save Key
            </button>
          </div>
          <a
            href="https://api.census.gov/data/key_signup.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-2xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Get a free API key
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </section>

      {/* Data Management */}
      <section className="space-y-3">
        <label className="text-2xs uppercase tracking-wider text-slate-500 font-medium">
          Data Management
        </label>
        <div className="space-y-2">
          <button
            onClick={handleClearHistory}
            disabled={analysisHistory.length === 0}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all',
              analysisHistory.length > 0
                ? 'bg-carto-elevated/30 border-carto-border/30 hover:bg-carto-elevated/50'
                : 'bg-carto-surface/20 border-carto-border/20 opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-4 h-4 text-slate-500" />
              <div className="text-left">
                <div className="text-sm text-slate-300">Clear History</div>
                <div className="text-2xs text-slate-500">
                  {analysisHistory.length} saved analyses
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={handleResetAll}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all',
              confirmReset
                ? 'bg-red-500/20 border-red-500/50'
                : 'bg-carto-elevated/30 border-carto-border/30 hover:bg-carto-elevated/50'
            )}
          >
            <div className="flex items-center gap-3">
              <RefreshCw className={cn('w-4 h-4', confirmReset ? 'text-red-400' : 'text-slate-500')} />
              <div className="text-left">
                <div className={cn('text-sm', confirmReset ? 'text-red-400' : 'text-slate-300')}>
                  {confirmReset ? 'Click again to confirm' : 'Reset All Settings'}
                </div>
                <div className="text-2xs text-slate-500">
                  Clear all data and preferences
                </div>
              </div>
            </div>
            {confirmReset && <AlertCircle className="w-4 h-4 text-red-400" />}
          </button>
        </div>
      </section>

      {/* About */}
      <section className="space-y-3">
        <label className="text-2xs uppercase tracking-wider text-slate-500 font-medium">
          About
        </label>
        <div className="bg-carto-elevated/30 rounded-xl border border-carto-border/30 p-4 space-y-4">
          <div>
            <div className="text-sm font-medium text-slate-200">SocialMapper</div>
            <div className="text-2xs text-slate-500">Version 1.0.0</div>
          </div>
          <p className="text-2xs text-slate-500 leading-relaxed">
            A geospatial analysis toolkit for understanding community accessibility
            and demographic patterns through travel-time based analysis.
          </p>
          <div className="flex gap-2">
            <a
              href="https://github.com/mihiarc/socialmapper"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2',
                'bg-carto-surface/50 border border-carto-border/30 rounded-lg',
                'text-xs text-slate-400 hover:text-slate-200 transition-colors'
              )}
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href="https://mihiarc.github.io/socialmapper/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2',
                'bg-carto-surface/50 border border-carto-border/30 rounded-lg',
                'text-xs text-slate-400 hover:text-slate-200 transition-colors'
              )}
            >
              <ExternalLink className="w-4 h-4" />
              Docs
            </a>
          </div>
        </div>
      </section>

      {/* Credits */}
      <section className="text-center space-y-2">
        <p className="text-2xs text-slate-600">
          Data sources: OpenStreetMap, US Census Bureau
        </p>
        <p className="text-2xs text-slate-600">
          MIT License
        </p>
      </section>
    </div>
  );
}
