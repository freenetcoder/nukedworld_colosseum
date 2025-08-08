import React, { useState, useEffect, useRef } from 'react';
import { Marker, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Country, PvPBattleTurn, PvPBattleParticipant } from '../types/game';

interface BattleAttackAnimationProps {
  turn: PvPBattleTurn;
  participants: PvPBattleParticipant[];
  countries: Country[];
  participantsByCountry: Record<string, any[]>;
}

// Real world coordinates
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

export const BattleAttackAnimation: React.FC<BattleAttackAnimationProps> = ({ 
  turn, 
  participants, 
  countries,
  participantsByCountry
}) => {
  const [phase, setPhase] = useState<'incoming' | 'impact' | 'complete'>('incoming');
  const [missilePosition, setMissilePosition] = useState(0);
  const animationRef = useRef<boolean>(false);
  const timerRefs = useRef<NodeJS.Timeout[]>([]);

  // Only show animations for attack actions with damage
  if (turn.action_type !== 'attack' || turn.damage_dealt <= 0 || !turn.target_player_id) {
    return null;
  }

  console.log('BattleAttackAnimation rendering:', {
    turnId: turn.id,
    attacker: turn.username,
    targetPlayerId: turn.target_player_id,
    damage: turn.damage_dealt,
    weapon: turn.weapon_used,
    participantsCount: participants.length,
    phase
  });

  // Find attacker and target participants
  const attackerParticipant = participants.find(p => p.player_id === turn.player_id);
  const targetParticipant = participants.find(p => p.player_id === turn.target_player_id);

  if (!attackerParticipant || !targetParticipant) {
    console.warn('BattleAttackAnimation: Missing participant data', {
      attackerFound: !!attackerParticipant,
      targetFound: !!targetParticipant,
      attackerPlayerId: turn.player_id,
      targetPlayerId: turn.target_player_id,
      availableParticipants: participants.map(p => ({
        id: p.player_id,
        username: p.username,
        countryId: p.country_id
      })),
      participantsCount: participants.length
    });
    return null;
  }

  // Find countries for attacker and target
  const attackerCountry = countries.find(c => c.id === attackerParticipant.country_id);
  const targetCountry = countries.find(c => c.id === targetParticipant.country_id);

  if (!attackerCountry || !targetCountry) {
    console.warn('BattleAttackAnimation: Missing country data', {
      attackerCountryId: attackerParticipant.country_id,
      targetCountryId: targetParticipant.country_id,
      attackerCountryFound: !!attackerCountry,
      targetCountryFound: !!targetCountry
    });
    return null;
  }

  // Get precise player positions based on their arrangement in the country
  const getPlayerPosition = (participant: any, country: Country) => {
    const baseCoords = REAL_COORDINATES[country.id];
    if (!baseCoords) return baseCoords;

    const countryParticipants = participantsByCountry[country.id] || [];
    const playerIndex = countryParticipants.findIndex(p => p.player_id === participant.player_id);
    
    return generatePlayerPositions(baseCoords, countryParticipants.length, playerIndex);
  };

  const attackerCoords = getPlayerPosition(attackerParticipant, attackerCountry);
  const targetCoords = getPlayerPosition(targetParticipant, targetCountry);

  if (!attackerCoords || !targetCoords) {
    console.warn('BattleAttackAnimation: Missing coordinates', {
      attackerCountryId: attackerCountry.id,
      targetCountryId: targetCountry.id,
      attackerCoords: !!attackerCoords,
      targetCoords: !!targetCoords
    });
    return null;
  }

  // Cleanup function for timers
  const cleanupTimers = () => {
    timerRefs.current.forEach(timer => clearTimeout(timer));
    timerRefs.current = [];
  };

  useEffect(() => {
    // Prevent multiple animations for the same turn
    if (animationRef.current) {
      return;
    }
    
    animationRef.current = true;
    console.log('Starting player-to-player battle attack animation for turn:', turn.id);
    
    // Reset animation state
    setPhase('incoming');
    setMissilePosition(0);
    
    // Single animation sequence - NO REPEAT
    const timer1 = setTimeout(() => {
      setPhase('impact');
    }, 1500); // Faster animation
    
    const timer2 = setTimeout(() => {
      setPhase('complete');
      console.log('Player attack animation completed for turn:', turn.id);
    }, 3000); // Complete after 3 seconds total
    
    // Store timers for cleanup
    timerRefs.current = [timer1, timer2];

    // Optimized missile movement animation
    const missileInterval = setInterval(() => {
      setMissilePosition(prev => {
        if (prev >= 1) {
          clearInterval(missileInterval);
          return 1;
        }
        return prev + 0.04; // Faster missile movement
      });
    }, 50); // Smoother but less frequent updates

    return () => {
      cleanupTimers();
      clearInterval(missileInterval);
      animationRef.current = false;
    };
  }, [turn.id]); // Only depend on turn.id to prevent re-runs

  // Don't render anything after animation completes
  if (phase === 'complete') {
    return null;
  }

  const getDamageColor = () => {
    const damage = turn.damage_dealt || 0;
    if (damage > 40) return '#FF1744';
    if (damage > 25) return '#FF9800';
    return '#FFC107';
  };

  const getWeaponColor = () => {
    switch (turn.weapon_used) {
      case 'Nuclear Strike': return '#8B5CF6';
      case 'Artillery Barrage': return '#F97316';
      case 'Missile Strike':
      default: return '#EF4444';
    }
  };

  // Calculate missile position along trajectory
  const getMissilePosition = () => {
    const lat = attackerCoords.lat + (targetCoords.lat - attackerCoords.lat) * missilePosition;
    const lng = attackerCoords.lng + (targetCoords.lng - attackerCoords.lng) * missilePosition;
    return [lat, lng] as [number, number];
  };

  // Calculate rotation angle for rocket to point along trajectory
  const getTrajectoryAngle = () => {
    const deltaLat = targetCoords.lat - attackerCoords.lat;
    const deltaLng = targetCoords.lng - attackerCoords.lng;
    // Calculate angle in degrees, pointing from attacker to target
    const angle = Math.atan2(deltaLat, deltaLng) * (180 / Math.PI);
    return angle;
  };

  // Create optimized missile icon pointing along trajectory
  const createMissileIcon = () => {
    const rotation = getTrajectoryAngle();
    const weaponColor = getWeaponColor();
    const size = turn.weapon_used === 'Nuclear Strike' ? 28 : 24;
    
    const iconHtml = `
      <div style="
        width: ${size}px;
        height: 8px;
        background: linear-gradient(90deg, ${weaponColor} 0%, #FF9800 50%, #FFC107 100%);
        border-radius: 4px;
        box-shadow: 0 0 12px ${weaponColor}80;
        transform: rotate(${rotation}deg);
        transform-origin: center;
        position: relative;
        border: 1px solid rgba(255,255,255,0.3);
      ">
        <div style="
          position: absolute;
          right: -4px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid ${weaponColor};
          border-top: 3px solid transparent;
          border-bottom: 3px solid transparent;
        "></div>
        ${turn.weapon_used === 'Nuclear Strike' ? `
          <div style="
            position: absolute;
            top: -6px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            filter: drop-shadow(0 0 2px rgba(0,0,0,0.8));
          ">☢️</div>
        ` : ''}
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'battle-missile-marker',
      iconSize: [size, 8],
      iconAnchor: [size / 2, 4]
    });
  };

  // Create optimized explosion icon with player names
  const createExplosionIcon = () => {
    const size = phase === 'impact' ? 50 : 35;
    const damageColor = getDamageColor();
    const weaponEmoji = turn.weapon_used === 'Nuclear Strike' ? '☢️' : 
                       turn.weapon_used === 'Artillery Barrage' ? '💥' : '🚀';
    
    // Special styling for same-country attacks
    const isSameCountry = attackerParticipant.country_id === targetParticipant.country_id;
    const borderColor = isSameCountry ? '#FF6B6B' : damageColor;
    
    const iconHtml = `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, ${damageColor}80, transparent);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: explosion-${phase} 0.8s ease-out;
        position: relative;
        ${isSameCountry ? `border: 2px dashed ${borderColor};` : ''}
      ">
        <div style="
          font-size: ${size * 0.4}px;
          animation: explosion-emoji 0.8s ease-out;
        ">${weaponEmoji}</div>
        
        <!-- Damage Display -->
        <div style="
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-weight: bold;
          font-size: 11px;
          text-shadow: 0 0 4px rgba(0,0,0,0.9);
          font-family: monospace;
        ">-${Math.round(turn.damage_dealt)}</div>
        
        <!-- Player Names with Civil War Indicator -->
        <div style="
          position: absolute;
          bottom: -28px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-weight: bold;
          font-size: 8px;
          text-shadow: 0 0 4px rgba(0,0,0,0.9);
          font-family: monospace;
          white-space: nowrap;
          text-align: center;
        ">
          <div style="color: ${isSameCountry ? '#FF6B6B' : 'white'};">
            ${turn.username} → ${targetParticipant.username}
          </div>
          ${isSameCountry ? `
            <div style="color: #FF6B6B; font-size: 7px; margin-top: 1px;">
              ⚔️ CIVIL WAR
            </div>
          ` : ''}
        </div>
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'battle-explosion-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  // Special trajectory styling for same-country attacks
  const isSameCountry = attackerParticipant.country_id === targetParticipant.country_id;
  const trajectoryColor = isSameCountry ? '#FF6B6B' : getWeaponColor();
  const trajectoryPattern = isSameCountry ? "4, 4" : (turn.weapon_used === 'Artillery Barrage' ? "8, 4" : "12, 6");

  return (
    <>
      {/* Enhanced missile trajectory line with civil war styling */}
      {phase === 'incoming' && (
        <Polyline
          positions={[
            [attackerCoords.lat, attackerCoords.lng],
            [targetCoords.lat, targetCoords.lng]
          ]}
          color={trajectoryColor}
          weight={isSameCountry ? 4 : (turn.weapon_used === 'Nuclear Strike' ? 3 : 2)}
          opacity={isSameCountry ? 0.9 : 0.7}
          dashArray={trajectoryPattern}
          className={`battle-missile-trajectory ${isSameCountry ? 'civil-war' : ''}`}
        />
      )}

      {/* Moving missile pointing along trajectory */}
      {phase === 'incoming' && missilePosition < 1 && (
        <Marker
          position={getMissilePosition()}
          icon={createMissileIcon()}
          zIndexOffset={3000}
        />
      )}

      {/* Enhanced explosion at target with civil war indicator */}
      {phase === 'impact' && (
        <Marker
          position={[targetCoords.lat, targetCoords.lng]}
          icon={createExplosionIcon()}
          zIndexOffset={3001}
        />
      )}

      {/* Enhanced shockwave for powerful attacks */}
      {phase === 'impact' && turn.damage_dealt > 30 && (
        <Circle
          center={[targetCoords.lat, targetCoords.lng]}
          radius={turn.weapon_used === 'Nuclear Strike' ? 80000 : 40000}
          pathOptions={{
            color: trajectoryColor,
            fillColor: trajectoryColor,
            fillOpacity: isSameCountry ? 0.12 : 0.08,
            weight: isSameCountry ? 3 : 2,
            opacity: isSameCountry ? 0.7 : 0.5,
            dashArray: isSameCountry ? "8, 4" : undefined
          }}
          className={`battle-shockwave ${isSameCountry ? 'civil-war' : ''}`}
        />
      )}

      {/* Enhanced CSS for player-centered battle animations */}
      <style>{`
        .battle-missile-marker {
          background: transparent !important;
          border: none !important;
          z-index: 3000;
        }
        
        .battle-explosion-marker {
          background: transparent !important;
          border: none !important;
          z-index: 3001;
        }
        
        .battle-missile-trajectory {
          animation: battle-trajectory-dash 1s ease-out;
        }
        
        .battle-missile-trajectory.civil-war {
          animation: civil-war-trajectory 1.5s ease-out;
        }
        
        @keyframes explosion-impact {
          0% {
            transform: scale(0.2);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.9;
          }
        }
        
        @keyframes explosion-emoji {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes battle-trajectory-dash {
          0% {
            stroke-dashoffset: 50;
            opacity: 0;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.7;
          }
        }
        
        @keyframes civil-war-trajectory {
          0% {
            stroke-dashoffset: 50;
            opacity: 0;
          }
          50% {
            stroke-dashoffset: 25;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.9;
          }
        }
        
        .battle-shockwave {
          animation: battle-shockwave-expand 1s ease-out;
        }
        
        .battle-shockwave.civil-war {
          animation: civil-war-shockwave 1.2s ease-out;
        }
        
        @keyframes battle-shockwave-expand {
          0% {
            transform: scale(0);
            opacity: 0.6;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        
        @keyframes civil-war-shockwave {
          0% {
            transform: scale(0);
            opacity: 0.8;
          }
          50% {
            transform: scale(0.7);
            opacity: 0.6;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};