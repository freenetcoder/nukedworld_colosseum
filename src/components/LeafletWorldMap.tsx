import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { Country } from '../types/game';
import { useCountries } from '../hooks/useCountries';
import { BattleAttackAnimation } from './BattleAttackAnimation';
import { PvPBattleParticipant } from '../types/game';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Target, 
  Maximize2,
  Minimize2,
  Loader2,
  MapPin,
  Activity,
  Crosshair,
  Radar,
  Satellite,
  Shield,
  Zap,
  AlertTriangle,
  Eye,
  Navigation,
  Globe,
  Map,
  Layers,
  Users,
  Crown
} from 'lucide-react';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface LeafletWorldMapProps {
  selectedCountry?: string;
  onCountrySelect: (countryId: string) => void;
  mode?: 'select' | 'view';
  showStats?: boolean;
  battleData?: {
    participants: PvPBattleParticipant[]; // Raw participant data for animations
    participantCountries?: any[]; // Enhanced country data for markers
    latestAttackTurn?: any; // Single turn object for animation
    animationKey?: string; // Key to force re-render
    currentPlayer?: string;
    currentTurn?: string;
    targetMode: boolean;
    selectedTarget?: string;
  };
}

// Map layer configurations
const MAP_LAYERS = {
  satellite: {
    name: 'Satellite',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    overlay: true
  },
  terrain: {
    name: 'Terrain',
    icon: '🏔️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    overlay: false
  },
  dark: {
    name: 'Dark',
    icon: '🌙',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    overlay: false
  },
  military: {
    name: 'Military',
    icon: '⚔️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{x}/{y}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    overlay: false
  }
};

// Real world coordinates with enhanced precision
const REAL_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'usa': { lat: 39.8283, lng: -98.5795 },
  'russia': { lat: 61.5240, lng: 105.3188 },
  'china': { lat: 35.8617, lng: 104.1954 },
  'france': { lat: 46.2276, lng: 2.2137 },
  'uk': { lat: 55.3781, lng: -3.4360 },
  'india': { lat: 20.5937, lng: 78.9629 },
  'pakistan': { lat: 30.3753, lng: 69.3451 },
  'north_korea': { lat: 40.3399, lng: 127.5101 },
  'israel': { lat: 31.0461, lng: 34.8516 },
  'germany': { lat: 51.1657, lng: 10.4515 },
  'japan': { lat: 36.2048, lng: 138.2529 },
  'south_korea': { lat: 35.9078, lng: 127.7669 },
  'iran': { lat: 32.4279, lng: 53.6880 },
  'saudi_arabia': { lat: 23.8859, lng: 45.0792 },
  'ukraine': { lat: 48.3794, lng: 31.1656 },
  'mexico': { lat: 23.6345, lng: -102.5528 },
  'taiwan': { lat: 23.6978, lng: 120.9605 },
  'yemen': { lat: 15.5527, lng: 48.5164 },
  'greenland': { lat: 71.7069, lng: -42.0000 },
  'denmark': { lat: 56.2639, lng: 9.5018 },
  'new_zealand': { lat: -40.9006, lng: 174.8860 },
  'australia': { lat: -25.2744, lng: 133.7751 },
  'niger': { lat: 17.6078, lng: 8.0817 },
  'mali': { lat: 17.5707, lng: -3.9962 },
  'drc': { lat: -4.0383, lng: 21.7587 },
  'uganda': { lat: 1.3733, lng: 32.2903 }
};

// Generate strategic positions around a country for multiple players
const generatePlayerPositions = (baseCoords: { lat: number; lng: number }, playerCount: number, playerIndex: number) => {
  if (playerCount === 1) return baseCoords;
  
  // Create a circle of positions around the country center
  const radius = 2; // Degrees offset for positioning
  const angleStep = (2 * Math.PI) / Math.max(playerCount, 3); // Minimum 3 positions for better spacing
  const angle = angleStep * playerIndex;
  
  return {
    lat: baseCoords.lat + Math.cos(angle) * radius,
    lng: baseCoords.lng + Math.sin(angle) * radius
  };
};

