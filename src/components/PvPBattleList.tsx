import React, { useState } from 'react';
import { GamePlayer, PvPBattle, PvPBattleHistory } from '../types/game';
import { 
  Users, 
  Clock, 
  Coins, 
  Trophy, 
  Swords, 
  Crown,
  Timer,
  Target,
  Shield,
  Zap,
  Activity,
  Calendar,
  Award,
  X,
  Star
} from 'lucide-react';
import { formatTokens } from '../lib/solana';
import { getPlayerRank } from '../lib/rankSystem';

interface PvPBattleListProps {
  activeBattles: PvPBattle[];
  battleHistory: PvPBattleHistory[];
  player: GamePlayer | null;
  onJoinBattle: (battleId: string) => void;
  onStartBattle?: (battleId: string, creatorId: string) => void;
  onRejoinBattle?: (player: GamePlayer, battleId: string) => void;
  onCancelBattle?: (battleId: string) => void;
  onRefresh: () => void;
}

export const PvPBattleList: React.FC<PvPBattleListProps> = ({
  activeBattles,
  battleHistory,
  player,
  onJoinBattle,
  onStartBattle,
  onRejoinBattle,
  onCancelBattle,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  
  // Debug logging
  React.useEffect(() => {
    if (activeBattles.length > 0) {
      console.log('🎮 Active Battles Debug:', {
        playerID: player?.id,
        battles: activeBattles.map(b => ({
          id: b.id,
          name: b.battle_name,
          creatorId: b.creator_id,
          isCreator: b.creator_id === player?.id,
          participants: b.current_participants,
          status: b.battle_status,
          canStart: b.current_participants >= 2 && b.creator_id === player?.id && b.battle_status === 'waiting_for_players'
        }))
      });
    }
  }, [activeBattles, player?.id]);

  const getBattleStatusColor = (status: string) => {
    switch (status) {
      case 'waiting_for_players': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'starting': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'in_progress': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'completed': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'cancelled': return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  const canJoinBattle = (battle: PvPBattle) => {
    if (!player) return false;
    if (battle.battle_status !== 'waiting_for_players') return false;
    if (battle.current_participants >= battle.max_participants) return false;
    
    // Check rank requirement
    if (battle.max_rank && player.rank_level > battle.max_rank) return false;
    
    // Check if player is already in this battle
    const isAlreadyParticipant = battle.participants?.some(p => p.player_id === player.id);
    return !isAlreadyParticipant;
  };

  const getRankRequirementColor = (battle: PvPBattle) => {
    if (!player || !battle.max_rank) return 'text-gray-400';
    
    if (player.rank_level <= battle.max_rank) {
      return 'text-green-400';
    } else {
      return 'text-red-400';
    }
  };

  const getRankRequirementText = (battle: PvPBattle) => {
    if (!battle.max_rank || battle.max_rank === null || battle.max_rank === undefined) return 'Any Rank';
    
    const maxRankInfo = { rank_level: battle.max_rank } as GamePlayer;
    const maxRank = getPlayerRank(maxRankInfo);
    
    return `Max: ${maxRank.name} (Level ${battle.max_rank})`;
  };
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-800/50 backdrop-blur-md rounded-lg p-1 border border-gray-600/30">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'active'
              ? 'bg-red-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Activity size={16} />
          Active Battles ({activeBattles.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Calendar size={16} />
          Battle History ({battleHistory.length})
        </button>
      </div>

      {/* Active Battles */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeBattles.length === 0 ? (
            <div className="text-center py-12">
              <Swords size={48} className="mx-auto mb-4 text-gray-500 opacity-50" />
              <h3 className="text-white font-bold text-lg mb-2">No Active Battles</h3>
              <p className="text-gray-400">Be the first to create a battle and start the war!</p>
            </div>
          ) : (
            activeBattles.map((battle) => (
              <div key={battle.id} className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-red-500/30 p-6 hover:border-red-500/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Battle Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Target size={16} />
                        <h3 className="text-white font-bold text-lg">{battle.battle_name}</h3>
                      </div>
                      <div className={`px-2 py-1 rounded-md border text-xs font-semibold ${getBattleStatusColor(battle.battle_status)}`}>
                        {battle.battle_status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Crown className="text-yellow-400" size={14} />
                        <span className="text-gray-400">Creator:</span>
                        <span className="text-white font-semibold">{battle.creator_username}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="text-blue-400" size={14} />
                        <span className="text-gray-400">Players:</span>
                        <span className="text-white font-semibold">
                          {battle.current_participants}/{battle.max_participants}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Coins className="text-orange-400" size={14} />
                        <span className="text-gray-400">Entry:</span>
                        <span className="text-orange-400 font-semibold">{formatTokens(battle.entry_fee)} $NUKED</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Timer className="text-purple-400" size={14} />
                        <span className="text-gray-400">Turn Time:</span>
                        <span className="text-white font-semibold">{Math.floor(battle.turn_time_limit / 60)}m</span>
                      </div>
                    </div>

                    {/* Rank Requirement */}
                    <div className="mt-3 flex items-center gap-2">
                      <Star className="text-yellow-400" size={16} />
                      <span className="text-gray-400">Rank Requirement:</span>
                      <span className={`font-semibold ${getRankRequirementColor(battle)}`}>
                        {getRankRequirementText(battle)}
                      </span>
                      {player && battle.max_rank && player.rank_level > battle.max_rank && (
                        <span className="text-red-400 text-sm ml-2">
                          (Your rank too high)
                        </span>
                      )}
                    </div>
                    {/* Prize Pool */}
                    <div className="mt-3 flex items-center gap-2">
                      <Trophy className="text-yellow-400" size={16} />
                      <span className="text-gray-400">Prize Pool:</span>
                      <span className="text-yellow-400 font-bold text-lg">
                        {formatTokens(battle.total_prize_pool)} $NUKED
                      </span>
                    </div>

                    {/* Participants */}
                    {battle.participants && battle.participants.length > 0 && (
                      <div className="mt-4">
                        <div className="text-gray-400 text-sm mb-2">Participants:</div>
                        <div className="flex flex-wrap gap-2">
                          {battle.participants.map((participant, index) => (
                            <div key={participant.player_id} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-1 border border-gray-600/30">
                              <img 
                                src={`/flags/32x24/${participant.country_id?.toLowerCase() || 'us'}.png`}
                                alt={participant.country_name}
                                className="w-4 h-3 object-cover rounded-sm"
                                onError={(e) => {
                                  // Add error handling for flag loading
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              <span className="text-white text-sm font-medium">{participant.username}</span>
                              {participant.is_eliminated && (
                                <span className="text-red-400 text-xs">💀</span>
                              )}
                              {index === 0 && (
                                <Crown className="text-yellow-400" size={12} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col gap-2">
                    <div className="text-right text-xs text-gray-400">
                      Created {formatTimeAgo(battle.created_at)}
                    </div>
                    
                    {/* Creator Actions */}
                    {battle.creator_id === player?.id ? (
                      <div className="flex flex-col gap-2">
                        {battle.battle_status === 'in_progress' ? (
                          <button
                            onClick={() => onRejoinBattle && onRejoinBattle(player, battle.id)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-600/30 flex items-center gap-2"
                          >
                            <Activity size={16} />
                            Enter Battle
                          </button>
                        ) : battle.battle_status === 'waiting_for_players' ? (
                          <button
                            onClick={() => onRejoinBattle && onRejoinBattle(player, battle.id)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-600/30 flex items-center gap-2"
                          >
                            <Activity size={16} />
                            Enter Battle
                          </button>
                        ) : (
                          <button
                            disabled
                            className="bg-gray-600/50 text-gray-400 font-bold py-2 px-6 rounded-lg cursor-not-allowed flex items-center gap-2"
                          >
                            <Shield size={16} />
                            {battle.battle_status.replace('_', ' ')}
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Non-Creator Actions */
                      canJoinBattle(battle) ? (
                        <button
                          onClick={() => onJoinBattle(battle.id)}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-green-600/30 flex items-center gap-2"
                        >
                          <Swords size={16} />
                          Join
                        </button>
                      ) : player && battle.max_rank && player.rank_level > battle.max_rank ? (
                        <button
                          disabled
                          className="bg-red-600/50 text-white font-bold py-2 px-6 rounded-lg cursor-not-allowed flex items-center gap-2"
                        >
                          <Star size={16} />
                          Rank Too High
                        </button>
                      ) : battle.battle_status === 'in_progress' ? (
                        <>
                          {player && battle.participants?.some(p => p.player_id === player.id) ? (
                            <button
                              onClick={() => onRejoinBattle && onRejoinBattle(player, battle.id)}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-600/30 flex items-center gap-2"
                            >
                              <Activity size={16} />
                              Enter Battle
                            </button>
                          ) : (
                            <button
                              disabled
                              className="bg-red-600/50 text-white font-bold py-2 px-6 rounded-lg cursor-not-allowed flex items-center gap-2"
                            >
                              <Activity size={16} />
                              In Progress
                            </button>
                          )}
                        </>
                      ) : battle.current_participants >= battle.max_participants ? (
                        <button
                          disabled
                          className="bg-gray-600/50 text-gray-400 font-bold py-2 px-6 rounded-lg cursor-not-allowed flex items-center gap-2"
                        >
                          <Users size={16} />
                          Full
                        </button>
                      ) : (
                        <button
                          disabled
                          className="bg-gray-600/50 text-gray-400 font-bold py-2 px-6 rounded-lg cursor-not-allowed flex items-center gap-2 text-sm"
                        >
                          <Shield size={16} />
                          {battle.creator_id === player?.id ? 'Your Battle' : "Can't Join"}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Battle History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {battleHistory.length === 0 ? (
            <div className="text-center py-12">
              <Trophy size={48} className="mx-auto mb-4 text-gray-500 opacity-50" />
              <h3 className="text-white font-bold text-lg mb-2">No Battle History</h3>
              <p className="text-gray-400">Complete battles will appear here with results and statistics.</p>
            </div>
          ) : (
            battleHistory.map((battle) => (
              <div key={battle.id} className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-blue-500/30 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Battle Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Target size={16} />
                        <h3 className="text-white font-bold text-lg">{battle.battle_name}</h3>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Crown className="text-yellow-400" size={14} />
                        <span className="text-gray-400">Creator:</span>
                        <span className="text-white font-semibold">{battle.creator_username}</span>
                      </div>
                      
                      {battle.winner_username && (
                        <div className="flex items-center gap-2">
                          <Trophy className="text-green-400" size={14} />
                          <span className="text-gray-400">Winner:</span>
                          <span className="text-green-400 font-semibold">{battle.winner_username}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Coins className="text-orange-400" size={14} />
                        <span className="text-gray-400">Prize:</span>
                        <span className="text-orange-400 font-semibold">{formatTokens(battle.total_prize_pool)} $NUKED</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="text-purple-400" size={14} />
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white font-semibold">
                          {battle.battle_duration_minutes ? `${Math.round(battle.battle_duration_minutes)}m` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Winner Info */}
                    {battle.winner_username && (
                      <div className="mt-4 flex items-center gap-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Award className="text-green-400" size={16} />
                          <span className="text-green-400 font-semibold">{battle.winner_username}</span>
                          <span className="text-gray-400">from</span>
                          <span className="text-white">{battle.winner_country}</span>
                        </div>
                        {battle.reputation_bonus && (
                          <div className="flex items-center gap-1">
                            <Zap className="text-yellow-400" size={14} />
                            <span className="text-yellow-400 text-sm">+{battle.reputation_bonus} reputation</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Battle Date */}
                  <div className="text-right text-xs text-gray-400">
                    <div>Ended {formatTimeAgo(battle.ended_at)}</div>
                    <div className="mt-1">
                      {new Date(battle.ended_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};