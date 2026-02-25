import { useState, useCallback } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { 
    MapPin,
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    ChevronDown,
    X,
    Phone,
    Navigation
} from 'lucide-react';

// Google Maps API Key - you can move this to env later
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Custom marker icons by status (using Google Maps symbol paths)
const getMarkerIcon = (status) => {
    const colors = {
        approved: '#10b981',
        pending: '#f59e0b',
        rejected: '#ef4444',
    };
    return {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: colors[status],
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 1.5,
        anchor: { x: 12, y: 24 },
    };
};

// Capacity tiers
const capacityTiers = {
    '≤50': { label: '≤50 orang', price: 5000000 },
    '51-100': { label: '51-100 orang', price: 10000000 },
    '101-250': { label: '101-250 orang', price: 20000000 },
    '251-500': { label: '251-500 orang', price: 40000000 },
    '501-1000': { label: '501-1000 orang', price: 100000000 },
};

// Mock venue data (same as Surveys/Index.jsx)
const mockVenues = [
    { id: 1, venueName: 'Warkop Bola Mania', venueType: 'Cafe/Warkop', contactPerson: 'Pak Joko', phone: '08123456789', address: 'Jl. Sudirman No. 45, Jakarta Selatan', area: 'Jakarta Selatan', capacityTier: '≤50', lat: -6.2088, lng: 106.8456, agentName: 'Ahmad Sudrajat', surveyDate: '2024-03-10', status: 'approved' },
    { id: 2, venueName: 'Resto Piala Dunia', venueType: 'Restoran', contactPerson: 'Bu Siti', phone: '08234567890', address: 'Jl. Gatot Subroto No. 12, Jakarta Barat', area: 'Jakarta Barat', capacityTier: '51-100', lat: -6.2350, lng: 106.7942, agentName: 'Budi Santoso', surveyDate: '2024-03-10', status: 'approved' },
    { id: 3, venueName: 'Kedai Kopi Stadium', venueType: 'Cafe/Warkop', contactPerson: 'Mas Andi', phone: '08345678901', address: 'Jl. Pemuda No. 78, Jakarta Timur', area: 'Jakarta Timur', capacityTier: '≤50', lat: -6.2254, lng: 106.9004, agentName: 'Citra Dewi', surveyDate: '2024-03-10', status: 'pending' },
    { id: 4, venueName: 'Bar Kick Off', venueType: 'Bar', contactPerson: 'Mr. Kevin', phone: '08456789012', address: 'Jl. Kemang Raya No. 100, Jakarta Selatan', area: 'Jakarta Selatan', capacityTier: '51-100', lat: -6.2607, lng: 106.8137, agentName: 'Eka Putri', surveyDate: '2024-03-09', status: 'rejected' },
    { id: 5, venueName: 'Hotel Grand Sport', venueType: 'Hotel/Penginapan', contactPerson: 'Ibu Maya', phone: '08567890123', address: 'Jl. Raya Serpong No. 55, Tangerang', area: 'Tangerang', capacityTier: '101-250', lat: -6.2894, lng: 106.6665, agentName: 'Fajar Ramadhan', surveyDate: '2024-03-09', status: 'approved' },
    { id: 6, venueName: 'Lapangan Futsal Jaya', venueType: 'Venue Olahraga', contactPerson: 'Pak Hendra', phone: '08678901234', address: 'Jl. Margonda Raya No. 200, Depok', area: 'Depok', capacityTier: '101-250', lat: -6.3702, lng: 106.8312, agentName: 'Hendra Wijaya', surveyDate: '2024-03-08', status: 'approved' },
    { id: 7, venueName: 'Balai RW 05 Menteng', venueType: 'Balai Warga/Komunitas', contactPerson: 'Ketua RW', phone: '08789012345', address: 'Jl. Thamrin No. 30, Jakarta Pusat', area: 'Jakarta Pusat', capacityTier: '51-100', lat: -6.1944, lng: 106.8229, agentName: 'Dedi Kurniawan', surveyDate: '2024-03-08', status: 'approved' },
    { id: 8, venueName: 'Cafe Nonton Bareng', venueType: 'Cafe/Warkop', contactPerson: 'Mas Budi', phone: '08890123456', address: 'Jl. Raya Bogor No. 150, Bogor', area: 'Bogor', capacityTier: '≤50', lat: -6.5971, lng: 106.8060, agentName: 'Indah Permata', surveyDate: '2024-03-07', status: 'pending' },
    { id: 9, venueName: 'Restoran Sunda Goal', venueType: 'Restoran', contactPerson: 'Bu Rina', phone: '08901234567', address: 'Jl. Juanda No. 88, Bekasi', area: 'Bekasi', capacityTier: '101-250', lat: -6.2383, lng: 107.0000, agentName: 'Gita Nuraini', surveyDate: '2024-03-07', status: 'approved' },
    { id: 10, venueName: 'Sport Bar Champions', venueType: 'Bar', contactPerson: 'Mr. David', phone: '08012345678', address: 'Jl. Senopati No. 200, Jakarta Selatan', area: 'Jakarta Selatan', capacityTier: '51-100', lat: -6.2443, lng: 106.8065, agentName: 'Joko Susilo', surveyDate: '2024-03-06', status: 'approved' },
    { id: 11, venueName: 'Hotel Bintang Lima', venueType: 'Hotel/Penginapan', contactPerson: 'GM Hotel', phone: '08123456780', address: 'Jl. Merdeka No. 10, Jakarta Pusat', area: 'Jakarta Pusat', capacityTier: '251-500', lat: -6.1751, lng: 106.8272, agentName: 'Lukman Hakim', surveyDate: '2024-03-06', status: 'approved' },
    { id: 12, venueName: 'GOR Kecamatan Ciputat', venueType: 'Venue Olahraga', contactPerson: 'Kepala GOR', phone: '08234567891', address: 'Jl. Raya Ciputat No. 75, Tangerang', area: 'Tangerang', capacityTier: '251-500', lat: -6.3105, lng: 106.7535, agentName: 'Kartika Sari', surveyDate: '2024-03-05', status: 'pending' },
];

