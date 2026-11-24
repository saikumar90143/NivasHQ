"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { useMapEvents } from 'react-leaflet/hooks';

// Use external URLs for Leaflet icons to avoid Webpack/Turbopack asset resolution issues
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapProps {
  properties: any[];
  onBoundsChanged?: (bounds: { minLat: number; minLng: number; maxLat: number; maxLng: number }) => void;
}

function MapEvents({ onBoundsChanged }: { onBoundsChanged?: MapProps['onBoundsChanged'] }) {
  const map = useMapEvents({
    moveend() {
      if (onBoundsChanged) {
        const bounds = map.getBounds();
        onBoundsChanged({
          minLat: bounds.getSouth(),
          minLng: bounds.getWest(),
          maxLat: bounds.getNorth(),
          maxLng: bounds.getEast(),
        });
      }
    },
    zoomend() {
      if (onBoundsChanged) {
        const bounds = map.getBounds();
        onBoundsChanged({
          minLat: bounds.getSouth(),
          minLng: bounds.getWest(),
          maxLat: bounds.getNorth(),
          maxLng: bounds.getEast(),
        });
      }
    }
  });

  useEffect(() => {
    if (onBoundsChanged && map) {
      const bounds = map.getBounds();
      onBoundsChanged({
        minLat: bounds.getSouth(),
        minLng: bounds.getWest(),
        maxLat: bounds.getNorth(),
        maxLng: bounds.getEast(),
      });
    }
  }, [map, onBoundsChanged]);

  return null;
}

export default function Map({ properties, onBoundsChanged }: MapProps) {
  // Center on Hyderabad by default
  const defaultCenter: [number, number] = [17.3850, 78.4867];
  
  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={11} 
      style={{ height: '100%', width: '100%', zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MapEvents onBoundsChanged={onBoundsChanged} />
      {properties.map((prop, idx) => {
        // Use fake coordinates if database doesn't have lat/lng yet, spread around Hyderabad
        const lat = prop.latitude || (defaultCenter[0] + (Math.random() - 0.5) * 0.2);
        const lng = prop.longitude || (defaultCenter[1] + (Math.random() - 0.5) * 0.2);
        
        return (
          <Marker key={prop.id} position={[lat, lng]}>
            <Popup>
              <div className="p-1 min-w-[150px]">
                <div className="font-bold text-sm mb-1 line-clamp-1">{prop.title}</div>
                <div className="text-[#d4a853] font-bold">
                  ₹{(Number(prop.price) / 100000).toFixed(2)} Lacs
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {prop.bedrooms ? `${prop.bedrooms} BHK • ` : ''}{prop.propertyType?.replace(/_/g, ' ')}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
