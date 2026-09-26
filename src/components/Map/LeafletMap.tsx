'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  pickup?: { lat: number; lng: number; label?: string } | null;
  drop?: { lat: number; lng: number; label?: string } | null;
  driver?: { lat: number; lng: number; label?: string; vehicleCategory?: string } | null;
  targetDestination?: 'pickup' | 'drop';
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
  targetDestination = 'pickup',
  zones = [],
  interactive = false,
  onMapClick,
  className = 'h-72 w-full',
  zoom = 12,
  center = { lat: 11.0168, lng: 76.9558 }, // Coimbatore center (Tamil Nadu)
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletLibRef = useRef<any>(null);

  const staticMarkersRef = useRef<any[]>([]);
  const driverMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const driverPolylineRef = useRef<any>(null);
  const zoneCirclesRef = useRef<any[]>([]);
  const hasFittedBoundsRef = useRef<boolean>(false);

  // 1. Initialize Map Instance Once
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    let isMounted = true;

    import('leaflet').then((leafletModule) => {
      if (!isMounted) return;
      const L = leafletModule.default || leafletModule;
      leafletLibRef.current = L;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [center.lat, center.lng],
          zoom,
          zoomControl: false,
        });

        // Professional, clean tile layer
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
        renderStaticLayers();
        renderDriverLayer();
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Helper: Render Static Markers (Pickup, Drop, Zones)
  const renderStaticLayers = () => {
    const map = mapInstanceRef.current;
    const L = leafletLibRef.current;
    if (!map || !L) return;

    // Clear previous static markers
    staticMarkersRef.current.forEach((m) => m.remove());
    staticMarkersRef.current = [];
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
    zoneCirclesRef.current.forEach((c) => c.remove());
    zoneCirclesRef.current = [];

    // Render Service Zones
    if (zones.length > 0) {
      zones.forEach((zone) => {
        if (!zone.isActive) return;
        const circle = L.circle([zone.center.lat, zone.center.lng], {
          radius: zone.radiusKm * 1000,
          color: '#3b82f6',
          fillColor: '#93c5fd',
          fillOpacity: 0.1,
          weight: 1.5,
          dashArray: '4, 6',
        }).addTo(map);
        circle.bindTooltip(zone.name, { permanent: false, direction: 'top' });
        zoneCirclesRef.current.push(circle);
      });
    }

    const pointsToFit: [number, number][] = [];

    // Pickup Marker
    if (pickup) {
      const pIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-emerald-500/40 text-xs">
              ●
            </div>
            <div class="absolute -bottom-6 whitespace-nowrap px-2 py-0.5 bg-slate-900 text-emerald-300 text-[10px] font-bold rounded shadow-md border border-emerald-500/30 pointer-events-none">
              ${pickup.label || 'Pickup'}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      const pMarker = L.marker([pickup.lat, pickup.lng], { icon: pIcon }).addTo(map);
      staticMarkersRef.current.push(pMarker);
      pointsToFit.push([pickup.lat, pickup.lng]);
    }

    // Drop Marker
    if (drop) {
      const dIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-rose-500/40 text-xs">
              ■
            </div>
            <div class="absolute -bottom-6 whitespace-nowrap px-2 py-0.5 bg-slate-900 text-rose-300 text-[10px] font-bold rounded shadow-md border border-rose-500/30 pointer-events-none">
              ${drop.label || 'Drop'}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      const dMarker = L.marker([drop.lat, drop.lng], { icon: dIcon }).addTo(map);
      staticMarkersRef.current.push(dMarker);
      pointsToFit.push([drop.lat, drop.lng]);
    }

    // Static planned route line
    if (pickup && drop) {
      routePolylineRef.current = L.polyline(
        [
          [pickup.lat, pickup.lng],
          [drop.lat, drop.lng],
        ],
        {
          color: '#059669',
          weight: 3.5,
          opacity: 0.7,
          dashArray: '5, 8',
        }
      ).addTo(map);
    }

    // Fit bounds once or if pickup/drop set
    if (!hasFittedBoundsRef.current && pointsToFit.length >= 2) {
      try {
        map.fitBounds(pointsToFit, { padding: [50, 50], maxZoom: 14 });
        hasFittedBoundsRef.current = true;
      } catch {}
    } else if (!hasFittedBoundsRef.current && pointsToFit.length === 1) {
      map.setView(pointsToFit[0], 13);
      hasFittedBoundsRef.current = true;
    }
  };

  // Helper: Live Driver Movement & Route Update (Uber-like)
  const renderDriverLayer = () => {
    const map = mapInstanceRef.current;
    const L = leafletLibRef.current;
    if (!map || !L) return;

    if (!driver) {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.remove();
        driverMarkerRef.current = null;
      }
      if (driverPolylineRef.current) {
        driverPolylineRef.current.remove();
        driverPolylineRef.current = null;
      }
      return;
    }

    const driverLatLng: [number, number] = [driver.lat, driver.lng];

    // If marker exists, glide marker smoothly with setLatLng without resetting map bounds!
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng(driverLatLng);
    } else {
      // Create Driver Marker with custom pulsating Uber-style vehicle
      const drvIcon = L.divIcon({
        className: 'leaflet-driver-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute -top-1 -right-1 flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div class="w-10 h-10 rounded-full bg-slate-950 text-amber-300 font-bold flex items-center justify-center shadow-2xl border-2 border-amber-400 ring-4 ring-amber-400/25 text-base">
              🚚
            </div>
            <div class="absolute -bottom-6 whitespace-nowrap px-2 py-0.5 bg-slate-900/95 text-amber-300 text-[10px] font-black rounded-full shadow-lg border border-amber-400/40 pointer-events-none">
              ${driver.label || 'Driver (Live)'}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      driverMarkerRef.current = L.marker(driverLatLng, {
        icon: drvIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      // If map has not fitted bounds to include driver yet, fit all points
      if (pickup) {
        try {
          const allPoints: [number, number][] = [driverLatLng, [pickup.lat, pickup.lng]];
          if (drop) allPoints.push([drop.lat, drop.lng]);
          map.fitBounds(allPoints, { padding: [50, 50], maxZoom: 14 });
        } catch {}
      }
    }

    // Live heading connection line (Driver ➔ Pickup or Driver ➔ Drop)
    const destinationPoint = (targetDestination === 'drop' && drop) ? drop : pickup;
    if (destinationPoint) {
      const activeLegCoords: [number, number][] = [
        driverLatLng,
        [destinationPoint.lat, destinationPoint.lng],
      ];
      const legColor = targetDestination === 'drop' ? '#10b981' : '#f59e0b'; // Emerald if to drop, Amber if to pickup

      if (driverPolylineRef.current) {
        driverPolylineRef.current.setLatLngs(activeLegCoords);
        driverPolylineRef.current.setStyle({ color: legColor });
      } else {
        driverPolylineRef.current = L.polyline(activeLegCoords, {
          color: legColor,
          weight: 4,
          opacity: 0.9,
          lineCap: 'round',
        }).addTo(map);
      }
    }
  };

  // Update static markers whenever pickup, drop or zones change
  useEffect(() => {
    hasFittedBoundsRef.current = false;
    renderStaticLayers();
  }, [pickup?.lat, pickup?.lng, drop?.lat, drop?.lng, zones]);

  // Update live driver marker whenever driver coordinates or target change
  useEffect(() => {
    renderDriverLayer();
  }, [driver?.lat, driver?.lng, driver?.label, targetDestination]);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-gray-200 bg-slate-100 ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full z-0" />
    </div>
  );
}