const venueTypes = ['Cafe/Warkop', 'Restoran', 'Bar', 'Hotel/Penginapan', 'Venue Olahraga', 'Balai Warga/Komunitas'];
const areas = ['Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Pusat', 'Jakarta Utara', 'Tangerang', 'Bekasi', 'Depok', 'Bogor'];

// Map container style
const containerStyle = {
    width: '100%',
    height: '100%'
};

// Default center (Jakarta)
const defaultCenter = {
    lat: -6.2088,
    lng: 106.8456
};

// Style to hide all POIs (Google places)
const hidePOIStyles = [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

// Dark mode map styles
const darkMapStyles = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
    { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

export default function VenuesMap() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY
    });

    const [map, setMap] = useState(null);
    const [venues] = useState(mockVenues);
    const [showFilters, setShowFilters] = useState(false);
    const [hidePOI, setHidePOI] = useState(true);
    const [filters, setFilters] = useState({
        status: [],
        venueType: [],
        area: [],
    });
    const [selectedVenue, setSelectedVenue] = useState(null);

    const onLoad = useCallback((map) => {
        // Fit bounds to show all venues
        if (mockVenues.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            mockVenues.forEach(venue => {
                bounds.extend({ lat: venue.lat, lng: venue.lng });
            });
            map.fitBounds(bounds);
        }
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Filter venues
    const filteredVenues = venues.filter(venue => {
        if (filters.status.length > 0 && !filters.status.includes(venue.status)) return false;
        if (filters.venueType.length > 0 && !filters.venueType.includes(venue.venueType)) return false;
        if (filters.area.length > 0 && !filters.area.includes(venue.area)) return false;
        return true;
    });

    // Stats
    const stats = {
        total: filteredVenues.length,
        approved: filteredVenues.filter(v => v.status === 'approved').length,
        pending: filteredVenues.filter(v => v.status === 'pending').length,
        rejected: filteredVenues.filter(v => v.status === 'rejected').length,
    };

    const toggleFilter = (type, value) => {
        setFilters(prev => ({
            ...prev,
            [type]: prev[type].includes(value)
                ? prev[type].filter(v => v !== value)
                : [...prev[type], value]
        }));
    };

    const clearFilters = () => {
        setFilters({ status: [], venueType: [], area: [] });
    };

    const hasActiveFilters = filters.status.length > 0 || filters.venueType.length > 0 || filters.area.length > 0;

    const StatusBadge = ({ status }) => {
        const config = {
            approved: { label: 'Disetujui', color: 'emerald', icon: CheckCircle },
            pending: { label: 'Pending', color: 'amber', icon: Clock },
            rejected: { label: 'Ditolak', color: 'red', icon: XCircle },
        };
        const { label, color, icon: Icon } = config[status];
        const colors = {
            emerald: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
            amber: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700',
            red: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700',
        };

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${colors[color]}`}>
                <Icon className="w-3 h-3" />
                {label}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-6rem)] flex flex-col">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h1 className={`text-2xl font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                            Peta Venue
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            Lokasi venue terdaftar untuk lisensi Nobar Piala Dunia 2026
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                            ${hasActiveFilters
                                ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-100 text-teal-700'
                                : isDark ? 'bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/50' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }
                        `}
                    >
                        <Filter className="w-4 h-4" />
                        Filter
                        {hasActiveFilters && (
                            <span className={`px-1.5 py-0.5 text-xs rounded-full ${isDark ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white'}`}>
                                {filters.status.length + filters.venueType.length + filters.area.length}
                            </span>
                        )}
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className={`mb-4 p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className={`text-sm font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Filter Venue</span>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className={`text-xs flex items-center gap-1 ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}`}
                                >
                                    <X className="w-3 h-3" />
                                    Reset
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Status Filter */}
                            <div>
                                <p className={`text-xs font-medium mb-2 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Status</p>
                                <div className="flex flex-wrap gap-2">
                                    {['approved', 'pending', 'rejected'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => toggleFilter('status', status)}
                                            className={`px-3 py-1 text-xs rounded-full transition-colors
                                                ${filters.status.includes(status)
                                                    ? status === 'approved' 
                                                        ? 'bg-emerald-500 text-white'
                                                        : status === 'pending'
                                                            ? 'bg-amber-500 text-white'
                                                            : 'bg-red-500 text-white'
                                                    : isDark ? 'bg-emerald-950/50 text-emerald-400' : 'bg-gray-100 text-gray-700'
                                                }
                                            `}
                                        >
                                            {status === 'approved' ? 'Disetujui' : status === 'pending' ? 'Pending' : 'Ditolak'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Venue Type Filter */}
                            <div>
                                <p className={`text-xs font-medium mb-2 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Jenis Venue</p>
                                <div className="flex flex-wrap gap-2">
                                    {venueTypes.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => toggleFilter('venueType', type)}
                                            className={`px-3 py-1 text-xs rounded-full transition-colors
                                                ${filters.venueType.includes(type)
                                                    ? isDark ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white'
                                                    : isDark ? 'bg-emerald-950/50 text-emerald-400' : 'bg-gray-100 text-gray-700'
                                                }
                                            `}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Area Filter */}
                            <div>
                                <p className={`text-xs font-medium mb-2 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Area</p>
                                <div className="flex flex-wrap gap-2">
                                    {areas.map(area => (
                                        <button
                                            key={area}
                                            onClick={() => toggleFilter('area', area)}
                                            className={`px-3 py-1 text-xs rounded-full transition-colors
                                                ${filters.area.includes(area)
                                                    ? isDark ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white'
                                                    : isDark ? 'bg-emerald-950/50 text-emerald-400' : 'bg-gray-100 text-gray-700'
                                                }
                                            `}
                                        >
                                            {area}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Bar */}
                <div className={`mb-4 p-3 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <MapPin className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                            <span className={`text-sm font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{stats.total} Venue</span>
                        </div>
                        <div className="hidden sm:block h-4 w-px bg-gray-300" />
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className={isDark ? 'text-emerald-100' : 'text-gray-600'}>{stats.approved} Disetujui</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className={isDark ? 'text-emerald-100' : 'text-gray-600'}>{stats.pending} Pending</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                <span className={isDark ? 'text-emerald-100' : 'text-gray-600'}>{stats.rejected} Ditolak</span>
                            </span>
                        </div>
                    </div>
                    
                    {/* Hide POI Toggle */}
                    <button
                        onClick={() => setHidePOI(!hidePOI)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors mt-3
                            ${hidePOI
                                ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-100 text-teal-700'
                                : isDark ? 'bg-emerald-950/50 text-emerald-500/60' : 'bg-gray-100 text-gray-500'
                            }
                        `}
                    >
                        <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center
                            ${hidePOI 
                                ? isDark ? 'border-emerald-400 bg-emerald-400' : 'border-teal-600 bg-teal-600'
                                : isDark ? 'border-emerald-500/40' : 'border-gray-400'
                            }
                        `}>
                            {hidePOI && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </span>
                        {hidePOI ? 'Perlihatkan Google Places' : 'Sembunyikan Google Places'}
                    </button>
                </div>

                {/* Map Container */}
                <div className={`flex-1 rounded-xl overflow-hidden ${isDark ? 'border border-emerald-900/30' : 'border border-gray-200'}`}>
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={defaultCenter}
                            zoom={11}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                            options={{
                                styles: [
                                    ...(isDark ? darkMapStyles : []),
                                    ...(hidePOI ? hidePOIStyles : []),
                                ],
                                disableDefaultUI: false,
                                zoomControl: true,
                                mapTypeControl: true,
                                streetViewControl: false,
                                fullscreenControl: true,
                            }}
                        >
                            {filteredVenues.map(venue => (
                                <Marker
                                    key={venue.id}
                                    position={{ lat: venue.lat, lng: venue.lng }}
                                    icon={getMarkerIcon(venue.status)}
                                    onClick={() => setSelectedVenue(venue)}
                                />
                            ))}

                            {selectedVenue && (
                                <InfoWindow
                                    position={{ lat: selectedVenue.lat, lng: selectedVenue.lng }}
                                    onCloseClick={() => setSelectedVenue(null)}
                                >
                                    <div className="min-w-[220px] p-1">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-semibold text-gray-900">{selectedVenue.venueName}</h3>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full mb-2
                                            ${selectedVenue.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                                              selectedVenue.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                              'bg-red-100 text-red-700'}
                                        `}>
                                            {selectedVenue.status === 'approved' ? 'Disetujui' : 
                                             selectedVenue.status === 'pending' ? 'Pending' : 'Ditolak'}
                                        </span>
                                        <p className="text-xs text-gray-500 mb-1">{selectedVenue.venueType}</p>
                                        <p className="text-sm text-gray-700 mb-2">{selectedVenue.address}</p>
                                        <div className="text-xs text-gray-500 mb-2">
                                            Kapasitas: {capacityTiers[selectedVenue.capacityTier]?.label}
                                        </div>
                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                            <Phone className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-600">{selectedVenue.contactPerson} - {selectedVenue.phone}</span>
                                        </div>
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedVenue.lat},${selectedVenue.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-1 mt-2 px-3 py-1.5 bg-teal-600 text-white text-xs rounded-lg hover:bg-teal-700 transition-colors"
                                        >
                                            <Navigation className="w-3 h-3" />
                                            Navigasi
                                        </a>
                                    </div>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    ) : (
                        <div className={`flex items-center justify-center h-full ${isDark ? 'bg-[#0d1414]' : 'bg-gray-100'}`}>
                            <div className="text-center">
                                <div className={`animate-spin w-8 h-8 border-4 border-t-transparent rounded-full mx-auto mb-2 ${isDark ? 'border-emerald-500' : 'border-teal-600'}`}></div>
                                <p className={`text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Memuat peta...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
