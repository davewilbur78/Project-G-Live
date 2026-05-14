'use client';
import { useEffect, useRef } from 'react';

export interface MapAddress {
  id?: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  street_address?: string;
  place_name?: string;
  event_type?: string;
  event_date_display?: string;
}

export default function PersonMap({ addresses }: { addresses: MapAddress[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!mapRef.current || addresses.length === 0 || initializedRef.current) return;
    initializedRef.current = true;

    // Inject Leaflet CSS once
    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      const map = L.map(mapRef.current);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      const latlngs: [number, number][] = [];

      addresses.forEach((addr, i) => {
        const latlng: [number, number] = [addr.latitude, addr.longitude];
        latlngs.push(latlng);

        const locationLabel = [addr.city, addr.state, addr.country].filter(Boolean).join(', ');
        const popupHtml = `
          <div style="font-family: 'Georgia', serif; font-size: 13px; min-width: 160px; line-height: 1.4;">
            <div style="font-weight: 700; margin-bottom: 3px; color: #1e293b;">${i + 1}. ${addr.event_date_display || 'Date unknown'}</div>
            <div style="color: #64748b; font-size: 12px;">${addr.event_type || 'Event'}</div>
            ${addr.place_name ? `<div style="margin-top: 4px; color: #334155;">${addr.place_name}</div>` : ''}
            ${locationLabel ? `<div style="color: #94a3b8; font-size: 11px; margin-top: 2px;">${locationLabel}</div>` : ''}
          </div>
        `;

        L.circleMarker(latlng, {
          radius: 9,
          fillColor: '#2563eb',
          color: '#1d4ed8',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85,
        })
          .bindPopup(popupHtml, { maxWidth: 220 })
          .addTo(map);
      });

      // Migration path line
      if (latlngs.length > 1) {
        L.polyline(latlngs, {
          color: '#2563eb',
          weight: 2,
          opacity: 0.35,
          dashArray: '6, 6',
        }).addTo(map);
      }

      if (latlngs.length === 1) {
        map.setView(latlngs[0], 11);
      } else {
        map.fitBounds(L.latLngBounds(latlngs).pad(0.15));
      }
    };

    if ((window as any).L) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []);

  if (addresses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-400 text-center gap-1">
        <span>No geocoded addresses yet.</span>
        <span className="text-xs">Geocoded addresses from the Timeline will appear here.</span>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={mapRef}
        style={{ height: '340px', width: '100%', borderRadius: '8px', border: '1px solid #e5e7eb' }}
      />
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {addresses.map((addr, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white font-bold" style={{ fontSize: '10px' }}>
              {i + 1}
            </span>
            <span>{[addr.event_date_display, addr.city || addr.place_name].filter(Boolean).join(' · ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
