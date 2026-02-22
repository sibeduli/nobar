'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

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

const libraries: ("places" | "marker")[] = ["places", "marker"];

const MAP_ID = 'deed0cebc921b1a36eaa8cbc';

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

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialLat !== -6.2088 || initialLng !== 106.8456 ? { lat: initialLat, lng: initialLng } : null
  );
  const [mapCenter, setMapCenter] = useState({ lat: initialLat, lng: initialLng });
  const [zoom, setZoom] = useState(13);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  // Keep the callback ref updated
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Initialize PlaceAutocompleteElement when loaded
  useEffect(() => {
    if (!isLoaded || !autocompleteContainerRef.current) return;

    // Clear any existing content
    autocompleteContainerRef.current.innerHTML = '';

    // Create the new PlaceAutocompleteElement - Indonesia only
    // Use locationRestriction to strictly limit to Indonesia bounds

    const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({
      includedRegionCodes: ['id'],
      types: ['establishment'],
    } as google.maps.places.PlaceAutocompleteElementOptions);

    // Style the element - force light mode
    placeAutocomplete.style.width = '100%';
    placeAutocomplete.style.colorScheme = 'light';
    placeAutocomplete.style.border = '1px solid #a6a6acff';
    placeAutocomplete.style.borderRadius = '8px';
    
    // Append to container
    autocompleteContainerRef.current.appendChild(placeAutocomplete);

    // Listen for place selection
    const handlePlaceSelect = async (event: Event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectEvent = event as any;
      const placePrediction = selectEvent.placePrediction || selectEvent.detail?.placePrediction;
      
      if (!placePrediction) return;

      const place = placePrediction.toPlace();
      if (!place) return;

      // Fetch place details with error handling
      try {
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location', 'addressComponents'],
        });
      } catch (error) {
        console.error('Failed to fetch place details:', error);
        return;
      }

      const location = place.location;
      if (!location) return;

      const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
      const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
      
      if (typeof lat !== 'number' || typeof lng !== 'number') return;
      
      setMarker({ lat, lng });
      setMapCenter({ lat, lng });
      setZoom(17);

      // Parse address components
      if (place.addressComponents) {
        const components = place.addressComponents.map((c: { longText?: string; shortText?: string; types?: string[] }) => ({
          long_name: c.longText || '',
          short_name: c.shortText || '',
          types: c.types || [],
        }));
        const addressData = parseAddressComponents(components);
        addressData.alamatLengkap = addressData.alamatLengkap || place.formattedAddress || '';
        onLocationSelectRef.current(lat, lng, addressData);
      } else {
        onLocationSelectRef.current(lat, lng, {
          alamatLengkap: place.formattedAddress || '',
          kelurahan: '',
          kecamatan: '',
          kabupaten: '',
          provinsi: '',
          kodePos: '',
        });
      }
    };

    placeAutocomplete.addEventListener('gmp-select', handlePlaceSelect);

    // Capture container ref for cleanup
    const container = autocompleteContainerRef.current;

    return () => {
      // Cleanup - remove event listener and clear container
      placeAutocomplete.removeEventListener('gmp-select', handlePlaceSelect);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isLoaded]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Handle marker creation and updates
  useEffect(() => {
    if (!mapRef.current || !marker) return;
    
    if (markerRef.current) {
      markerRef.current.position = marker;
    } else {
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: marker,
      });
    }
  }, [marker]);

  // Cleanup marker on unmount
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
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
        onLocationSelectRef.current(lat, lng, addressData);
      } else {
        onLocationSelectRef.current(lat, lng, {
          alamatLengkap: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          kelurahan: '',
          kecamatan: '',
          kabupaten: '',
          provinsi: '',
          kodePos: '',
        });
      }
    });
  }, []);

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
        <div 
          ref={autocompleteContainerRef}
          className="w-full [&_input]:w-full [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:border [&_input]:border-gray-300 [&_input]:rounded-lg [&_input]:shadow-sm [&_input]:bg-white [&_input]:text-gray-900 [&_input]:placeholder:text-gray-400 [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-blue-500"
        />
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
          mapId: MAP_ID,
        }}
      >
        </GoogleMap>
    </div>
  );
}
