'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Menu, Settings, Layers, History, ChevronLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import SearchPanel from '@/components/panels/SearchPanel';
import ResultsPanel from '@/components/panels/ResultsPanel';
import LayersPanel from '@/components/panels/LayersPanel';
import SettingsPanel from '@/components/panels/SettingsPanel';

export default function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    activePanel,
    setActivePanel,
    currentAnalysis,
  } = useAppStore();

  const panels = {
    search: SearchPanel,
    results: ResultsPanel,
    layers: LayersPanel,
    settings: SettingsPanel,
  };

  const ActivePanelComponent = panels[activePanel];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'fixed top-4 left-4 z-50 p-2.5 rounded-xl glass transition-all duration-300 md:hidden',
          sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
      >
        <Menu className="w-5 h-5 text-slate-300" />
      </button>

      {/* Sidebar container */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 380 : 0,
          opacity: sidebarOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'relative flex flex-col h-full bg-carto-surface/90 backdrop-blur-xl',
          'border-r border-carto-border/50 overflow-hidden z-40',
          'md:relative fixed inset-y-0 left-0'
        )}
      >
        {/* Header */}
        <header className="flex-shrink-0 px-5 py-4 border-b border-carto-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-slate-100">
                  SocialMapper
                </h1>
                <p className="text-xs text-slate-500">Community Accessibility</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Navigation tabs */}
        <nav className="flex-shrink-0 px-3 py-2 border-b border-carto-border/30">
          <div className="flex gap-1">
            <NavButton
              active={activePanel === 'search'}
              onClick={() => setActivePanel('search')}
              icon={<MapPin className="w-4 h-4" />}
              label="Search"
            />
            <NavButton
              active={activePanel === 'results'}
              onClick={() => setActivePanel('results')}
              icon={<History className="w-4 h-4" />}
              label="Results"
              badge={currentAnalysis ? '1' : undefined}
            />
            <NavButton
              active={activePanel === 'layers'}
              onClick={() => setActivePanel('layers')}
              icon={<Layers className="w-4 h-4" />}
              label="Layers"
            />
            <NavButton
              active={activePanel === 'settings'}
              onClick={() => setActivePanel('settings')}
              icon={<Settings className="w-4 h-4" />}
              label="Settings"
            />
          </div>
        </nav>

        {/* Panel content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto"
            >
              <ActivePanelComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="flex-shrink-0 px-5 py-3 border-t border-carto-border/30">
          <div className="flex items-center justify-between text-2xs text-slate-500">
            <span>v1.0.0</span>
            <a
              href="https://github.com/mihiarc/socialmapper"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              GitHub
            </a>
          </div>
        </footer>
      </motion.aside>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

function NavButton({ active, onClick, icon, label, badge }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200',
        active
          ? 'bg-blue-500/20 text-blue-400'
          : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
      )}
    >
      {icon}
      <span className="text-2xs font-medium">{label}</span>
      {badge && (
        <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-blue-500 rounded-full text-2xs text-white font-medium">
          {badge}
        </span>
      )}
    </button>
  );
}
