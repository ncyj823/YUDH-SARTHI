import React, { useEffect, useRef, useState } from 'react';
import { Zone, Resource, ZoneStatus } from '../types';

interface MapProps {
  zones: Zone[];
  resources: Resource[];
  onZoneClick?: (zone: Zone) => void;
  onResourceClick?: (resource: Resource) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

const Map: React.FC<MapProps> = ({ zones, resources, onZoneClick, onResourceClick, onMapClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      if (typeof google === 'undefined') {
        setTimeout(initMap, 100);
        return;
      }

      const googleMap = new google.maps.Map(mapRef.current!, {
        center: { lat: 28.6139, lng: 77.2090 }, // Default to New Delhi
        zoom: 12,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'all',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      googleMap.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onMapClick?.(e.latLng.lat(), e.latLng.lng());
        }
      });

      setMap(googleMap);
    };

    initMap();
  }, [onMapClick]);

  const overlaysRef = useRef<(google.maps.Polygon | google.maps.Marker)[]>([]);

  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    // Clear existing overlays
    overlaysRef.current.forEach(overlay => overlay.setMap(null));
    overlaysRef.current = [];

    zones.forEach(zone => {
      const color = zone.status === 'safe' ? '#10b981' : zone.status === 'warring' ? '#f59e0b' : '#ef4444';
      
      const polygon = new google.maps.Polygon({
        paths: zone.coordinates,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.35,
        map: map
      });

      polygon.addListener('click', () => onZoneClick?.(zone));
      overlaysRef.current.push(polygon);
    });

    resources.forEach(resource => {
      const icon = {
        url: `https://maps.google.com/mapfiles/ms/icons/${resource.type === 'medical' ? 'red' : resource.type === 'shelter' ? 'blue' : 'yellow'}-dot.png`,
      };

      const marker = new google.maps.Marker({
        position: { lat: resource.lat, lng: resource.lng },
        map: map,
        title: resource.name,
        icon: icon
      });

      marker.addListener('click', () => onResourceClick?.(resource));
      overlaysRef.current.push(marker);
    });
  }, [map, zones, resources, onZoneClick, onResourceClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/80 p-3 rounded-lg border border-white/20 text-xs space-y-2 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span className="text-white">Safe Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
          <span className="text-white">Warring Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-white">Dangerous Zone</span>
        </div>
      </div>
    </div>
  );
};

export default Map;
