'use client';

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

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

const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

function parseAddressComponents(components: google.maps.GeocoderAddressComponent[]): AddressData {
  const get = (type: string) => components.find(c => c.types.includes(type))?.long_name || '';
  
  return {
    alamatLengkap: [
      get('route'),
      get('street_number'),
    ].filter(Boolean).join(' '),
    kelurahan: get('administrative_area_level_4') || get('sublocality_level_1') || get('sublocality'),
    kecamatan: get('administrative_area_level_3') || get('sublocality_level_2'),
    kabupaten: get('administrative_area_level_2') || get('locality'),
    provinsi: get('administrative_area_level_1'),
    kodePos: get('postal_code'),
  };
}

export default function MapPicker({ onLocationSelect, initialLat = -6.2088, initialLng = 106.8456 }: MapPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: initialLat, lng: initialLng });
  const [zoom, setZoom] = useState(13);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = useCallback(() => {
    // Map loaded
  }, []);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker({ lat, lng });

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const addressData = parseAddressComponents(results[0].address_components);
        addressData.alamatLengkap = addressData.alamatLengkap || results[0].formatted_address;
        onLocationSelect(lat, lng, addressData);
      } else {
        onLocationSelect(lat, lng, {
          alamatLengkap: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          kelurahan: '',
          kecamatan: '',
          kabupaten: '',
          provinsi: '',
          kodePos: '',
        });
      }
    });
  }, [onLocationSelect]);

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    
    const newPos = { lat, lng };
    setMarker(newPos);
    setMapCenter(newPos);
    setZoom(17);

    if (place.address_components) {
      const addressData = parseAddressComponents(place.address_components);
      addressData.alamatLengkap = addressData.alamatLengkap || place.formatted_address || '';
      onLocationSelect(lat, lng, addressData);
    }
  };

  if (loadError) {
    return (
      <div className="w-full h-72 bg-red-50 rounded-lg flex items-center justify-center">
        <p className="text-red-500">Gagal memuat peta</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-72 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Memuat peta...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72 rounded-lg overflow-hidden border border-gray-200 relative">
      <div className="absolute top-2 left-2 right-2 z-10">
        <Autocomplete
          onLoad={onAutocompleteLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            componentRestrictions: { country: 'id' },
            types: ['establishment', 'geocode'],
          }}
        >
          <input
            type="text"
            placeholder="Cari nama cafe, restoran, atau alamat..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Autocomplete>
      </div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onClick={onMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </div>
  );
}
