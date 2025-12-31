import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format large numbers
export function formatNumber(num: number, decimals = 0): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toFixed(decimals);
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format distance
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

// Format time duration
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }
  return `${minutes} min`;
}

// Format area
export function formatArea(squareMeters: number): string {
  if (squareMeters >= 1_000_000) {
    return `${(squareMeters / 1_000_000).toFixed(2)} km²`;
  }
  return `${formatNumber(squareMeters)} m²`;
}

// Debounce function
export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle function
export function throttle<T extends (...args: never[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// Parse search params from URL
export function parseSearchParams(url: string): Record<string, string> {
  const params = new URL(url).searchParams;
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get contrasting text color
export function getContrastColor(hexColor: string): 'white' | 'black' {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? 'black' : 'white';
}

// Convert hex to rgba
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Check if object is empty
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

// Sleep utility for async operations
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// Download blob as file
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Get bounding box from GeoJSON
export function getBoundingBox(
  geojson: GeoJSON.Feature | GeoJSON.FeatureCollection
): [number, number, number, number] {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const processCoordinates = (coords: number[]) => {
    const [lng, lat] = coords;
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  };

  const processGeometry = (geometry: GeoJSON.Geometry) => {
    if (geometry.type === 'Point') {
      processCoordinates(geometry.coordinates as number[]);
    } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
      (geometry.coordinates as number[][]).forEach(processCoordinates);
    } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
      (geometry.coordinates as number[][][]).forEach((ring) =>
        ring.forEach(processCoordinates)
      );
    } else if (geometry.type === 'MultiPolygon') {
      (geometry.coordinates as number[][][][]).forEach((polygon) =>
        polygon.forEach((ring) => ring.forEach(processCoordinates))
      );
    }
  };

  if (geojson.type === 'FeatureCollection') {
    geojson.features.forEach((feature) => {
      if (feature.geometry) {
        processGeometry(feature.geometry);
      }
    });
  } else if (geojson.geometry) {
    processGeometry(geojson.geometry);
  }

  return [minLng, minLat, maxLng, maxLat];
}

// Color palette for POI categories
// Organized by equity analysis priority tiers
export const POI_COLORS: Record<string, string> = {
  // Tier 1: Core Equity Indicators
  grocery: '#34D399',       // Emerald - food access
  healthcare: '#F87171',    // Red - medical access
  pharmacy: '#22D3EE',      // Cyan - medication access
  transit: '#A78BFA',       // Purple - transportation
  school: '#FBBF24',        // Amber - education
  library: '#60A5FA',       // Blue - information access
  park: '#4ADE80',          // Green - green space
  childcare: '#F9A8D4',     // Pink - early childhood

  // Tier 2: Community Services
  bank: '#94A3B8',          // Slate - financial services
  post_office: '#FCD34D',   // Yellow - postal services
  community: '#C084FC',     // Violet - community centers

  // Tier 3: Emergency & Civic
  fire_station: '#EF4444',  // Red - fire services
  police: '#3B82F6',        // Blue - police services
  emergency: '#DC2626',     // Dark red - combined emergency
  government: '#6B7280',    // Gray - civic services

  // Tier 4: Quality of Life
  restaurant: '#FB923C',    // Orange - dining
  cafe: '#F472B6',          // Pink - cafes
  fitness: '#14B8A6',       // Teal - gyms/sports
  religious: '#8B5CF6',     // Violet - places of worship

  // Legacy/specific categories (backward compatibility)
  hospital: '#F87171',      // Same as healthcare
  clinic: '#FB7185',        // Lighter red
  supermarket: '#34D399',   // Same as grocery
  bus_station: '#A78BFA',   // Same as transit
};

// Get POI color with fallback
export function getPOIColor(category: string): string {
  return POI_COLORS[category] || '#94A3B8';
}

// Isochrone colors by travel time
export function getIsochroneColor(travelTime: number): string {
  if (travelTime <= 5) return '#22C55E';
  if (travelTime <= 10) return '#84CC16';
  if (travelTime <= 15) return '#EAB308';
  if (travelTime <= 30) return '#F97316';
  return '#EF4444';
}
