'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Layers, MapPin, Grid3X3 } from 'lucide-react';
import { useAppStore, useActiveLayerCount } from '@/lib/store';
import { cn } from '@/lib/utils';

const LAYER_CONFIG = [
  {
    id: 'isochrone',
    name: 'Travel Time Area',
    description: 'Shows reachable area within travel time',
    icon: Layers,
    color: '#3B82F6',
  },
  {
    id: 'census',
    name: 'Census Blocks',
    description: 'Census block group boundaries',
    icon: Grid3X3,
    color: '#8B5CF6',
  },
  {
    id: 'pois',
    name: 'Points of Interest',
    description: 'Discovered locations',
    icon: MapPin,
    color: '#10B981',
  },
];

const MAP_STYLES = [
  { id: 'mapbox://styles/mapbox/dark-v11', name: 'Dark', preview: 'bg-slate-900' },
  { id: 'mapbox://styles/mapbox/light-v11', name: 'Light', preview: 'bg-slate-200' },
  { id: 'mapbox://styles/mapbox/satellite-streets-v12', name: 'Satellite', preview: 'bg-emerald-900' },
  { id: 'mapbox://styles/mapbox/outdoors-v12', name: 'Outdoors', preview: 'bg-green-200' },
];

export default function LayersPanel() {
  const { layers, toggleLayerVisibility, updateLayer, mapStyle, setMapStyle } = useAppStore();
  const activeCount = useActiveLayerCount();

  return (
    <div className="p-5 space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-2xs uppercase tracking-wider text-slate-500 font-medium">Data Layers</label>
          <span className="text-2xs text-slate-500">{activeCount} active</span>
        </div>
        <div className="space-y-2">
          {LAYER_CONFIG.map((config) => {
            const layer = layers.find((l) => l.id === config.id);
            if (!layer) return null;
            const Icon = config.icon;
            return (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'p-4 rounded-xl border transition-all duration-200',
                  layer.visible ? 'bg-carto-elevated/50 border-carto-border/50' : 'bg-carto-surface/30 border-carto-border/20 opacity-60'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}20` }}>
                      <Icon className="w-4 h-4" style={{ color: config.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200">{config.name}</div>
                      <div className="text-2xs text-slate-500">{config.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleLayerVisibility(config.id)}
                    className={cn('p-2 rounded-lg transition-colors', layer.visible ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-500')}
                  >
                    {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                {layer.visible && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-2xs">
                      <span className="text-slate-500">Opacity</span>
                      <span className="text-slate-400">{Math.round(layer.opacity * 100)}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={layer.opacity * 100} onChange={(e) => updateLayer(config.id, { opacity: parseInt(e.target.value) / 100 })} className="w-full" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>
      <section className="space-y-3">
        <label className="text-2xs uppercase tracking-wider text-slate-500 font-medium">Map Style</label>
        <div className="grid grid-cols-2 gap-2">
          {MAP_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setMapStyle(style.id)}
              className={cn('p-3 rounded-xl border transition-all duration-200', mapStyle === style.id ? 'border-blue-500/50 ring-2 ring-blue-500/20' : 'border-carto-border/30 hover:border-carto-border/50')}
            >
              <div className={cn('w-full h-12 rounded-lg mb-2', style.preview)} />
              <div className="text-xs text-slate-300">{style.name}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
