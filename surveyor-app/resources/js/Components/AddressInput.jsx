import { useState, useEffect } from 'react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Loader2 } from 'lucide-react';

export default function AddressInput({
    province,
    city,
    district,
    postalCode,
    address,
    onChange,
    errors = {},
    showDistrict = false,
    required = false,
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loadingProvinces, setLoadingProvinces] = useState(true);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);

    // Fetch provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await fetch('/api/provinces');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setProvinces(data || []);
            } catch (err) {
                console.error('Failed to fetch provinces:', err);
                setProvinces([]);
            } finally {
                setLoadingProvinces(false);
            }
        };
        fetchProvinces();
    }, []);

    // Fetch cities when province changes
    useEffect(() => {
        if (!province) {
            setCities([]);
            setDistricts([]);
            return;
        }

        const selectedProvince = provinces.find(p => p.name === province);
        if (!selectedProvince) return;

        const fetchCities = async () => {
            setLoadingCities(true);
            try {
                const res = await fetch(`/api/cities/${selectedProvince.id}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setCities(data || []);
            } catch (err) {
                console.error('Failed to fetch cities:', err);
                setCities([]);
            } finally {
                setLoadingCities(false);
            }
        };
        fetchCities();
    }, [province, provinces]);

    // Fetch districts when city changes
    useEffect(() => {
        if (!showDistrict || !city) {
            setDistricts([]);
            return;
        }

        const selectedCity = cities.find(c => c.name === city);
        if (!selectedCity) return;

        const fetchDistricts = async () => {
            setLoadingDistricts(true);
            try {
                const res = await fetch(`/api/districts/${selectedCity.id}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setDistricts(data || []);
            } catch (err) {
                console.error('Failed to fetch districts:', err);
                setDistricts([]);
            } finally {
                setLoadingDistricts(false);
            }
        };
        fetchDistricts();
    }, [city, cities, showDistrict]);

    const handleProvinceChange = (e) => {
        const value = e.target.value;
        onChange('province', value);
        onChange('city', ''); // Reset city when province changes
        if (showDistrict) onChange('district', '');
    };

    const handleCityChange = (e) => {
        const value = e.target.value;
        onChange('city', value);
        if (showDistrict) onChange('district', '');
    };

    const handleDistrictChange = (e) => {
        onChange('district', e.target.value);
    };

    const selectClass = `w-full px-3 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2
        ${isDark 
            ? `bg-[#0d1414] border-emerald-900/50 text-emerald-100 focus:ring-emerald-500/50` 
            : `bg-white border-gray-300 text-gray-900 focus:ring-teal-500`
        }`;

    const optionClass = isDark ? 'bg-[#0d1414] text-emerald-100' : '';

    const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`;

    return (
        <div className="space-y-4">
            {/* Province */}
            <div>
                <label className={labelClass}>
                    Provinsi {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                    <select
                        value={province || ''}
                        onChange={handleProvinceChange}
                        disabled={loadingProvinces}
                        className={`${selectClass} ${errors.province ? 'border-red-500' : ''}`}
                    >
                        <option value="" className={optionClass}>
                            {loadingProvinces ? 'Memuat...' : 'Pilih Provinsi'}
                        </option>
                        {provinces.map(p => (
                            <option key={p.id} value={p.name} className={optionClass}>{p.name}</option>
                        ))}
                    </select>
                    {loadingProvinces && (
                        <Loader2 className={`absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin ${isDark ? 'text-emerald-500' : 'text-teal-500'}`} />
                    )}
                </div>
                {errors.province && <p className="mt-1.5 text-xs text-red-500">{errors.province}</p>}
            </div>

            {/* City */}
            <div>
                <label className={labelClass}>
                    Kota/Kabupaten {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                    <select
                        value={city || ''}
                        onChange={handleCityChange}
                        disabled={!province || loadingCities}
                        className={`${selectClass} ${errors.city ? 'border-red-500' : ''} ${!province ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <option value="" className={optionClass}>
                            {loadingCities ? 'Memuat...' : !province ? 'Pilih provinsi terlebih dahulu' : 'Pilih Kota/Kabupaten'}
                        </option>
                        {cities.map(c => (
                            <option key={c.id} value={c.name} className={optionClass}>{c.name}</option>
                        ))}
                    </select>
                    {loadingCities && (
                        <Loader2 className={`absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin ${isDark ? 'text-emerald-500' : 'text-teal-500'}`} />
                    )}
                </div>
                {errors.city && <p className="mt-1.5 text-xs text-red-500">{errors.city}</p>}
            </div>

            {/* District (optional) */}
            {showDistrict && (
                <div>
                    <label className={labelClass}>
                        Kecamatan
                    </label>
                    <div className="relative">
                        <select
                            value={district || ''}
                            onChange={handleDistrictChange}
                            disabled={!city || loadingDistricts}
                            className={`${selectClass} ${!city ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <option value="" className={optionClass}>
                                {loadingDistricts ? 'Memuat...' : !city ? 'Pilih kota terlebih dahulu' : 'Pilih Kecamatan'}
                            </option>
                            {districts.map(d => (
                                <option key={d.id} value={d.name} className={optionClass}>{d.name}</option>
                            ))}
                        </select>
                        {loadingDistricts && (
                            <Loader2 className={`absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin ${isDark ? 'text-emerald-500' : 'text-teal-500'}`} />
                        )}
                    </div>
                </div>
            )}

            {/* Postal Code */}
            <div>
                <label className={labelClass}>
                    Kode Pos
                </label>
                <input
                    type="text"
                    value={postalCode || ''}
                    onChange={(e) => onChange('postalCode', e.target.value)}
                    placeholder="Masukkan kode pos"
                    maxLength={5}
                    className={`w-full px-3 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2
                        ${isDark 
                            ? 'bg-[#0d1414] border-emerald-900/50 text-emerald-100 placeholder-emerald-500/40 focus:ring-emerald-500/50' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-teal-500'
                        }
                    `}
                />
            </div>

            {/* Address Detail */}
            <div>
                <label className={labelClass}>
                    Alamat Lengkap {required && <span className="text-red-500">*</span>}
                </label>
                <textarea
                    value={address || ''}
                    onChange={(e) => onChange('address', e.target.value)}
                    placeholder="Nama jalan, nomor, RT/RW, kelurahan..."
                    rows={3}
                    className={`w-full px-3 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 resize-none
                        ${isDark 
                            ? 'bg-[#0d1414] border-emerald-900/50 text-emerald-100 placeholder-emerald-500/40 focus:ring-emerald-500/50' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-teal-500'
                        }
                        ${errors.address ? 'border-red-500' : ''}
                    `}
                />
                {errors.address && <p className="mt-1.5 text-xs text-red-500">{errors.address}</p>}
            </div>
        </div>
    );
}
