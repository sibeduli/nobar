'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface AddressData {
  alamatLengkap: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
}

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, addressData: AddressData) => void;
  initialLat?: number;
  initialLng?: number;
}

function LocationMarker({ 
  position, 
  setPosition,
  onLocationSelect 
}: { 
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
  onLocationSelect: (lat: number, lng: number, addressData: AddressData) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id&addressdetails=1`)
        .then(res => res.json())
        .then(data => {
          const addr = data.address || {};
          const addressData: AddressData = {
            alamatLengkap: [
              addr.road,
              addr.house_number,
              addr.neighbourhood,
            ].filter(Boolean).join(' ') || data.display_name || '',
            kelurahan: addr.village || addr.suburb || addr.neighbourhood || '',
            kecamatan: addr.subdistrict || addr.district || '',
            kabupaten: addr.city || addr.county || addr.regency || addr.municipality || '',
            provinsi: addr.state || addr.province || '',
            kodePos: addr.postcode || '',
          };
          onLocationSelect(lat, lng, addressData);
        })
        .catch(() => {
          onLocationSelect(lat, lng, {
            alamatLengkap: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            kelurahan: '',
            kecamatan: '',
            kabupaten: '',
            provinsi: '',
            kodePos: '',
          });
        });
    },
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

function SearchControl({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (value.length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setIsSearching(true);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=id&limit=5&accept-language=id`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setIsSearching(false);
        })
        .catch(() => {
          setResults([]);
          setIsSearching(false);
        });
    }, 300);
  };

  const selectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    map.flyTo([lat, lng], 17);
    onSelect(lat, lng);
    setQuery(result.display_name);
    setResults([]);
  };

  return (
    <div className="absolute top-2 left-2 right-2 z-[1000]">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Cari nama cafe, restoran, atau alamat..."
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isSearching && (
        <div className="mt-1 p-2 bg-white rounded-lg shadow text-sm text-gray-500">
          Mencari...
        </div>
      )}
      {results.length > 0 && (
        <ul className="mt-1 bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map((result, i) => (
            <li
              key={i}
              onClick={() => selectResult(result)}
              className="px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MapPicker({ onLocationSelect, initialLat = -6.2088, initialLng = 106.8456 }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSearchSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id&addressdetails=1`)
      .then(res => res.json())
      .then(data => {
        const addr = data.address || {};
        const addressData: AddressData = {
          alamatLengkap: [
            addr.road,
            addr.house_number,
            addr.neighbourhood,
          ].filter(Boolean).join(' ') || data.display_name || '',
          kelurahan: addr.village || addr.suburb || addr.neighbourhood || '',
          kecamatan: addr.subdistrict || addr.district || '',
          kabupaten: addr.city || addr.county || addr.regency || addr.municipality || '',
          provinsi: addr.state || addr.province || '',
          kodePos: addr.postcode || '',
        };
        onLocationSelect(lat, lng, addressData);
      })
      .catch(() => {
        onLocationSelect(lat, lng, {
          alamatLengkap: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          kelurahan: '',
          kecamatan: '',
          kabupaten: '',
          provinsi: '',
          kodePos: '',
        });
      });
  };

  if (!isClient) {
    return (
      <div className="w-full h-72 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Memuat peta...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72 rounded-lg overflow-hidden border border-gray-200 relative">
      <MapContainer
        center={[initialLat, initialLng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SearchControl onSelect={handleSearchSelect} />
        <LocationMarker 
          position={position} 
          setPosition={setPosition}
          onLocationSelect={onLocationSelect}
        />
      </MapContainer>
    </div>
  );
}
