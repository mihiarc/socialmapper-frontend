import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  AppState,
  Coordinates,
  TravelMode,
  POICategory,
  AnalysisResult,
  MapLayer,
} from './types';

interface AppActions {
  // Location
  setLocation: (location: string) => void;
  setCoordinates: (coordinates: Coordinates | null) => void;
  
  // Analysis config
  setTravelMode: (mode: TravelMode) => void;
  setTravelTime: (time: number) => void;
  toggleCategory: (category: POICategory) => void;
  setSelectedCategories: (categories: POICategory[]) => void;
  
  // Results
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  addToHistory: (analysis: AnalysisResult) => void;
  clearHistory: () => void;
  
  // UI
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActivePanel: (panel: AppState['activePanel']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Map
  setMapCenter: (center: Coordinates) => void;
  setMapZoom: (zoom: number) => void;
  setMapStyle: (style: string) => void;
  updateLayer: (layerId: string, updates: Partial<MapLayer>) => void;
  toggleLayerVisibility: (layerId: string) => void;
  
  // Reset
  resetAnalysis: () => void;
  resetAll: () => void;
}

const initialState: AppState = {
  // Analysis configuration
  location: '',
  coordinates: null,
  travelMode: 'walk',
  travelTime: 15,
  selectedCategories: ['library'],
  
  // Results
  currentAnalysis: null,
  analysisHistory: [],
  
  // UI state
  sidebarOpen: true,
  activePanel: 'search',
  isLoading: false,
  error: null,
  
  // Map state
  mapCenter: { lat: 35.9132, lng: -79.0558 }, // Chapel Hill, NC
  mapZoom: 12,
  mapStyle: 'mapbox://styles/mapbox/dark-v11',
  layers: [
    {
      id: 'isochrone',
      type: 'isochrone',
      visible: true,
      opacity: 0.3,
    },
    {
      id: 'census',
      type: 'census',
      visible: true,
      opacity: 0.5,
    },
    {
      id: 'pois',
      type: 'poi',
      visible: true,
      opacity: 1,
    },
  ],
};

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Location actions
        setLocation: (location) => set({ location }),
        setCoordinates: (coordinates) => set({ coordinates }),
        
        // Analysis config actions
        setTravelMode: (travelMode) => set({ travelMode }),
        setTravelTime: (travelTime) => set({ travelTime }),
        
        toggleCategory: (category) => {
          const { selectedCategories } = get();
          const isSelected = selectedCategories.includes(category);
          set({
            selectedCategories: isSelected
              ? selectedCategories.filter((c) => c !== category)
              : [...selectedCategories, category],
          });
        },
        
        setSelectedCategories: (selectedCategories) => set({ selectedCategories }),
        
        // Results actions
        setCurrentAnalysis: (currentAnalysis) => set({ currentAnalysis }),
        
        addToHistory: (analysis) => {
          const { analysisHistory } = get();
          set({
            analysisHistory: [analysis, ...analysisHistory].slice(0, 20), // Keep last 20
          });
        },
        
        clearHistory: () => set({ analysisHistory: [] }),
        
        // UI actions
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setActivePanel: (activePanel) => set({ activePanel }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        
        // Map actions
        setMapCenter: (mapCenter) => set({ mapCenter }),
        setMapZoom: (mapZoom) => set({ mapZoom }),
        setMapStyle: (mapStyle) => set({ mapStyle }),
        
        updateLayer: (layerId, updates) => {
          const { layers } = get();
          set({
            layers: layers.map((layer) =>
              layer.id === layerId ? { ...layer, ...updates } : layer
            ),
          });
        },
        
        toggleLayerVisibility: (layerId) => {
          const { layers } = get();
          set({
            layers: layers.map((layer) =>
              layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
            ),
          });
        },
        
        // Reset actions
        resetAnalysis: () =>
          set({
            location: '',
            coordinates: null,
            currentAnalysis: null,
            error: null,
            activePanel: 'search',
          }),
        
        resetAll: () => set(initialState),
      }),
      {
        name: 'socialmapper-storage',
        partialize: (state) => ({
          travelMode: state.travelMode,
          travelTime: state.travelTime,
          selectedCategories: state.selectedCategories,
          analysisHistory: state.analysisHistory,
          mapStyle: state.mapStyle,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    { name: 'SocialMapper' }
  )
);

// Selectors for common derived state
export const useIsReadyToAnalyze = () =>
  useAppStore((state) => state.location.length > 0 && state.selectedCategories.length > 0);

export const useHasResults = () =>
  useAppStore((state) => state.currentAnalysis !== null);

export const useActiveLayerCount = () =>
  useAppStore((state) => state.layers.filter((l) => l.visible).length);
