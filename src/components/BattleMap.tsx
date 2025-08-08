import React, { useState, useCallback, useEffect } from 'react';
import { LeafletWorldMap } from './LeafletWorldMap';
import { PvPBattle, PvPBattleParticipant, PvPBattleTurn, GamePlayer } from '../types/game';
import { useCountries } from '../hooks/useCountries';
import { supabase } from '../lib/supabase';
import { 
  Target, 
  Crosshair, 
  Zap, 
  Shield,
  Crown,
  Activity,
  MapPin,
  Users,
  Clock,
  Timer
} from 'lucide-react';

interface BattleMapProps {
  battle: PvPBattle;
  participants: PvPBattleParticipant[];
  turns: PvPBattleTurn[];
  currentPlayer: GamePlayer | null;
  isMyTurn: boolean;
  selectedTarget: string;
  onTargetSelect: (targetId: string) => void;
  targetMode: boolean;
  timeRemaining: number;
}

export const BattleMap: React.FC<BattleMapProps> = ({
  battle,
  participants,
  turns,
  currentPlayer,
  isMyTurn,
  selectedTarget,
  onTargetSelect,
  targetMode,
  timeRemaining
}) => {
  const { getCountryById } = useCountries();
  const [latestAttackTurn, setLatestAttackTurn] = useState<PvPBattleTurn | null>(null);
  const [animationKey, setAnimationKey] = useState<string>('');

  // Convert participants to enhanced country objects for the map
  const participantCountries = participants.map(participant => {
    const country = getCountryById(participant.country_id);
    if (!country) return null;
    
    return {
      ...country,
      participant,
      isCurrentPlayer: participant.player_id === currentPlayer?.id,
      isCurrentTurn: participant.player_id === battle.current_turn_player_id,
      isSelected: participant.player_id === selectedTarget,
      canTarget: !participant.is_eliminated && participant.player_id !== currentPlayer?.id,
      isEliminated: participant.is_eliminated
    };
  }).filter(Boolean);

  // Handle country selection in battle mode
  const handleCountrySelect = useCallback((countryId: string) => {
    console.log('BattleMap handleCountrySelect called with:', countryId, 'targetMode:', targetMode, 'isMyTurn:', isMyTurn);
    
    if (!targetMode || !isMyTurn) return;
    
    // Check if countryId is actually a player_id (from map click)
    let participant = participants.find(p => p.player_id === countryId);
    
    // If not found, try to find by country_id (fallback)
    if (!participant) {
      participant = participants.find(p => p.country_id === countryId);
    }
    
    console.log('Found participant:', participant);
    if (!participant) return;
    
    // Can only target non-eliminated players that aren't yourself
    if (participant.is_eliminated || participant.player_id === currentPlayer?.id) {
      console.log('Cannot target this participant:', {
        isEliminated: participant.is_eliminated,
        isCurrentPlayer: participant.player_id === currentPlayer?.id
      });
      return;
    }
    
    // Select target - pass player_id instead of country_id
    console.log('Selecting target:', participant.player_id, participant.username);
    onTargetSelect(participant.player_id);
  }, [targetMode, isMyTurn, participants, currentPlayer?.id, onTargetSelect]);

  // Process latest attack turn for real-time animation
  useEffect(() => {
    console.log('Processing turns for latest attack animation:', turns.length);
    
    // Find the latest attack turn with damage
    const latestAttack = turns
      .filter(turn => 
        turn.action_type === 'attack' && 
        turn.damage_dealt > 0 &&
        turn.target_player_id
      )
      .sort((a, b) => new Date(b.turn_end_time).getTime() - new Date(a.turn_end_time).getTime())[0];

    if (latestAttack) {
      console.log('Latest attack found:', {
        turnId: latestAttack.id,
        attacker: latestAttack.username,
        weapon: latestAttack.weapon_used,
        damage: latestAttack.damage_dealt,
        turnNumber: latestAttack.turn_number
      });
      
      // Create unique animation key to force re-render when attack changes
      const newAnimationKey = `${latestAttack.id}-${latestAttack.turn_number}-${Date.now()}`;
      
      // Only update if this is a different attack
      if (!latestAttackTurn || latestAttackTurn.id !== latestAttack.id) {
        console.log('Setting new latest attack for animation');
        setLatestAttackTurn(latestAttack);
        setAnimationKey(newAnimationKey);
      }
    } else {
      console.log('No attack turns found for animation');
      setLatestAttackTurn(null);
      setAnimationKey('');
    }
  }, [turns, participants]);

  // Real-time subscription for new turns in this battle
  useEffect(() => {
    if (!battle?.id) return;

    console.log('Setting up real-time subscription for battle turns:', battle.id);

    const channel = supabase
      .channel(`battle-turns-${battle.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pvp_battle_turns',
          filter: `battle_id=eq.${battle.id},action_type=eq.attack`
        },
        (payload) => {
          console.log('New turn received via realtime:', payload.new);
          
          const newTurn = payload.new as PvPBattleTurn;
          
          // Check if this is an attack turn with damage
          if (newTurn.action_type === 'attack' && 
              newTurn.damage_dealt > 0 && 
              newTurn.target_player_id) {
            
            console.log('New attack turn for animation:', {
              turnId: newTurn.id,
              attacker: newTurn.username,
              weapon: newTurn.weapon_used,
              damage: newTurn.damage_dealt
            });
            
            // Update latest attack and force new animation
            setLatestAttackTurn(newTurn);
            setAnimationKey(`${newTurn.id}-${newTurn.turn_number}-${Date.now()}`);
          }
        }
      )
      .subscribe((status) => {
        console.log('Battle turns subscription status:', status);
      });

    return () => {
      console.log('Cleaning up battle turns subscription');
      supabase.removeChannel(channel);
    };
  }, [battle?.id]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTurnPlayer = participants.find(p => p.player_id === battle.current_turn_player_id);

  return (
    <div className="relative w-full h-full">
      {/* Enhanced LeafletWorldMap with battle mode */}
      <LeafletWorldMap
        mode={targetMode && isMyTurn ? 'select' : 'view'}
        onCountrySelect={handleCountrySelect}
        selectedCountry={selectedTarget ? participants.find(p => p.player_id === selectedTarget)?.country_id : undefined}
        showStats={false}
        battleData={{
          participants: participants, // Pass raw participants data
          latestAttackTurn: latestAttackTurn, // Pass single turn object
          animationKey, // Pass animation key to force re-render
          currentPlayer: currentPlayer?.id,
          currentTurn: battle.current_turn_player_id,
          targetMode,
          selectedTarget,
          participantCountries // Pass enhanced countries separately
        }}
      />

      {/* Bottom Status Bar - Moved to bottom */}
      <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 lg:bottom-2 lg:left-2 lg:right-2 z-[1000] bg-black/95 backdrop-blur-md rounded-lg border border-red-500/30 shadow-lg shadow-red-500/10">
        <div className="p-2 sm:p-3">
          {/* Current Turn Info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="text-red-400" size={16} />
              <span className="text-white font-bold text-sm">Turn #{battle.turn_number}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="text-blue-400" size={12} />
              <span className="text-white text-sm">
                {participants.filter(p => !p.is_eliminated).length}/{participants.length} Active
              </span>
            </div>
          </div>

          {/* Current Player Turn */}
          {currentTurnPlayer && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isMyTurn ? (
                  <>
                    <Zap className="text-green-400 animate-pulse" size={14} />
                    <span className="text-green-400 font-semibold text-sm">YOUR TURN</span>
                  </>
                ) : (
                  <>
                    <Clock className="text-blue-400" size={14} />
                    <span className="text-blue-400 text-sm">{currentTurnPlayer.username}'s turn</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Timer className="text-orange-400" size={12} />
                <span className={`font-mono text-sm ${timeRemaining < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {formatTime(timeRemaining)}
                </span>
                {timeRemaining < 30 && timeRemaining > 0 && (
                  <span className="text-red-400 text-xs animate-bounce">⚠️</span>
                )}
              </div>
            </div>
          )}

          {/* Target Mode Indicator */}
          {targetMode && isMyTurn && (
            <div className="mt-2 pt-2 border-t border-red-500/30 lg:hidden">
              <div className="flex items-center justify-center gap-2">
                <Crosshair className="text-red-400 animate-spin" size={14} />
                <span className="text-red-400 font-semibold text-sm animate-pulse">🎯 TARGET MODE ACTIVE 🎯</span>
                <span className="text-red-300 text-xs hidden sm:inline">Click enemies to lock target</span>
              </div>
            </div>
          )}

          {/* Battle Instructions */}
          {!targetMode && (
            <div className="mt-2 pt-2 border-t border-gray-600/30 lg:hidden">
              <div className="text-center text-xs text-gray-400 font-mono flex items-center justify-center gap-1 flex-wrap">
                <MapPin size={10} />
                {isMyTurn ? (
                  <span className="text-green-400">⚡ YOUR TURN: Use bottom buttons</span>
                ) : battle.battle_status === 'waiting_for_players' ? (
                  <span className="text-yellow-400">⏳ Waiting for more players to join</span>
                ) : currentTurnPlayer ? (
                  <span className="text-blue-400">⏳ Waiting for {currentTurnPlayer.username}'s turn</span>
                ) : (
                  <span>⏳ Loading battle state...</span>
                )}
              </div>
            </div>
          )}
          
          {/* Selected Target Display */}
          {selectedTarget && !targetMode && (
            <div className="mt-2 pt-2 border-t border-red-500/30">
              <div className="text-center text-xs text-red-300 font-mono flex items-center justify-center gap-1 flex-wrap">
                <Target size={10} className="animate-pulse" />
                {(() => {
                  const target = participants.find(p => p.player_id === selectedTarget);
                  return target ? (
                    <span className="text-red-400 font-bold animate-pulse">
                      🎯 TARGET LOCKED: {target.username} - Choose weapon to fire!
                    </span>
                  ) : null;
                })()}
              </div>
            </div>
          )}

          {/* Latest Attack Display */}
          {latestAttackTurn && (
            <div className="mt-2 pt-2 border-t border-orange-500/30">
              <div className="text-center text-xs text-orange-300 font-mono flex items-center justify-center gap-1 flex-wrap">
                <Target size={10} />
                <span className="text-orange-400 font-semibold">
                  LATEST: {latestAttackTurn.username} → {latestAttackTurn.weapon_used} → {latestAttackTurn.damage_dealt} DMG
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};