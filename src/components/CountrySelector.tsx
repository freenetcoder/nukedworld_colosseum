import React from 'react';
import { Country } from '../types/game';
import { useCountries } from '../hooks/useCountries';
import { Shield, Zap, Users, DollarSign, Crown, Target, Loader2, Check } from 'lucide-react';

interface CountrySelectorProps {
  selectedCountry?: string;
  onSelect: (countryId: string) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onSelect
}) => {
  const { countries, loading, error } = useCountries();

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-lg">Loading countries...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-lg mb-2">Failed to load countries</div>
        <div className="text-gray-400">Please refresh the page to try again</div>
      </div>
    );
  }

  const sortedCountries = [...countries].sort((a, b) => b.military_strength - a.military_strength);
  const selectedCountryData = selectedCountry ? countries.find(c => c.id === selectedCountry) : null;

  return (
    <div className="space-y-6">
      {/* Countries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {sortedCountries.map((country, index) => (
          <button
            key={country.id}
            onClick={() => onSelect(country.id)}
            className={`group relative p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 transform touch-manipulation ${
              selectedCountry === country.id
                ? 'border-green-500 bg-gradient-to-br from-green-500/20 to-green-600/10 shadow-2xl shadow-green-500/30 scale-105'
                : 'border-red-500/40 bg-gradient-to-br from-slate-800/80 to-slate-900/60 hover:border-red-500/70 hover:bg-slate-800/90 hover:shadow-xl hover:shadow-red-500/20'
            } backdrop-blur-sm`}
          >
            {/* Rank Badge */}
            {index < 3 && (
              <div className={`absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                index === 0 ? 'bg-yellow-500 border-yellow-400 text-yellow-900' :
                index === 1 ? 'bg-gray-400 border-gray-300 text-gray-900' :
                'bg-orange-600 border-orange-500 text-orange-100'
              }`}>
                {index === 0 ? <Crown size={12} /> : `#${index + 1}`}
              </div>
            )}

            {/* Nuclear Badge */}
            {country.nuclear_capability && (
              <div className="absolute -top-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center border-2 border-orange-400 animate-pulse">
                <span className="text-xs">☢️</span>
              </div>
            )}

            {/* Country Header */}
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="text-2xl sm:text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <img 
                  src={`https://flagcdn.com/32x24/${country?.code.toString().toLowerCase()}.png`} 
                  alt='flag'
                  className="w-8 h-6 sm:w-10 sm:h-7 md:w-12 md:h-9 object-cover rounded-sm"
                />
              </div>
              <div className="text-left flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm sm:text-lg group-hover:text-green-400 transition-colors truncate">
                  {country.name}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm font-mono">{country.code}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="space-y-2 sm:space-y-3">
              {/* Population & GDP */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center gap-1 sm:gap-2 text-blue-400">
                  <Users size={12} className="flex-shrink-0" />
                  <div className="text-xs min-w-0">
                    <div className="font-semibold truncate">{formatNumber(country.population)}</div>
                    <div className="text-gray-500 text-xs">Population</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-green-400">
                  <DollarSign size={12} className="flex-shrink-0" />
                  <div className="text-xs min-w-0">
                    <div className="font-semibold truncate">${formatNumber(country.gdp)}</div>
                    <div className="text-gray-500 text-xs">GDP</div>
                  </div>
                </div>
              </div>

              {/* Military Strength Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2 text-red-400">
                    <Shield size={12} className="flex-shrink-0" />
                    <span className="text-xs font-semibold">Military</span>
                  </div>
                  <span className="text-red-400 text-xs sm:text-sm font-bold">{country.military_strength}/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      country.military_strength >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      country.military_strength >= 80 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                      country.military_strength >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                      'bg-gradient-to-r from-green-500 to-green-600'
                    }`}
                    style={{ 
                      width: `${country.military_strength}%`,
                      boxShadow: `0 0 10px ${
                        country.military_strength >= 90 ? 'rgba(239, 68, 68, 0.5)' :
                        country.military_strength >= 80 ? 'rgba(249, 115, 22, 0.5)' :
                        country.military_strength >= 70 ? 'rgba(234, 179, 8, 0.5)' :
                        'rgba(34, 197, 94, 0.5)'
                      }`
                    }}
                  ></div>
                </div>
              </div>

              {/* Nuclear Status */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <span className="text-gray-400 text-xs">Nuclear Capability</span>
                <div className={`flex items-center gap-1 ${country.nuclear_capability ? 'text-orange-400' : 'text-gray-500'}`}>
                  {country.nuclear_capability ? (
                    <>
                      <span className="text-xs animate-pulse">☢️</span>
                      <span className="text-xs font-semibold">Armed</span>
                    </>
                  ) : (
                    <span className="text-xs">Conventional</span>
                  )}
                </div>
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedCountry === country.id && (
              <div className="absolute inset-0 rounded-xl border-2 border-green-400 bg-green-400/5 flex items-center justify-center pointer-events-none">
                <div className="bg-green-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shadow-lg">
                  <Check size={12} />
                  <span className="hidden sm:inline">Selected as Homeland</span>
                  <span className="sm:hidden">Selected</span>
                </div>
              </div>
            )}

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-red-500/10 transition-all duration-300 pointer-events-none"></div>
          </button>
        ))}
      </div>

      {/* Selected Country Summary & Confirm Button - Always visible when country is selected */}
      {selectedCountryData && (
        <div className="sticky bottom-0 z-10 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md border-2 border-green-500/50 rounded-xl p-4 sm:p-6 shadow-2xl shadow-green-500/20">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Selected Country Info */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              <div className="text-3xl sm:text-4xl">
                <img 
                  src={`https://flagcdn.com/32x24/${selectedCountryData.code.toString().toLowerCase()}.png`} 
                  alt='flag'
                  className="w-10 h-7 sm:w-12 sm:h-9 object-cover rounded-sm"
                />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-white font-bold text-lg sm:text-xl mb-1">
                  {selectedCountryData.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                  <div className="flex items-center gap-1 text-blue-400">
                    <Users size={14} />
                    <span>{formatNumber(selectedCountryData.population)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-400">
                    <Shield size={14} />
                    <span>{selectedCountryData.military_strength}/100</span>
                  </div>
                  {selectedCountryData.nuclear_capability && (
                    <div className="flex items-center gap-1 text-orange-400">
                      <span className="animate-pulse">☢️</span>
                      <span className="font-semibold">Nuclear</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="w-full sm:w-auto">
              <button
                onClick={() => {
                  // This will be handled by the parent component
                  const event = new CustomEvent('confirmSelection');
                  window.dispatchEvent(event);
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 min-w-[200px]"
              >
                <Target size={20} />
                <span>Confirm Selection</span>
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-green-500/30">
            <p className="text-center text-green-400 text-sm font-semibold">
              ✓ You have selected {selectedCountryData.name} as your homeland
            </p>
            <p className="text-center text-gray-400 text-xs mt-1">
              Click "Confirm Selection" to proceed to the next step
            </p>
          </div>
        </div>
      )}
    </div>
  );
};