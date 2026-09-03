'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const selectedIcon = L.icon({
  iconUrl: '/image/Map_Pin_Selected.svg',
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -42],
});

export const unselectedIcon = L.icon({
  iconUrl: '/image/Map_Pin_UnSelected.svg',
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -42],
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && center[0] && center[1]) {
      map.flyTo(center, zoom || map.getZoom(), {
        animate: true,
        duration: 0.8,
      });
    }
  }, [center[0], center[1], zoom, map]);
  return null;
}

export default function Map({
  center = [13.7563, 100.5018],
  zoom = 13,
  markers = [],
  selectedId = null,
  onMarkerClick = () => {},
  className = "h-[400px] w-full rounded-2xl overflow-hidden shadow-md border border-gray-100 z-0"
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className={className}
    >
      <MapController center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.length > 0 ? (
        markers.map((marker, idx) => {
          const isSelected =
            marker.isSelected !== undefined
              ? marker.isSelected
              : selectedId
              ? String(marker.id) === String(selectedId)
              : markers.length === 1;
          const currentIcon = marker.icon || (isSelected ? selectedIcon : unselectedIcon);

          return (
            <Marker
              key={marker.id || idx}
              position={marker.position || center}
              icon={currentIcon}
              eventHandlers={{
                click: () => onMarkerClick(marker)
              }}
            >
              {marker.popup && <Popup>{marker.popup}</Popup>}
            </Marker>
          );
        })
      ) : (
        <Marker position={center} icon={selectedIcon}>
          <Popup>ตำแหน่งที่คุณเลือก</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
