// Core domain types for SocialMapper

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Travel modes supported by the API
export type TravelMode = 'walk' | 'bike' | 'drive';

// POI category identifiers
// Organized by equity analysis priority (15-minute city framework)
export type POICategory =
  // Tier 1: Core Equity Indicators
  | 'grocery'       // Food access (food desert analysis)
  | 'healthcare'    // Combined healthcare facilities
  | 'hospital'      // Hospitals specifically
  | 'clinic'        // Clinics and doctors
  | 'pharmacy'      // Medication access
  | 'transit'       // Public transportation
  | 'bus_station'   // Bus stops/stations
  | 'school'        // Education access
  | 'library'       // Information access
  | 'park'          // Green space equity
  | 'childcare'     // Early childhood (NEW)
  // Tier 2: Community Services
  | 'bank'          // Financial services
  | 'post_office'   // Postal services
  | 'community'     // Community centers (NEW)
  // Tier 3: Emergency & Civic
  | 'fire_station'  // Fire services
  | 'police'        // Police services
  | 'emergency'     // Combined emergency (NEW)
  | 'government'    // Government offices (NEW)
  // Tier 4: Quality of Life
  | 'restaurant'    // Dining
  | 'cafe'          // Cafes
  | 'fitness'       // Gyms/sports (NEW)
  | 'supermarket'   // Supermarkets specifically
  | 'religious';    // Places of worship (NEW)

// Point of Interest
export interface POI {
  id: string;
  name: string;
  category: POICategory;
  coordinates: Coordinates;
  distance?: number; // meters from origin
  travelTime?: number; // seconds
  tags?: Record<string, string>;
  address?: string;
}

// Census data structure
export interface CensusBlockGroup {
  geoid: string;
  name?: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  properties: {
    population?: number;
    medianIncome?: number;
    medianAge?: number;
    housingUnits?: number;
    [key: string]: unknown;
  };
}

// Isochrone (travel-time polygon)
export interface Isochrone {
  id: string;
  origin: Coordinates;
  travelMode: TravelMode;
  travelTime: number; // minutes
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  area?: number; // square meters
  createdAt: string;
}

// Analysis request parameters
export interface AnalysisRequest {
  location: string | Coordinates;
  travelMode: TravelMode;
  travelTime: number; // minutes
  poiCategories: POICategory[];
  censusVariables?: string[];
  year?: number;
}

// Analysis progress tracking
export type AnalysisStep =
  | 'initializing'
  | 'isochrone'
  | 'poi_discovery'
  | 'census_data'
  | 'processing'
  | 'complete'
  | 'error';

export interface ProgressEvent {
  step: AnalysisStep;
  stepNumber: number;
  totalSteps: number;
  percentage: number;
  message: string;
  details?: string;
  error?: string;
  result?: AnalysisResult;
}

// Analysis result
export interface AnalysisResult {
  id: string;
  request: AnalysisRequest;
  origin: Coordinates;
  originName: string;
  isochrone: Isochrone;
  pois: POI[];
  censusBlocks: CensusBlockGroup[];
  summary: AnalysisSummary;
  createdAt: string;
}

export interface AnalysisSummary {
  totalPopulation: number;
  blockGroupCount: number;
  poiCount: number;
  areaKm2: number;
  demographics?: {
    medianIncome?: number;
    medianAge?: number;
    [key: string]: number | undefined;
  };
}

// API response wrapper
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    requestId: string;
    timestamp: string;
    processingTime: number;
  };
}

// Geocoding result
export interface GeocodingResult {
  name: string;
  displayName: string;
  coordinates: Coordinates;
  boundingBox?: BoundingBox;
  type: 'city' | 'address' | 'poi' | 'region';
  confidence: number;
}

// Map layer configuration
export interface MapLayer {
  id: string;
  type: 'isochrone' | 'poi' | 'census' | 'custom';
  visible: boolean;
  opacity: number;
  data?: GeoJSON.FeatureCollection;
  style?: LayerStyle;
}

export interface LayerStyle {
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
}

// Application state
export interface AppState {
  // Analysis configuration
  location: string;
  coordinates: Coordinates | null;
  travelMode: TravelMode;
  travelTime: number;
  selectedCategories: POICategory[];
  
  // Results
  currentAnalysis: AnalysisResult | null;
  analysisHistory: AnalysisResult[];
  
  // UI state
  sidebarOpen: boolean;
  activePanel: 'search' | 'results' | 'layers' | 'settings';
  isLoading: boolean;
  error: string | null;
  
  // Map state
  mapCenter: Coordinates;
  mapZoom: number;
  mapStyle: string;
  layers: MapLayer[];
}

// Export formats
export type ExportFormat = 'csv' | 'geojson' | 'shapefile' | 'parquet';

export interface ExportOptions {
  format: ExportFormat;
  includeIsochrone: boolean;
  includePOIs: boolean;
  includeCensus: boolean;
  censusVariables?: string[];
}

// Event types for analytics/logging
export type AnalyticsEvent = 
  | { type: 'analysis_started'; payload: AnalysisRequest }
  | { type: 'analysis_completed'; payload: { id: string; duration: number } }
  | { type: 'analysis_failed'; payload: { error: string } }
  | { type: 'export_requested'; payload: ExportOptions }
  | { type: 'layer_toggled'; payload: { layerId: string; visible: boolean } };

// Census variable metadata
export interface CensusVariable {
  id: string;
  name: string;
  description: string;
  group: string;
  type: 'count' | 'median' | 'percent' | 'currency';
}

