'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, MapPin, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, useIsReadyToAnalyze } from '@/lib/store';
import { geocode, runAnalysis } from '@/lib/api';
import { cn, debounce } from '@/lib/utils';
import { POI_CATEGORIES, TRAVEL_MODES } from '@/lib/types';
import type { GeocodingResult, POICategory, TravelMode } from '@/lib/types';

// Icon mapping
import {
  BookOpen,
  Building2,
  Stethoscope,
  GraduationCap,
  ShoppingCart,
  TreePine,
  Utensils,
  Coffee,
  Bus,
  Pill,
} from 'lucide-react';

const ICONS: Record<string, React.ElementType> = {
  BookOpen,
  Building2,
  Stethoscope,
  GraduationCap,
  ShoppingCart,
  TreePine,
  Utensils,
  Coffee,
  Bus,
  Pill,
};

export default function SearchPanel() {
  const {
    location,
    setLocation,
    coordinates,
    setCoordinates,
    travelMode,
    setTravelMode,
    travelTime,
    setTravelTime,
    selectedCategories,
    toggleCategory,
    setCurrentAnalysis,
    addToHistory,
    setLoading,
    setError,
    isLoading,
    setActivePanel,
  } = useAppStore();

  const isReady = useIsReadyToAnalyze();
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced geocoding
  const debouncedGeocode = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsGeocoding(true);
      try {
        const results = await geocode(query);
        setSuggestions(results);
      } catch (err) {
        console.error('Geocoding error:', err);
        setSuggestions([]);
      } finally {
        setIsGeocoding(false);
      }
    }, 300),
    []
  );

  // Handle location input change
  const handleLocationChange = (value: string) => {
    setLocation(value);
    // Clear coordinates when location text changes (will be re-geocoded on analysis)
    setCoordinates(null);
    setShowSuggestions(true);
    debouncedGeocode(value);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (result: GeocodingResult) => {
    setLocation(result.displayName);
    setCoordinates(result.coordinates);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Run analysis
  const handleRunAnalysis = async () => {
    if (!isReady) return;

    setLoading(true);
    setError(null);

    try {
      // If coordinates aren't set, geocode the location first
      let analysisLocation: typeof coordinates | string = coordinates;

      if (!analysisLocation && location) {
        try {
          const geocodeResults = await geocode(location);
          if (geocodeResults.length > 0) {
            analysisLocation = geocodeResults[0].coordinates;
            // Update store with geocoded coordinates
            setCoordinates(geocodeResults[0].coordinates);
          } else {
            throw new Error(`Could not find location: ${location}`);
          }
        } catch (geocodeErr) {
          throw new Error(`Geocoding failed: ${geocodeErr instanceof Error ? geocodeErr.message : 'Unknown error'}`);
        }
      }

      if (!analysisLocation) {
        throw new Error('Please enter a valid location');
      }

      const result = await runAnalysis({
        location: analysisLocation,
        travelMode,
        travelTime,
        poiCategories: selectedCategories,
      });

      setCurrentAnalysis(result);
      addToHistory(result);
      setActivePanel('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick location suggestions
  const quickLocations = [
    'Chapel Hill, NC',
    'Durham, NC',
    'Raleigh, NC',
    'Fuquay-Varina, NC',
    'Portland, OR',
  ];

  return (
    <div className="p-5 space-y-6">
      {/* Location Search */}
      <section className="space-y-2">
        <label className="text-2xs uppercase tracking-wider text-slate-500 font-medium">
          Location
        </label>
        <div className="relative">
          <div
            className={cn(
              'relative flex items-center transition-all duration-200',
              showSuggestions && 'ring-2 ring-blue-500/50 rounded-xl'
            )}
          >
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search city, address, or coordinates..."
              className={cn(
                'w-full pl-10 pr-10 py-3 bg-carto-elevated/50 border border-carto-border/50',
                'rounded-xl text-sm text-slate-200 placeholder-slate-500',
                'focus:outline-none focus:border-slate-600 transition-colors'
              )}
            />
            {isGeocoding && (
              <Loader2 className="absolute right-3.5 w-4 h-4 text-slate-400 animate-spin" />
            )}
          </div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && (suggestions.length > 0 || !location) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-carto-elevated/95 backdrop-blur-sm border border-carto-border/50 rounded-xl overflow-hidden shadow-xl z-50"
              >
                {!location && (
                  <>
                    <div className="px-3 py-2 text-2xs text-slate-500 uppercase tracking-wider border-b border-carto-border/30">
                      Quick access
                    </div>
                    {quickLocations.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => handleLocationChange(loc)}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700/50 transition-colors flex items-center gap-3"
                      >
                        <MapPin className="w-4 h-4 text-slate-500" />
                        {loc}
                      </button>
                    ))}
                  </>
                )}

                {suggestions.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSuggestion(result)}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700/50 transition-colors flex items-center gap-3"
                  >
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <div>
                      <div>{result.name}</div>
                      <div className="text-2xs text-slate-500">
                        {result.displayName}
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Travel Mode */}
      <section className="space-y-3">
        <label className="text-2xs uppercase tracking-wider text-slate-500 font-medium">
          Travel Mode
        </label>
        <div className="grid grid-cols-3 gap-2">
          {TRAVEL_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setTravelMode(mode.id)}
              className={cn(
                'relative px-3 py-3 rounded-xl text-center transition-all duration-200',
                travelMode === mode.id
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                  : 'bg-carto-elevated/30 border-carto-border/30 text-slate-400 hover:bg-carto-elevated/50',
                'border'
              )}
            >
              <div className="text-xl mb-1">{mode.emoji}</div>
              <div className="text-xs font-medium">{mode.name}</div>
              <div className="text-2xs text-slate-500">{mode.speed}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Travel Time */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-2xs uppercase tracking-wider text-slate-500 font-medium">
            Travel Time
          </label>
          <span className="text-sm font-mono text-blue-400">{travelTime} min</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={travelTime}
            onChange={(e) => setTravelTime(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-2xs text-slate-600">
            <span>5 min</span>
            <span>30 min</span>
            <span>60 min</span>
          </div>
        </div>
      </section>

      {/* POI Categories */}
      <section className="space-y-3">
        <label className="text-2xs uppercase tracking-wider text-slate-500 font-medium">
          Points of Interest
        </label>
        <div className="grid grid-cols-4 gap-2">
          {POI_CATEGORIES.slice(0, 8).map((cat) => {
            const Icon = ICONS[cat.icon] || MapPin;
            const isSelected = selectedCategories.includes(cat.id as POICategory);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id as POICategory)}
                className={cn(
                  'relative p-2.5 rounded-xl transition-all duration-200 group',
                  isSelected
                    ? 'bg-slate-700/50 border-slate-600'
                    : 'bg-carto-elevated/30 border-carto-border/30 hover:bg-carto-elevated/50',
                  'border'
                )}
              >
                <Icon
                  className="w-5 h-5 mx-auto transition-colors"
                  style={{ color: isSelected ? cat.color : '#64748b' }}
                />
                <div
                  className={cn(
                    'text-2xs mt-1.5 transition-colors truncate',
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  )}
                >
                  {cat.name}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Run Analysis Button */}
      <button
        onClick={handleRunAnalysis}
        disabled={!isReady || isLoading}
        className={cn(
          'w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-300',
          'flex items-center justify-center gap-2',
          isReady && !isLoading
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20'
            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Run Analysis
          </>
        )}
      </button>

      {/* Help text */}
      <p className="text-2xs text-slate-500 text-center">
        Select a location and at least one POI category to analyze
      </p>
    </div>
  );
}
