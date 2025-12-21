'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Users,
  Clock,
  Download,
  Layers,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { useAppStore, useHasResults } from '@/lib/store';
import { exportAnalysis } from '@/lib/api';
import {
  cn,
  formatNumber,
  formatCurrency,
  formatArea,
  downloadBlob,
  copyToClipboard,
  getPOIColor,
} from '@/lib/utils';
import type { ExportFormat } from '@/lib/types';

export default function ResultsPanel() {
  const { currentAnalysis, travelTime, travelMode } = useAppStore();
  const hasResults = useHasResults();
  const [expandedSection, setExpandedSection] = useState<string | null>('summary');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!hasResults || !currentAnalysis) {
    return (
      <div className="p-5 flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-carto-elevated/50 border border-carto-border/50 flex items-center justify-center mb-4">
          <Layers className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-sm font-medium text-slate-300 mb-2">No Results Yet</h3>
        <p className="text-2xs text-slate-500 max-w-xs">
          Run an analysis from the Search tab to see results here
        </p>
      </div>
    );
  }

  const { summary, pois, censusBlocks, originName } = currentAnalysis;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportAnalysis(currentAnalysis.id, {
        format: exportFormat,
        includeIsochrone: true,
        includePOIs: true,
        includeCensus: true,
      });
      const filename = `socialmapper-${currentAnalysis.id}.${exportFormat}`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCoordinates = async () => {
    const coords = `${currentAnalysis.origin.lat}, ${currentAnalysis.origin.lng}`;
    const success = await copyToClipboard(coords);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="p-5 space-y-4">
      {/* Location Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{originName}</h2>
          <div className="flex items-center gap-3 mt-1 text-2xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {travelTime} min {travelMode}
            </span>
            <button
              onClick={handleCopyCoordinates}
              className="flex items-center gap-1 hover:text-slate-300 transition-colors"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {currentAnalysis.origin.lat.toFixed(4)}, {currentAnalysis.origin.lng.toFixed(4)}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <CollapsibleSection
        title="Summary"
        expanded={expandedSection === 'summary'}
        onToggle={() => toggleSection('summary')}
      >
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="Population"
            value={formatNumber(summary.totalPopulation)}
            icon={<Users className="w-4 h-4" />}
            color="blue"
          />
          <StatCard
            label="Block Groups"
            value={summary.blockGroupCount.toString()}
            icon={<Layers className="w-4 h-4" />}
            color="slate"
          />
          <StatCard
            label="POIs Found"
            value={summary.poiCount.toString()}
            icon={<MapPin className="w-4 h-4" />}
            color="emerald"
          />
          <StatCard
            label="Area"
            value={formatArea(summary.areaKm2 * 1_000_000)}
            icon={<Layers className="w-4 h-4" />}
            color="amber"
          />
        </div>

        {summary.demographics && (
          <div className="mt-3 pt-3 border-t border-carto-border/30">
            <div className="text-2xs text-slate-500 mb-2">Demographics</div>
            <div className="space-y-1.5">
              {summary.demographics.medianIncome && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Median Income</span>
                  <span className="text-slate-200">
                    {formatCurrency(summary.demographics.medianIncome)}
                  </span>
                </div>
              )}
              {summary.demographics.medianAge && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Median Age</span>
                  <span className="text-slate-200">
                    {summary.demographics.medianAge.toFixed(1)} years
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* POIs Section */}
      <CollapsibleSection
        title={`Points of Interest (${pois.length})`}
        expanded={expandedSection === 'pois'}
        onToggle={() => toggleSection('pois')}
      >
        <div className="space-y-1">
          {pois.slice(0, 10).map((poi, i) => (
            <motion.div
              key={poi.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-carto-elevated/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getPOIColor(poi.category) }}
                />
                <div>
                  <div className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
                    {poi.name}
                  </div>
                  <div className="text-2xs text-slate-500 capitalize">
                    {poi.category.replace('_', ' ')}
                  </div>
                </div>
              </div>
              {poi.distance && (
                <div className="text-2xs text-slate-500 font-mono">
                  {(poi.distance / 1000).toFixed(2)} km
                </div>
              )}
            </motion.div>
          ))}
          {pois.length > 10 && (
            <div className="text-center py-2 text-2xs text-slate-500">
              +{pois.length - 10} more
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Census Blocks Section */}
      <CollapsibleSection
        title={`Census Blocks (${censusBlocks.length})`}
        expanded={expandedSection === 'census'}
        onToggle={() => toggleSection('census')}
      >
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {censusBlocks.slice(0, 15).map((block) => (
            <div
              key={block.geoid}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-carto-elevated/50 transition-colors"
            >
              <div className="text-sm text-slate-400 font-mono">{block.geoid}</div>
              {block.properties.population && (
                <div className="text-2xs text-slate-500">
                  {formatNumber(block.properties.population)} pop
                </div>
              )}
            </div>
          ))}
          {censusBlocks.length > 15 && (
            <div className="text-center py-2 text-2xs text-slate-500">
              +{censusBlocks.length - 15} more
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Export Options */}
      <div className="pt-4 border-t border-carto-border/30 space-y-3">
        <div className="text-2xs uppercase tracking-wider text-slate-500 font-medium">
          Export Data
        </div>
        <div className="flex gap-2">
          {(['csv', 'geojson'] as ExportFormat[]).map((format) => (
            <button
              key={format}
              onClick={() => setExportFormat(format)}
              className={cn(
                'flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all',
                exportFormat === format
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-carto-elevated/50 text-slate-400 border border-carto-border/30 hover:bg-carto-elevated'
              )}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={cn(
            'w-full py-2.5 rounded-lg text-sm font-medium transition-all',
            'flex items-center justify-center gap-2',
            'bg-carto-elevated border border-carto-border/50',
            'hover:bg-slate-700 text-slate-300'
          )}
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="bg-carto-elevated/30 rounded-xl border border-carto-border/30 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-carto-elevated/50 transition-colors"
      >
        <span className="text-sm font-medium text-slate-300">{title}</span>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'slate' | 'emerald' | 'amber';
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-400',
    slate: 'text-slate-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
  };

  return (
    <div className="bg-carto-elevated/50 rounded-lg p-3 border border-carto-border/30">
      <div className="flex items-center gap-2 mb-1">
        <span className={colorClasses[color]}>{icon}</span>
        <span className="text-2xs text-slate-500">{label}</span>
      </div>
      <div className="text-xl font-light text-slate-200">{value}</div>
    </div>
  );
}
