'use client';

import { useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { selectedIcon } from '../Map';

// Leaflet Draggable Marker Component for location selection
const MapWithPicker = dynamic(
  async () => {
    const { MapContainer, TileLayer, Marker, useMap } = await import('react-leaflet');

    function MapFlyTo({ center }) {
      const map = useMap();
      useEffect(() => {
        if (center && center[0] && center[1]) {
          map.flyTo(center, 15, { animate: true });
        }
      }, [center, map]);
      return null;
    }

    function DraggableMarker({ position, onDragEnd }) {
      const eventHandlers = useMemo(
        () => ({
          dragend(e) {
            const marker = e.target;
            if (marker != null) {
              const latLng = marker.getLatLng();
              onDragEnd([latLng.lat, latLng.lng]);
            }
          },
        }),
        [onDragEnd]
      );

      return (
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={position}
          icon={selectedIcon}
        />
      );
    }

    return function LocationMap({ center, onPositionChange, className }) {
      return (
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={true}
          className={className}
        >
          <MapFlyTo center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker position={center} onDragEnd={onPositionChange} />
        </MapContainer>
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-gray-400 font-medium">
        กำลังโหลดแผนที่...
      </div>
    ),
  }
);

export default function LocationPicker({
  address = {},
  onChange = () => {},
}) {
  const prevAddressQueryRef = useRef('');

  const currentCoords = [
    Number(address.latitude) || 13.7563,
    Number(address.longitude) || 100.5018,
  ];

  // Forward Geocoding: Address text input changes -> Move map pin with fallback query levels
  useEffect(() => {
    const rawDetail = (address.addressDetail || '').replace(/^\d+[\/\d\-]*\s*/, '').trim();
    const fullQuery = [address.addressDetail, address.subDistrict, address.district, address.province, 'Thailand']
      .filter(Boolean)
      .join(' ')
      .trim();
    const streetQuery = [rawDetail, address.subDistrict, address.district, address.province, 'Thailand']
      .filter(Boolean)
      .join(' ')
      .trim();
    const areaQuery = [address.subDistrict, address.district, address.province, 'Thailand']
      .filter(Boolean)
      .join(' ')
      .trim();

    if (!fullQuery || fullQuery === prevAddressQueryRef.current) return;
    prevAddressQueryRef.current = fullQuery;

    const queryGeocode = async (qText) => {
      if (!qText) return null;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            qText
          )}&format=json&limit=1`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
      } catch (e) {}
      return null;
    };

    const timer = setTimeout(async () => {
      let coords = await queryGeocode(fullQuery);
      if (!coords && streetQuery && streetQuery !== fullQuery) {
        coords = await queryGeocode(streetQuery);
      }
      if (!coords && areaQuery) {
        coords = await queryGeocode(areaQuery);
      }
      if (coords) {
        onChange({
          latitude: coords[0],
          longitude: coords[1],
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [address.addressDetail, address.subDistrict, address.district, address.province]);

  // When dragging pin in map: Only update Lat & Long without changing address details
  const handlePositionChange = (newCoords) => {
    onChange({
      latitude: newCoords[0],
      longitude: newCoords[1],
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 shadow-xs h-[300px] w-full">
      <MapWithPicker
        center={currentCoords}
        onPositionChange={handlePositionChange}
        className="h-full w-full z-0"
      />
    </div>
  );
}
