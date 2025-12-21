import type {
  AnalysisRequest,
  AnalysisResult,
  APIResponse,
  GeocodingResult,
  Coordinates,
  ExportOptions,
  POI,
  CensusBlockGroup,
  Isochrone,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data: APIResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new APIError(
      data.error?.message || 'An error occurred',
      data.error?.code || 'UNKNOWN_ERROR',
      response.status,
      data.error?.details
    );
  }

  return data.data as T;
}

// ============================================
// Geocoding API
// ============================================

export async function geocode(query: string): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({ q: query, limit: '5' });
  return fetchAPI<GeocodingResult[]>(`/api/geocode?${params}`);
}

export async function reverseGeocode(
  coordinates: Coordinates
): Promise<GeocodingResult> {
  const params = new URLSearchParams({
    lat: coordinates.lat.toString(),
    lng: coordinates.lng.toString(),
  });
  return fetchAPI<GeocodingResult>(`/api/geocode/reverse?${params}`);
}

// ============================================
// Analysis API
// ============================================

export async function runAnalysis(
  request: AnalysisRequest
): Promise<AnalysisResult> {
  return fetchAPI<AnalysisResult>('/api/analysis', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getAnalysis(id: string): Promise<AnalysisResult> {
  return fetchAPI<AnalysisResult>(`/api/analysis/${id}`);
}

export async function listAnalyses(limit = 20): Promise<AnalysisResult[]> {
  const params = new URLSearchParams({ limit: limit.toString() });
  return fetchAPI<AnalysisResult[]>(`/api/analysis?${params}`);
}

// ============================================
// Isochrone API
// ============================================

export interface IsochroneRequest {
  location: string | Coordinates;
  travelMode: 'walk' | 'bike' | 'drive';
  travelTime: number;
}

export async function createIsochrone(
  request: IsochroneRequest
): Promise<Isochrone> {
  return fetchAPI<Isochrone>('/api/isochrone', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// ============================================
// POI API
// ============================================

export interface POIRequest {
  location: string | Coordinates;
  categories: string[];
  travelTime?: number;
  limit?: number;
}

export async function getPOIs(request: POIRequest): Promise<POI[]> {
  return fetchAPI<POI[]>('/api/poi', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// ============================================
// Census API
// ============================================

export interface CensusRequest {
  polygon?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  location?: Coordinates;
  radiusKm?: number;
  variables?: string[];
  year?: number;
}

export async function getCensusBlocks(
  request: CensusRequest
): Promise<CensusBlockGroup[]> {
  return fetchAPI<CensusBlockGroup[]>('/api/census/blocks', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getCensusData(
  geoids: string[],
  variables: string[] = ['B01003_001E'],
  year = 2023
): Promise<Record<string, Record<string, number>>> {
  return fetchAPI<Record<string, Record<string, number>>>('/api/census/data', {
    method: 'POST',
    body: JSON.stringify({ geoids, variables, year }),
  });
}

// ============================================
// Export API
// ============================================

export async function exportAnalysis(
  analysisId: string,
  options: ExportOptions
): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/api/export/${analysisId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    }
  );

  if (!response.ok) {
    throw new APIError(
      'Export failed',
      'EXPORT_ERROR',
      response.status
    );
  }

  return response.blob();
}

// ============================================
// Health Check
// ============================================

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  services: {
    name: string;
    status: 'up' | 'down';
    latency?: number;
  }[];
}

export async function checkHealth(): Promise<HealthStatus> {
  return fetchAPI<HealthStatus>('/api/health');
}

// ============================================
// Demo Data (for development/demo mode)
// ============================================

export async function getDemoAnalysis(location: string): Promise<AnalysisResult> {
  // This endpoint returns pre-computed demo data
  const params = new URLSearchParams({ location });
  return fetchAPI<AnalysisResult>(`/api/demo?${params}`);
}

// ============================================
// SWR Fetcher
// ============================================

export const swrFetcher = async <T>(url: string): Promise<T> => {
  return fetchAPI<T>(url);
};

// ============================================
// Utility Functions
// ============================================

export function isCoordinates(
  location: string | Coordinates
): location is Coordinates {
  return (
    typeof location === 'object' &&
    'lat' in location &&
    'lng' in location
  );
}

export function formatCoordinates(coords: Coordinates): string {
  const latDir = coords.lat >= 0 ? 'N' : 'S';
  const lngDir = coords.lng >= 0 ? 'E' : 'W';
  return `${Math.abs(coords.lat).toFixed(4)}°${latDir}, ${Math.abs(coords.lng).toFixed(4)}°${lngDir}`;
}

export function parseCoordinates(input: string): Coordinates | null {
  // Try to parse "lat, lng" format
  const match = input.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  return null;
}
