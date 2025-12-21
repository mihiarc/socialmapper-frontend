'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAppStore } from '@/lib/store';
import type { Coordinates, POI, CensusBlockGroup, Isochrone } from '@/lib/types';
import { getPOIColor, getIsochroneColor, hexToRgba } from '@/lib/utils';

// Set token from environment
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface MapProps {
  className?: string;
}

export default function Map({ className = '' }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const {
    mapCenter,
    mapZoom,
    mapStyle,
    currentAnalysis,
    layers,
    setMapCenter,
    setMapZoom,
  } = useAppStore();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [mapCenter.lng, mapCenter.lat],
      zoom: mapZoom,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: true }),
      'top-right'
    );

    // Add scale bar
    map.current.addControl(
      new mapboxgl.ScaleControl({ maxWidth: 100 }),
      'bottom-left'
    );

    // Track map movements
    map.current.on('moveend', () => {
      if (!map.current) return;
      const center = map.current.getCenter();
      setMapCenter({ lat: center.lat, lng: center.lng });
      setMapZoom(map.current.getZoom());
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map style
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    map.current.setStyle(mapStyle);
  }, [mapStyle, mapLoaded]);

  // Add/update isochrone layer
  useEffect(() => {
    if (!map.current || !mapLoaded || !currentAnalysis?.isochrone) return;

    const isochroneLayer = layers.find((l) => l.id === 'isochrone');
    if (!isochroneLayer?.visible) {
      if (map.current.getLayer('isochrone-fill')) {
        map.current.removeLayer('isochrone-fill');
        map.current.removeLayer('isochrone-outline');
        map.current.removeSource('isochrone');
      }
      return;
    }

    const geojson: GeoJSON.Feature = {
      type: 'Feature',
      properties: {
        travelTime: currentAnalysis.isochrone.travelTime,
      },
      geometry: currentAnalysis.isochrone.geometry,
    };

    const color = getIsochroneColor(currentAnalysis.isochrone.travelTime);

    if (map.current.getSource('isochrone')) {
      (map.current.getSource('isochrone') as mapboxgl.GeoJSONSource).setData(geojson);
    } else {
      map.current.addSource('isochrone', {
        type: 'geojson',
        data: geojson,
      });

      map.current.addLayer({
        id: 'isochrone-fill',
        type: 'fill',
        source: 'isochrone',
        paint: {
          'fill-color': color,
          'fill-opacity': isochroneLayer.opacity * 0.3,
        },
      });

      map.current.addLayer({
        id: 'isochrone-outline',
        type: 'line',
        source: 'isochrone',
        paint: {
          'line-color': color,
          'line-width': 2,
          'line-opacity': 0.8,
        },
      });
    }
  }, [currentAnalysis?.isochrone, layers, mapLoaded]);

  // Add/update census blocks layer
  useEffect(() => {
    if (!map.current || !mapLoaded || !currentAnalysis?.censusBlocks) return;

    const censusLayer = layers.find((l) => l.id === 'census');
    if (!censusLayer?.visible) {
      if (map.current.getLayer('census-fill')) {
        map.current.removeLayer('census-fill');
        map.current.removeLayer('census-outline');
        map.current.removeSource('census');
      }
      return;
    }

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: currentAnalysis.censusBlocks.map((block) => ({
        type: 'Feature',
        properties: {
          geoid: block.geoid,
          ...block.properties,
        },
        geometry: block.geometry,
      })),
    };

    if (map.current.getSource('census')) {
      (map.current.getSource('census') as mapboxgl.GeoJSONSource).setData(geojson);
    } else {
      map.current.addSource('census', {
        type: 'geojson',
        data: geojson,
      });

      map.current.addLayer(
        {
          id: 'census-fill',
          type: 'fill',
          source: 'census',
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'population'],
              0,
              '#1e293b',
              1000,
              '#334155',
              5000,
              '#3b82f6',
              10000,
              '#60a5fa',
            ],
            'fill-opacity': censusLayer.opacity * 0.5,
          },
        },
        'isochrone-fill'
      );

      map.current.addLayer(
        {
          id: 'census-outline',
          type: 'line',
          source: 'census',
          paint: {
            'line-color': '#475569',
            'line-width': 0.5,
            'line-opacity': 0.5,
          },
        },
        'isochrone-fill'
      );
    }
  }, [currentAnalysis?.censusBlocks, layers, mapLoaded]);

  // Add/update POI markers
  useEffect(() => {
    if (!map.current || !mapLoaded || !currentAnalysis?.pois) return;

    const poiLayer = layers.find((l) => l.id === 'pois');
    
    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.poi-marker');
    existingMarkers.forEach((el) => el.remove());

    if (!poiLayer?.visible) return;

    // Add new markers
    currentAnalysis.pois.forEach((poi) => {
      const el = document.createElement('div');
      el.className = 'poi-marker';
      el.style.cssText = `
        width: 12px;
        height: 12px;
        background-color: ${getPOIColor(poi.category)};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s ease;
      `;
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.5)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const popup = new mapboxgl.Popup({
        offset: 15,
        closeButton: false,
        className: 'poi-popup',
      }).setHTML(`
        <div style="padding: 8px 12px; background: #1f2937; border-radius: 8px;">
          <div style="font-weight: 500; color: #e5e7eb; font-size: 13px;">${poi.name}</div>
          <div style="color: #9ca3af; font-size: 11px; text-transform: capitalize; margin-top: 2px;">${poi.category}</div>
          ${poi.distance ? `<div style="color: #6b7280; font-size: 10px; margin-top: 4px;">${(poi.distance / 1000).toFixed(2)} km</div>` : ''}
        </div>
      `);

      new mapboxgl.Marker({ element: el })
        .setLngLat([poi.coordinates.lng, poi.coordinates.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [currentAnalysis?.pois, layers, mapLoaded]);

  // Fly to analysis location
  useEffect(() => {
    if (!map.current || !mapLoaded || !currentAnalysis?.origin) return;

    map.current.flyTo({
      center: [currentAnalysis.origin.lng, currentAnalysis.origin.lat],
      zoom: 13,
      duration: 1500,
      essential: true,
    });
  }, [currentAnalysis?.origin, mapLoaded]);

  return (
    <div className={`w-full h-full ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Coordinates overlay */}
      <div className="absolute top-4 left-4 font-mono text-[10px] text-slate-500 tracking-wider pointer-events-none">
        {mapCenter.lat.toFixed(4)}°N
      </div>
      <div className="absolute top-4 right-16 font-mono text-[10px] text-slate-500 tracking-wider pointer-events-none">
        {Math.abs(mapCenter.lng).toFixed(4)}°W
      </div>
      
      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-carto-bg">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm text-slate-400">Loading map...</span>
          </div>
        </div>
      )}
      
    </div>
  );
}