// Map layer switcher component
const MapLayerSwitcher: React.FC<{
  currentLayer: string;
  onLayerChange: (layerId: string) => void;
}> = ({ currentLayer, onLayerChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black/95 backdrop-blur-md rounded-lg p-1.5 sm:p-2 border border-blue-500/30 shadow-lg text-white hover:bg-blue-500/20 transition-all duration-200 touch-manipulation"
        title="Change Map Layer"
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <Layers size={12} className="sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-mono">{MAP_LAYERS[currentLayer as keyof typeof MAP_LAYERS]?.icon}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 sm:mt-2 left-0 bg-black/95 backdrop-blur-md rounded-lg border border-blue-500/30 shadow-xl min-w-[140px] sm:min-w-[160px] z-[1001]">
          <div className="p-1.5 sm:p-2">
            <div className="text-white text-xs font-bold mb-1 sm:mb-2 font-mono border-b border-gray-600 pb-1 sm:pb-2">
              MAP LAYERS
            </div>
            {Object.entries(MAP_LAYERS).map(([layerId, layer]) => (
              <button
                key={layerId}
                onClick={() => {
                  onLayerChange(layerId);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded text-xs sm:text-sm font-mono transition-all duration-200 touch-manipulation ${
                  currentLayer === layerId
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-blue-500/20 hover:text-white'
                }`}
              >
                <span className="text-sm sm:text-lg">{layer.icon}</span>
                <span>{layer.name}</span>
                {currentLayer === layerId && (
                  <div className="ml-auto w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Custom map controls component
const MapControls: React.FC<{
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  mode: string;
  currentLayer: string;
  onLayerChange: (layerId: string) => void;
}> = ({ onZoomIn, onZoomOut, onReset, onToggleFullscreen, isFullscreen, mode, currentLayer, onLayerChange }) => {
  return (
    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-[1000] flex flex-col gap-1 sm:gap-2">
      <div className="bg-black/95 backdrop-blur-md rounded-lg p-1 sm:p-2 border border-red-500/30 shadow-lg">
        <div className="flex flex-col gap-0.5 sm:gap-1">
          <button
            onClick={onZoomIn}
            className="p-1.5 sm:p-2 text-white hover:text-green-400 hover:bg-green-500/20 rounded transition-all duration-200 group touch-manipulation"
            title="Zoom In"
          >
            <ZoomIn size={14} className="sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={onZoomOut}
            className="p-1.5 sm:p-2 text-white hover:text-blue-400 hover:bg-blue-500/20 rounded transition-all duration-200 group touch-manipulation"
            title="Zoom Out"
          >
            <ZoomOut size={14} className="sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Map Layer Switcher */}
      <MapLayerSwitcher
        currentLayer={currentLayer}
        onLayerChange={onLayerChange}
      />
    </div>
  );
};

// Map event handler component
const MapEventHandler: React.FC<{
  mapRef: React.MutableRefObject<L.Map | null>;
}> = ({ mapRef }) => {
  const map = useMap();

  // Store map reference for external controls
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  useMapEvents({
    zoomend: () => {
      // Handle zoom events if needed
    },
    moveend: () => {
      // Handle move events if needed
    }
  });

  return null;
};

// Enhanced player marker component for player-centered battles
const PlayerMarker: React.FC<{
  participant: any;
  country: Country;
  position: { lat: number; lng: number };
  isSelected: boolean;
  isCurrentPlayer: boolean;
  isCurrentTurn: boolean;
  isEliminated: boolean;
  canTarget: boolean;
  mode: string;
  onClick: () => void;
  onMouseEnter: (e: L.LeafletMouseEvent) => void;
  onMouseLeave: () => void;
  targetMode: boolean;
}> = ({ 
  participant, 
  country, 
  position, 
  isSelected, 
  isCurrentPlayer, 
  isCurrentTurn, 
  isEliminated, 
  canTarget, 
  mode, 
  onClick, 
  onMouseEnter, 
  onMouseLeave,
  targetMode
}) => {
  // Use useEffect to register click handler after marker is created
  useEffect(() => {
    const handleClick = () => {
      console.log(`Player click handler for ${participant.username}`);
      onClick();
    };

    // Register global handler
    (window as any)[`playerClick_${participant.player_id}`] = handleClick;

    // Cleanup
    return () => {
      delete (window as any)[`playerClick_${participant.player_id}`];
    };
  }, [participant.player_id, onClick]);

  // Create custom icon for player marker
  const getPlayerMarkerIcon = () => {
    let color = '#22C55E'; // Default green
    let size = window.innerWidth < 768 ? 32 : window.innerWidth < 1024 ? 36 : 40;
    let borderColor = 'white';
    let borderWidth = 3;
    let specialEffects = '';
    let healthBar = '';
    let crosshairOverlay = '';
    
    // Player status styling
    if (isCurrentPlayer) {
      color = '#FFD700'; // Gold for current player
      size = window.innerWidth < 768 ? 40 : window.innerWidth < 1024 ? 44 : 48;
      borderColor = '#FFA500';
      borderWidth = 5;
      specialEffects = 'animation: playerPulse 1.5s infinite;';
    } else if (isCurrentTurn) {
      color = '#3B82F6'; // Blue for current turn
      size = window.innerWidth < 768 ? 36 : window.innerWidth < 1024 ? 40 : 44;
      borderColor = '#60A5FA';
      borderWidth = 4;
      specialEffects = 'animation: pulse 2s infinite;';
    } else if (isSelected) {
      color = '#EF4444'; // Red for selected target
      size = window.innerWidth < 768 ? 40 : window.innerWidth < 1024 ? 44 : 48;
      borderColor = '#FF0000';
      borderWidth = 5;
      specialEffects = 'animation: targetPulse 0.8s infinite;';
      
      // Add crosshair overlay for selected target
      crosshairOverlay = `
        <div style="
          position: absolute;
          inset: -8px;
          pointer-events: none;
          z-index: 10;
        ">
          <!-- Crosshair lines -->
          <div style="
            position: absolute;
            top: 50%;
            left: -12px;
            right: -12px;
            height: 2px;
            background: #FF0000;
            transform: translateY(-50%);
            box-shadow: 0 0 8px rgba(255, 0, 0, 0.8);
          "></div>
          <div style="
            position: absolute;
            left: 50%;
            top: -12px;
            bottom: -12px;
            width: 2px;
            background: #FF0000;
            transform: translateX(-50%);
            box-shadow: 0 0 8px rgba(255, 0, 0, 0.8);
          "></div>
          
          <!-- Corner brackets -->
          <div style="
            position: absolute;
            top: -8px;
            left: -8px;
            width: 12px;
            height: 12px;
            border-top: 3px solid #FF0000;
            border-left: 3px solid #FF0000;
            box-shadow: 0 0 6px rgba(255, 0, 0, 0.6);
          "></div>
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            width: 12px;
            height: 12px;
            border-top: 3px solid #FF0000;
            border-right: 3px solid #FF0000;
            box-shadow: 0 0 6px rgba(255, 0, 0, 0.6);
          "></div>
          <div style="
            position: absolute;
            bottom: -8px;
            left: -8px;
            width: 12px;
            height: 12px;
            border-bottom: 3px solid #FF0000;
            border-left: 3px solid #FF0000;
            box-shadow: 0 0 6px rgba(255, 0, 0, 0.6);
          "></div>
          <div style="
            position: absolute;
            bottom: -8px;
            right: -8px;
            width: 12px;
            height: 12px;
            border-bottom: 3px solid #FF0000;
            border-right: 3px solid #FF0000;
            box-shadow: 0 0 6px rgba(255, 0, 0, 0.6);
          "></div>
          
          <!-- Target indicator -->
          <div style="
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            color: #FF0000;
            font-size: 16px;
            font-weight: bold;
            text-shadow: 0 0 8px rgba(255, 0, 0, 0.8);
            animation: targetBlink 1s infinite;
          ">🎯</div>
        </div>
      `;
    } else if (isEliminated) {
      color = '#6B7280'; // Gray for eliminated
      size = window.innerWidth < 768 ? 24 : window.innerWidth < 1024 ? 28 : 32;
      borderColor = '#9CA3AF';
      borderWidth = 2;
    } else if (canTarget) {
      color = targetMode ? '#FFA500' : '#F97316'; // Brighter orange in target mode
      size = window.innerWidth < 768 ? 32 : window.innerWidth < 1024 ? 36 : 40;
      borderColor = targetMode ? '#FFD700' : '#FB923C';
      borderWidth = targetMode ? 4 : 3;
      if (targetMode) {
        specialEffects = 'animation: targetableGlow 2s infinite;';
      }
    }
    
    // Add health bar for battle participants
    if (!isEliminated && participant) {
      const healthPercentage = (participant.current_health / participant.max_health) * 100;
      const healthColor = healthPercentage > 70 ? '#22C55E' : 
                         healthPercentage > 40 ? '#EAB308' : 
                         healthPercentage > 20 ? '#F97316' : '#EF4444';
      
      healthBar = `
        <div style="
          position: absolute;
          bottom: ${-size * 0.15}px;
          left: 50%;
          transform: translateX(-50%);
          width: ${size + 4}px;
          height: 4px;
          background: rgba(0,0,0,0.5);
          border-radius: 2px;
          overflow: hidden;
        ">
          <div style="
            width: ${healthPercentage}%;
            height: 100%;
            background: ${healthColor};
            transition: width 0.3s ease;
          "></div>
        </div>
      `;
    }

    // Special glow effect for current player
    const glowEffect = isCurrentPlayer 
      ? 'box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4);' 
      : 'box-shadow: 0 0 10px rgba(0,0,0,0.3);';

    // Better cursor handling for different modes
    const cursor = mode === 'view' ? 'default' : 
                  (mode === 'select') ? 
                    (canTarget ? 'crosshair' : (isSelected ? 'crosshair' : 'pointer')) : 
                  'default';

    // Responsive flag and username sizing
    const flagWidth = Math.max(16, size - 16);
    const flagHeight = Math.max(12, flagWidth * 0.75);
    const fontSize = Math.max(8, size * 0.2);

    // Multiple click handlers for better reliability
    const iconHtml = `
      <div 
        onclick="console.log('HTML onclick for ${participant.username}'); if(window.playerClick_${participant.player_id}) { console.log('Calling playerClick handler'); window.playerClick_${participant.player_id}(); } else { console.log('No playerClick handler found'); } event.stopPropagation();"
        onmousedown="console.log('HTML onmousedown for ${participant.username}'); if(window.playerClick_${participant.player_id}) window.playerClick_${participant.player_id}(); event.stopPropagation();"
        ontouchstart="console.log('HTML ontouchstart for ${participant.username}'); if(window.playerClick_${participant.player_id}) window.playerClick_${participant.player_id}(); event.stopPropagation();"
        ontouchend="event.preventDefault(); event.stopPropagation();"
        style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        border: ${borderWidth}px solid ${borderColor};
        ${glowEffect}
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: ${cursor};
        transition: all 0.2s ease;
        ${specialEffects}
        z-index: 3000;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        ">
        
        <!-- Country Flag -->
        <img 
          src="https://flagcdn.com/32x24/${country.code.toLowerCase()}.png" 
          alt="${country.name} flag"
          style="
            width: ${flagWidth}px;
            height: ${flagHeight}px;
            object-fit: cover;
            border-radius: 2px;
            ${(isCurrentPlayer) ? 'filter: brightness(1.2) saturate(1.3);' : ''}
            pointer-events: none;
            user-select: none;
            margin-bottom: 2px;
          "
        />
        
        <!-- Player Username -->
        <div style="
          font-size: ${fontSize}px;
          font-weight: bold;
          color: white;
          text-shadow: 0 0 3px rgba(0,0,0,0.8);
          text-align: center;
          max-width: ${size - 4}px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          pointer-events: none;
          font-family: monospace;
        ">${participant.username}</div>
        
        <!-- Current Player Crown -->
        ${isCurrentPlayer ? `
          <div style="
            position: absolute;
            top: ${-size * 0.25}px;
            left: 50%;
            transform: translateX(-50%);
            font-size: ${Math.max(12, size * 0.3)}px;
            animation: pulse 2s infinite;
            filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.8));
            pointer-events: none;
          ">👑</div>
        ` : ''}
        
        <!-- Current Turn Indicator -->
        ${isCurrentTurn && !isCurrentPlayer ? `
          <div style="
            position: absolute;
            top: ${-size * 0.2}px;
            right: ${-size * 0.2}px;
            width: ${Math.max(8, size * 0.25)}px;
            height: ${Math.max(8, size * 0.25)}px;
            background: #3B82F6;
            border-radius: 50%;
            border: 2px solid white;
            animation: pulse 1s infinite;
            pointer-events: none;
          "></div>
        ` : ''}
        
        <!-- Elimination Overlay -->
        ${isEliminated ? `
          <div style="
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.7);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${Math.max(12, size * 0.4)}px;
            pointer-events: none;
          ">💀</div>
        ` : ''}
        
        ${crosshairOverlay}
        ${healthBar}
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-player-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  };

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={getPlayerMarkerIcon()}
      eventHandlers={{
        // Backup Leaflet event handlers
        click: (e) => {
          console.log(`Leaflet click handler for player ${participant.username}`);
          console.log('Event details:', e);
          e.originalEvent?.stopPropagation();
          e.originalEvent?.preventDefault();
          onClick();
        },
        ...(targetMode ? {} : {
          mouseover: onMouseEnter,
          mouseout: onMouseLeave
        })
      }}
      zIndexOffset={2000}
    >
    
    </Marker>
  );
};

export const LeafletWorldMap: React.FC<LeafletWorldMapProps> = ({
  selectedCountry,
  onCountrySelect,
  mode = 'view',
  showStats = false,
  battleData
}) => {
  const { countries, loading, getCountryById } = useCountries();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredPlayer, setHoveredPlayer] = useState<any>(null);
  const [currentMapLayer, setCurrentMapLayer] = useState('dark');
  const mapRef = useRef<L.Map | null>(null);

  // Better player click handling with proper validation
  const handlePlayerClick = useCallback((participant: any) => {
    console.log(`Handling player click: ${participant.username} (${participant.player_id}) in mode: ${mode}`);
    console.log('battleData?.targetMode:', battleData?.targetMode);
    
    if (mode === 'select' && battleData?.targetMode) {
      console.log(`Selecting player target: ${participant.username} (${participant.player_id})`);
      onCountrySelect(participant.player_id); // Pass player_id instead of country_id
    } else {
      console.log('Not in target mode or wrong mode:', { mode, targetMode: battleData?.targetMode });
    }
  }, [mode, onCountrySelect, battleData?.targetMode]);

  // Mouse enter/leave handlers for player info
  const handlePlayerMouseEnter = useCallback((participant: any, e: L.LeafletMouseEvent) => {
    console.log(`Mouse enter: ${participant.username} in mode: ${mode}`);
    if (mode === 'view') {
      setHoveredPlayer(participant);
    }
  }, [mode]);

  const handlePlayerMouseLeave = useCallback(() => {
    if (mode === 'view') {
      setHoveredPlayer(null);
    }
  }, [mode]);

  // Map controls with proper map reference
  const handleMapControls = {
    onZoomIn: () => mapRef.current?.zoomIn(),
    onZoomOut: () => mapRef.current?.zoomOut(),
    onReset: () => mapRef.current?.setView([20, 0], 2),
    onToggleFullscreen: () => setIsFullscreen(!isFullscreen)
  };

  // Handle map layer change
  const handleLayerChange = useCallback((layerId: string) => {
    console.log(`Switching to map layer: ${layerId}`);
    setCurrentMapLayer(layerId);
  }, []);

  // Get current layer configuration
  const currentLayer = MAP_LAYERS[currentMapLayer as keyof typeof MAP_LAYERS] || MAP_LAYERS.dark;

  // Group participants by country for positioning
  const participantsByCountry = useMemo(() => {
    if (!battleData?.participants) return {};
    
    return battleData.participants.reduce((acc, participant) => {
      const countryId = participant.country_id;
      if (!acc[countryId]) {
        acc[countryId] = [];
      }
      acc[countryId].push(participant);
      return acc;
    }, {} as Record<string, any[]>);
  }, [battleData?.participants]);

  if (loading) {
    return (
      <div className="w-full h-[500px] lg:h-[550px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-xl border-2 border-red-500/30 overflow-hidden shadow-2xl flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-lg font-mono">SCANNING BATTLEFIELD...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[450px] lg:h-[550px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-xl border-2 border-red-500/30 overflow-hidden shadow-2xl">
      
      {/* Map Controls with Layer Switcher */}
      <MapControls
        onZoomIn={handleMapControls.onZoomIn}
        onZoomOut={handleMapControls.onZoomOut}
        onReset={handleMapControls.onReset}
        onToggleFullscreen={handleMapControls.onToggleFullscreen}
        isFullscreen={isFullscreen}
        mode={mode}
        currentLayer={currentMapLayer}
        onLayerChange={handleLayerChange}
      />

      {/* Battle Info Overlay */}
      {battleData?.participants && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[1000] bg-black/95 backdrop-blur-md rounded-lg p-2 sm:p-3 border border-purple-500/30 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-purple-400" size={14} />
            <span className="text-white font-semibold text-xs sm:text-sm">Battle Participants</span>
          </div>
          <div className="text-xs text-gray-300">
            Active: {battleData.participants.filter(p => !p.is_eliminated).length}/{battleData.participants.length}
          </div>
          {battleData.targetMode && (
            <div className="mt-2 text-xs text-red-400 font-semibold animate-pulse">
              🎯 TARGET MODE ACTIVE
            </div>
          )}
        </div>
      )}

      {/* Leaflet Map with Dynamic Layers */}
      <MapContainer
        center={[20, 0]}
        zoom={window.innerWidth < 768 ? 1 : 2}
        style={{ height: '100%', width: '100%' }}
        className="leaflet-map"
        zoomControl={false}
        attributionControl={false}
        preferCanvas={false}
        doubleClickZoom={false}
        closePopupOnClick={false}
        touchZoom={true}
        scrollWheelZoom={false}
        dragging={true}
      >
        {/* Dynamic tile layer based on selection */}
        <TileLayer
          key={currentMapLayer}
          url={currentLayer.url}
          attribution={currentLayer.attribution}
        />
        
        {/* Optional dark overlay for satellite view */}
        {currentMapLayer === 'satellite' && (
          <TileLayer
            url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            opacity={0.3}
          />
        )}

        {/* Map event handler with proper reference */}
        <MapEventHandler mapRef={mapRef} />

        {/* Player markers positioned strategically around countries */}
        {Object.entries(participantsByCountry).map(([countryId, participants]) => {
          const country = getCountryById(countryId);
          if (!country) return null;

          const baseCoords = REAL_COORDINATES[country.id];
          if (!baseCoords) return null;

          return participants.map((participant, index) => {
            const position = generatePlayerPositions(baseCoords, participants.length, index);
            
            return (
              <PlayerMarker
                key={participant.player_id}
                participant={participant}
                country={country}
                position={position}
                isSelected={battleData?.selectedTarget === participant.player_id}
                isCurrentPlayer={participant.player_id === battleData?.currentPlayer}
                isCurrentTurn={participant.player_id === battleData?.currentTurn}
                isEliminated={participant.is_eliminated}
                canTarget={!participant.is_eliminated && participant.player_id !== battleData?.currentPlayer}
                mode={mode}
                onClick={() => handlePlayerClick(participant)}
                onMouseEnter={(e) => handlePlayerMouseEnter(participant, e)}
                onMouseLeave={handlePlayerMouseLeave}
                targetMode={battleData?.targetMode || false}
              />
            );
          });
        })}
        
        {/* Real-time battle attack animation for latest attack */}
        {battleData?.latestAttackTurn && (
          <BattleAttackAnimation
            key={`${battleData.latestAttackTurn.id}-${battleData.animationKey}`}
            turn={battleData.latestAttackTurn}
            participants={battleData.participants}
            countries={countries}
            participantsByCountry={participantsByCountry}
          />
        )}

      </MapContainer>
      
      {/* Enhanced CSS for target mode animations */}
      <style>{`
        @keyframes targetPulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        
        @keyframes targetBlink {
          0%, 100% { 
            opacity: 1;
          }
          50% { 
            opacity: 0.3;
          }
        }
        
        @keyframes targetableGlow {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(255, 165, 0, 0.5);
          }
          50% { 
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
          }
        }
      `}</style>
    </div>
  );
};