// Predefined census variable groups
export const CENSUS_VARIABLES: Record<string, CensusVariable> = {
  total_population: {
    id: 'B01003_001E',
    name: 'Total Population',
    description: 'Total population count',
    group: 'Demographics',
    type: 'count',
  },
  median_income: {
    id: 'B19013_001E',
    name: 'Median Household Income',
    description: 'Median household income in the past 12 months',
    group: 'Economics',
    type: 'currency',
  },
  median_age: {
    id: 'B01002_001E',
    name: 'Median Age',
    description: 'Median age of population',
    group: 'Demographics',
    type: 'median',
  },
  housing_units: {
    id: 'B25001_001E',
    name: 'Housing Units',
    description: 'Total housing units',
    group: 'Housing',
    type: 'count',
  },
  median_home_value: {
    id: 'B25077_001E',
    name: 'Median Home Value',
    description: 'Median value of owner-occupied housing units',
    group: 'Housing',
    type: 'currency',
  },
};

// POI category metadata
export interface POICategoryMeta {
  id: POICategory;
  name: string;
  icon: string;
  color: string;
  osmTags: string[];
}

// POI Categories organized by equity analysis priority
// Tier 1 categories are most critical for underserved community analysis
export const POI_CATEGORIES: POICategoryMeta[] = [
  // ========================================
  // TIER 1: Core Equity Indicators (Primary UI display)
  // ========================================
  {
    id: 'grocery',
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: '#34D399',  // Emerald
    osmTags: ['shop=supermarket', 'shop=grocery', 'shop=convenience', 'shop=greengrocer'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'Heart',
    color: '#F87171',  // Red
    osmTags: ['amenity=hospital', 'amenity=clinic', 'amenity=doctors', 'amenity=dentist'],
  },
  {
    id: 'pharmacy',
    name: 'Pharmacies',
    icon: 'Pill',
    color: '#22D3EE',  // Cyan
    osmTags: ['amenity=pharmacy', 'shop=chemist'],
  },
  {
    id: 'transit',
    name: 'Transit',
    icon: 'Bus',
    color: '#A78BFA',  // Purple
    osmTags: ['public_transport=station', 'railway=station', 'amenity=bus_station', 'highway=bus_stop'],
  },
  {
    id: 'school',
    name: 'Schools',
    icon: 'GraduationCap',
    color: '#FBBF24',  // Amber
    osmTags: ['amenity=school', 'amenity=college', 'amenity=university'],
  },
  {
    id: 'library',
    name: 'Libraries',
    icon: 'BookOpen',
    color: '#60A5FA',  // Blue
    osmTags: ['amenity=library'],
  },
  {
    id: 'park',
    name: 'Parks',
    icon: 'TreePine',
    color: '#4ADE80',  // Green
    osmTags: ['leisure=park', 'leisure=garden', 'leisure=playground'],
  },
  {
    id: 'childcare',
    name: 'Childcare',
    icon: 'Baby',
    color: '#F9A8D4',  // Pink
    osmTags: ['amenity=kindergarten', 'amenity=childcare'],
  },

  // ========================================
  // TIER 2: Community Services
  // ========================================
  {
    id: 'bank',
    name: 'Banks',
    icon: 'Landmark',
    color: '#94A3B8',  // Slate
    osmTags: ['amenity=bank', 'amenity=atm'],
  },
  {
    id: 'post_office',
    name: 'Post Offices',
    icon: 'Mail',
    color: '#FCD34D',  // Yellow
    osmTags: ['amenity=post_office'],
  },
  {
    id: 'community',
    name: 'Community Centers',
    icon: 'Users',
    color: '#C084FC',  // Violet
    osmTags: ['amenity=community_centre', 'amenity=social_facility'],
  },

  // ========================================
  // TIER 3: Emergency & Civic Services
  // ========================================
  {
    id: 'fire_station',
    name: 'Fire Stations',
    icon: 'Flame',
    color: '#EF4444',  // Red
    osmTags: ['amenity=fire_station'],
  },
  {
    id: 'police',
    name: 'Police',
    icon: 'Shield',
    color: '#3B82F6',  // Blue
    osmTags: ['amenity=police'],
  },
  {
    id: 'government',
    name: 'Government',
    icon: 'Building',
    color: '#6B7280',  // Gray
    osmTags: ['amenity=townhall', 'office=government'],
  },

  // ========================================
  // TIER 4: Quality of Life
  // ========================================
  {
    id: 'restaurant',
    name: 'Restaurants',
    icon: 'Utensils',
    color: '#FB923C',  // Orange
    osmTags: ['amenity=restaurant', 'amenity=fast_food'],
  },
  {
    id: 'cafe',
    name: 'Cafes',
    icon: 'Coffee',
    color: '#F472B6',  // Pink
    osmTags: ['amenity=cafe'],
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: 'Dumbbell',
    color: '#14B8A6',  // Teal
    osmTags: ['leisure=fitness_centre', 'leisure=sports_centre'],
  },
  {
    id: 'religious',
    name: 'Places of Worship',
    icon: 'Church',
    color: '#8B5CF6',  // Violet
    osmTags: ['amenity=place_of_worship'],
  },

  // Legacy categories (for backward compatibility)
  {
    id: 'hospital',
    name: 'Hospitals',
    icon: 'Building2',
    color: '#F87171',
    osmTags: ['amenity=hospital'],
  },
  {
    id: 'clinic',
    name: 'Clinics',
    icon: 'Stethoscope',
    color: '#FB7185',
    osmTags: ['amenity=clinic', 'amenity=doctors'],
  },
];

export const TRAVEL_MODES: { id: TravelMode; name: string; speed: string; emoji: string }[] = [
  { id: 'walk', name: 'Walk', speed: '5 km/h', emoji: '🚶' },
  { id: 'bike', name: 'Bike', speed: '15 km/h', emoji: '🚴' },
  { id: 'drive', name: 'Drive', speed: '50 km/h', emoji: '🚗' },
];
