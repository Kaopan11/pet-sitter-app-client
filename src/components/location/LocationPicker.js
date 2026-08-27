'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import { selectedIcon } from '../Map';

// Leaflet Draggable Marker Component for location selection
const MapWithPicker = dynamic(
  async () => {
    const { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } = await import('react-leaflet');

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
        >
          <Popup>ลากหมุดเพื่อปรับตำแหน่งพิกัดร้านของคุณ</Popup>
        </Marker>
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
        กำลังโหลดแผนที่เลือกพิกัด...
      </div>
    ),
  }
);

export default function LocationPicker({
  initialLocation = {
    addressDetail: '',
    district: '',
    subDistrict: '',
    province: '',
    postcode: '',
    latitude: 13.7563,
    longitude: 100.5018,
  },
  onChange = () => {},
}) {
  const [address, setAddress] = useState(initialLocation);
  const [searching, setSearching] = useState(false);
  const [geoError, setGeoError] = useState('');

  const currentCoords = [
    Number(address.latitude) || 13.7563,
    Number(address.longitude) || 100.5018,
  ];

  const handleInputChange = (field, value) => {
    const next = { ...address, [field]: value };
    setAddress(next);
    onChange(next);
  };

  const handleCoordsChange = (newCoords) => {
    const next = {
      ...address,
      latitude: newCoords[0],
      longitude: newCoords[1],
    };
    setAddress(next);
    onChange(next);
  };

  // Convert Text Address -> Lat/Lng using Nominatim OpenStreetMap Geocoding API
  const handleGeocodeAddress = async () => {
    const fullQuery = [
      address.addressDetail,
      address.subDistrict,
      address.district,
      address.province,
      'Thailand',
    ]
      .filter(Boolean)
      .join(' ');

    if (!fullQuery) return;

    setSearching(true);
    setGeoError('');

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          fullQuery
        )}&format=json&limit=1`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const foundLat = parseFloat(data[0].lat);
        const foundLon = parseFloat(data[0].lon);
        handleCoordsChange([foundLat, foundLon]);
      } else {
        setGeoError('ไม่พบพิกัดจากที่อยู่ที่กรอก กรุณาลากหมุดบนแผนที่แทน');
      }
    } catch (err) {
      setGeoError('ค้นหาพิกัดขัดข้อง กรุณาปรับหมุดบนแผนที่โดยตรง');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-800">Address & Map Location</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            Address detail*
          </label>
          <input
            type="text"
            value={address.addressDetail || ''}
            onChange={(e) => handleInputChange('addressDetail', e.target.value)}
            placeholder="บ้านเลขที่, ชื่ออาคาร, ซอย, ถนน"
            className="input w-full"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            District*
          </label>
          <input
            type="text"
            value={address.district || ''}
            onChange={(e) => handleInputChange('district', e.target.value)}
            placeholder="เขต / อำเภอ"
            className="input w-full"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            Sub-district*
          </label>
          <input
            type="text"
            value={address.subDistrict || ''}
            onChange={(e) => handleInputChange('subDistrict', e.target.value)}
            placeholder="แขวง / ตำบล"
            className="input w-full"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            Province*
          </label>
          <input
            type="text"
            value={address.province || ''}
            onChange={(e) => handleInputChange('province', e.target.value)}
            placeholder="จังหวัด"
            className="input w-full"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            Post code*
          </label>
          <input
            type="text"
            value={address.postcode || ''}
            onChange={(e) => handleInputChange('postcode', e.target.value)}
            placeholder="รหัสไปรษณีย์"
            className="input w-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleGeocodeAddress}
          disabled={searching}
          className="btn btn-secondary text-xs"
        >
          {searching ? 'กำลังค้นหาพิกัด...' : '🔍 ค้นหาปักหมุดตามที่อยู่'}
        </button>
        <span className="text-xs text-gray-400">
          พิกัดปัจจุบัน: {currentCoords[0].toFixed(5)}, {currentCoords[1].toFixed(5)}
        </span>
      </div>

      {geoError && <p className="text-xs text-red-500">{geoError}</p>}

      {/* Map Location Picker Container */}
      <div className="relative mt-2 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <MapWithPicker
          center={currentCoords}
          onPositionChange={handleCoordsChange}
          className="h-[300px] w-full z-0"
        />
      </div>
      <p className="text-[11px] text-gray-400 text-center">
        💡 คุณสามารถคลิกค้างที่หมุดแล้วลาก (Drag) ไปยังตำแหน่งร้านที่ถูกต้องเพื่อความแม่นยำ
      </p>
    </div>
  );
}
