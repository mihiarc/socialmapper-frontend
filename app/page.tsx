'use client';

import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// Dynamic import for Map to avoid SSR issues with Mapbox
const Map = dynamic(() => import('@/components/map/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-carto-bg">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Loading map...</span>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const { currentAnalysis, travelTime, travelMode, sidebarOpen } = useAppStore();

  return (
    <div className="h-screen w-full flex overflow-hidden bg-carto-bg">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 relative">
        {/* Map */}
        <Map className="absolute inset-0" />

        {/* Bottom info bar - shows when analysis is complete */}
        {currentAnalysis && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <div
              className={cn(
                'px-5 py-2.5 bg-carto-surface/90 backdrop-blur-sm',
                'border border-carto-border/50 rounded-full',
                'flex items-center gap-5 shadow-xl animate-fade-in'
              )}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-sm text-slate-300">
                  {currentAnalysis.originName}
                </span>
              </div>
              <div className="w-px h-4 bg-carto-border" />
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-slate-400">
                  {travelTime}min {travelMode}
                </span>
              </div>
              <div className="w-px h-4 bg-carto-border" />
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-slate-400">
                  {currentAnalysis.summary.totalPopulation.toLocaleString()} people
                </span>
              </div>
              <div className="w-px h-4 bg-carto-border" />
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-slate-400">
                  {currentAnalysis.summary.poiCount} POIs
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Expand sidebar button when collapsed */}
        {!sidebarOpen && (
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => useAppStore.getState().setSidebarOpen(true)}
              className={cn(
                'p-3 rounded-xl bg-carto-surface/90 backdrop-blur-sm',
                'border border-carto-border/50 shadow-lg',
                'hover:bg-carto-elevated transition-colors'
              )}
            >
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
