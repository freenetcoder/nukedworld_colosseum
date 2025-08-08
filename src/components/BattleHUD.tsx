import React from 'react';
import { PvPBattle, PvPBattleParticipant, GamePlayer } from '../types/game';
import { useCountries } from '../hooks/useCountries';
import { 
  Crown, 
  Heart, 
  Shield, 
  Sword, 
  Clock, 
  Trophy,
  Target,
  Zap,
  Activity,
  Users,
  Timer
} from 'lucide-react';

interface BattleHUDProps {
  battle: PvPBattle;
  participants: PvPBattleParticipant[];
  currentPlayer: GamePlayer | null;
  isMyTurn: boolean;
  timeRemaining: number;
  myActiveDefenseCharges?: number;
}

export const BattleHUD: React.FC<BattleHUDProps> = ({
  battle,
  participants,
  currentPlayer,
  isMyTurn,
  timeRemaining,
  myActiveDefenseCharges = 0
}) => {
  const { getCountryById } = useCountries();

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getHealthColor = (health: number, maxHealth: number) => {
    const percentage = (health / maxHealth) * 100;
    if (percentage > 70) return 'text-green-400';
    if (percentage > 40) return 'text-yellow-400';
    if (percentage > 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthBarColor = (health: number, maxHealth: number) => {
    const percentage = (health / maxHealth) * 100;
    if (percentage > 70) return 'bg-green-500';
    if (percentage > 40) return 'bg-yellow-500';
    if (percentage > 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const currentTurnPlayer = participants.find(p => p.player_id === battle.current_turn_player_id);
  const myParticipant = participants.find(p => p.player_id === currentPlayer?.id);

  // Get country data for current turn player to get the correct country code
  const currentTurnPlayerCountry = currentTurnPlayer ? getCountryById(currentTurnPlayer.country_id) : null;

  return (
    <div className="p-4 space-y-4">
      {/* Battle Status */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="text-yellow-400" size={20} />
          <span className="text-white font-bold">Battle Status</span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Battle:</span>
            <span className="text-white font-semibold">{battle.battle_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Turn:</span>
            <span className="text-white font-semibold">#{battle.turn_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Active Players:</span>
            <span className="text-white font-semibold">
              {participants.filter(p => !p.is_eliminated).length}/{participants.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Prize Pool:</span>
            <span className="text-yellow-400 font-semibold">
              {battle.total_prize_pool?.toLocaleString()} $NUKED
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className={`font-semibold ${
              battle.battle_status === 'in_progress' ? 'text-red-400' :
              battle.battle_status === 'waiting_for_players' ? 'text-yellow-400' :
              'text-blue-400'
            }`}>
              {battle.battle_status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

          {/* My Status */}
      {myParticipant && (
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="text-green-400" size={20} />
            <span className="text-white font-bold">Your Status</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Health:</span>
              <span className={`font-semibold ${getHealthColor(myParticipant.current_health, myParticipant.max_health)}`}>
                {myParticipant.current_health}/{myParticipant.max_health}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Turns Taken:</span>
              <span className="text-white font-semibold">{myParticipant.turns_taken}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active Defense:</span>
              <span className="text-blue-400 font-semibold">{myActiveDefenseCharges} charges</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Damage Dealt:</span>
              <span className="text-red-400 font-semibold">{Math.round(myParticipant.total_damage_dealt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Damage Taken:</span>
              <span className="text-orange-400 font-semibold">{Math.round(myParticipant.total_damage_taken)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Position:</span>
              <span className="text-purple-400 font-semibold">
                #{participants.filter(p => !p.is_eliminated).findIndex(p => p.player_id === myParticipant.player_id) + 1} of {participants.filter(p => !p.is_eliminated).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Turn Timer:</span>
              <span className={`font-semibold ${
                timeRemaining < 60 ? 'text-red-400 animate-pulse' : 
                timeRemaining < 120 ? 'text-orange-400' : 'text-green-400'
              }`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          {myParticipant.is_eliminated && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded">
              <div className="text-red-400 text-sm font-semibold text-center">
                You have been eliminated from this battle
              </div>
            </div>
          )}
        </div>
      )}

      {/* Participants */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Target className="text-purple-400" size={20} />
          <span className="text-white font-bold">Commanders</span>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {participants.map((participant, index) => {
            const participantCountry = getCountryById(participant.country_id);
            
            return (
              <div 
                key={participant.player_id} 
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  participant.is_eliminated 
                    ? 'border-gray-600/30 bg-gray-800/30 opacity-50' 
                    : participant.player_id === currentPlayer?.id
                      ? 'border-green-500/50 bg-green-500/10'
                      : participant.player_id === battle.current_turn_player_id
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-gray-600/30 bg-slate-700/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    {participantCountry && (
                      <img 
                        src={`https://flagcdn.com/24x18/${participantCountry.code.toLowerCase()}.png`}
                        alt={`${participantCountry.name} flag`}
                        className="w-6 h-4 object-cover rounded-sm"
                        onError={(e) => {
                          // Fallback to country code if code_initial fails
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes(participantCountry.code.toLowerCase())) {
                            target.src = `https://flagcdn.com/24x18/${participantCountry.code.toLowerCase()}.png`;
                          }
                        }}
                      />
                    )}
                    {index === 0 && (
                      <Crown className="absolute -top-1 -right-1 text-yellow-400" size={12} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">{participant.username}</span>
                      {participant.is_eliminated && (
                        <span className="text-red-400 text-xs">💀 ELIMINATED</span>
                      )}
                      {participant.player_id === currentPlayer?.id && (
                        <span className="text-green-400 text-xs">YOU</span>
                      )}
                      {participant.player_id === battle.current_turn_player_id && !participant.is_eliminated && (
                        <span className="text-blue-400 text-xs">ACTIVE</span>
                      )}
                    </div>
                    <div className="text-gray-400 text-xs">{participant.country_name}</div>
                  </div>
                </div>
                
                {!participant.is_eliminated && (
                  <div className="space-y-2">
                    {/* Health Bar */}
                    <div className="flex items-center gap-2">
                      <Heart size={12} className={getHealthColor(participant.current_health, participant.max_health)} />
                      <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${getHealthBarColor(participant.current_health, participant.max_health)}`}
                          style={{ width: `${(participant.current_health / participant.max_health) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-mono ${getHealthColor(participant.current_health, participant.max_health)}`}>
                        {participant.current_health}/{participant.max_health}
                      </span>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Sword size={10} className="text-red-400" />
                        <span className="text-gray-400">DMG:</span>
                        <span className="text-white">{Math.round(participant.total_damage_dealt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield size={10} className="text-blue-400" />
                        <span className="text-gray-400">Taken:</span>
                        <span className="text-white">{Math.round(participant.total_damage_taken)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity size={10} className="text-purple-400" />
                        <span className="text-gray-400">Turns:</span>
                        <span className="text-white">{participant.turns_taken}</span>
                      </div>
                    </div>
                  </div>
                )}

                {participant.is_eliminated && (
                  <div className="text-center py-2">
                    <div className="text-red-400 text-sm font-semibold">ELIMINATED</div>
                    {participant.elimination_turn && (
                      <div className="text-gray-500 text-xs">Turn #{participant.elimination_turn}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

  

      {/* Battle Instructions */}
      <div className="bg-slate-800/50 rounded-lg p-3 border border-gray-600/30">
        <div className="text-center text-xs text-gray-400">
          {isMyTurn ? (
            <span className="text-green-400 font-semibold">🎯 Your turn! Choose your action</span>
          ) : battle.battle_status === 'waiting_for_players' ? (
            <span className="text-yellow-400">⏳ Waiting for more players to join</span>
          ) : currentTurnPlayer ? (
            <span>⏳ Waiting for {currentTurnPlayer.username}'s turn ({formatTime(timeRemaining)} left)</span>
          ) : (
            <span>⏳ Loading battle state...</span>
          )}
          {timeRemaining <= 30 && timeRemaining > 0 && battle.battle_status === 'in_progress' && (
            <div className="text-red-400 text-xs mt-1 animate-pulse">
              ⚠️ Turn expires soon! Auto-pass in {timeRemaining}s
            </div>
          )}
        </div>
      </div>
    </div>
  );
};