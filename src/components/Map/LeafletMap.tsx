'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  pickup?: { lat: number; lng: number; label?: string } | null;
  drop?: { lat: number; lng: number; label?: string } | null;
  driver?: { lat: number; lng: number; label?: string; vehicleCategory?: string } | null;
  zones?: Array<{ id: string; name: string; center: { lat: number; lng: number }; radiusKm: number; isActive: boolean }>;
  interactive?: boolean;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  className?: string;
  zoom?: number;
  center?: { lat: number; lng: number };
}

export default function LeafletMap({
  pickup,
  drop,
  driver,
  zones = [],
  interactive = false,
  onMapClick,
  className = 'h-72 w-full',
  zoom = 12,
  center = { lat: 12.9716, lng: 77.5946 }, // Bangalore center
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const zoneCirclesRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;
    let isMounted = true;

    import('leaflet').then((leafletModule) => {
      if (!isMounted) return;
      L = leafletModule.default || leafletModule;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [center.lat, center.lng],
          zoom,
          zoomControl: false,
        });

        // Add sleek, professional light tile layer (CartoDB Voyager or OSM)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        if (interactive && onMapClick) {
          map.on('click', (e: any) => {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
          });
        }

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
      zoneCirclesRef.current.forEach((c) => c.remove());
      zoneCirclesRef.current = [];

      // Render Service Zones if provided
      if (zones.length > 0) {
        zones.forEach((zone) => {
          if (!zone.isActive) return;
          const circle = L.circle([zone.center.lat, zone.center.lng], {
            radius: zone.radiusKm * 1000,
            color: '#3b82f6',
            fillColor: '#93c5fd',
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: '4, 6',
          }).addTo(map);
          circle.bindTooltip(zone.name, { permanent: false, direction: 'top' });
          zoneCirclesRef.current.push(circle);
        });
      }

      // Custom HTML Icons
      const createCustomIcon = (type: 'pickup' | 'drop' | 'driver', label: string) => {
        let colorClass = 'bg-emerald-600';
        let glyph = '●';
        if (type === 'drop') {
          colorClass = 'bg-rose-600';
          glyph = '■';
        } else if (type === 'driver') {
          colorClass = 'bg-amber-500';
          glyph = '▲';
        }

        return L.divIcon({
          className: 'custom-map-icon',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="w-8 h-8 rounded-full ${colorClass} text-white font-bold flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-black/20 text-xs transition-transform transform hover:scale-110">
                ${glyph}
              </div>
              <div class="absolute -bottom-6 whitespace-nowrap px-2 py-0.5 bg-gray-900 text-white text-[10px] font-medium rounded shadow-md pointer-events-none">
                ${label}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
      };

      const pointsToFit: [number, number][] = [];

      // Pickup Marker
      if (pickup) {
        const pMarker = L.marker([pickup.lat, pickup.lng], {
          icon: createCustomIcon('pickup', pickup.label || 'Pickup'),
        }).addTo(map);
        markersRef.current.push(pMarker);
        pointsToFit.push([pickup.lat, pickup.lng]);
      }

      // Drop Marker
      if (drop) {
        const dMarker = L.marker([drop.lat, drop.lng], {
          icon: createCustomIcon('drop', drop.label || 'Drop'),
        }).addTo(map);
        markersRef.current.push(dMarker);
        pointsToFit.push([drop.lat, drop.lng]);
      }

      // Driver Marker
      if (driver) {
        const drvMarker = L.marker([driver.lat, driver.lng], {
          icon: createCustomIcon('driver', driver.label || 'Driver'),
        }).addTo(map);
        markersRef.current.push(drvMarker);
        pointsToFit.push([driver.lat, driver.lng]);
      }

      // Draw polyline between pickup and drop
      if (pickup && drop) {
        // Draw route line
        polylineRef.current = L.polyline(
          [
            [pickup.lat, pickup.lng],
            ...(driver ? [[driver.lat, driver.lng]] : []),
            [drop.lat, drop.lng],
          ],
          {
            color: '#16a34a',
            weight: 4,
            opacity: 0.8,
            dashArray: '6, 8',
          }
        ).addTo(map);
      }

      // Fit bounds if we have points
      if (pointsToFit.length >= 2) {
        try {
          map.fitBounds(pointsToFit, { padding: [40, 40], maxZoom: 14 });
        } catch {}
      } else if (pointsToFit.length === 1) {
        map.setView(pointsToFit[0], 13);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [pickup, drop, driver, zones, interactive, onMapClick, center, zoom]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-gray-200 bg-slate-100 ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full z-0" />
    </div>
  );
}
