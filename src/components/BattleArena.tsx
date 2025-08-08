import React, { useState, useEffect } from 'react';
import { GamePlayer, PlayerEquipment } from '../types/game';
import { usePvPBattle } from '../hooks/usePvPBattle';
import { useCountries } from '../hooks/useCountries';
import { BattleHUD } from './BattleHUD';
import { BattleTurnPanel } from './BattleTurnPanel';
import { BattleChat } from './BattleChat';
import { BattleMap } from './BattleMap';
import { BackgroundEffects } from './BackgroundEffects';
import { getAvailableWeapons, canDeployDefenseSystem, getDefenseSystemPreview } from '../lib/gameLogic';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  AlertTriangle,
  Users, 
  Clock, 
  Trophy, 
  Activity,
  Loader2,
  Swords,
  Menu,
  X,
  Sword,
  Play,
  Crown,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  Target,
  Shield,
  SkipForward,
  Zap,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BattleArenaProps {
  battleId: string;
  player: GamePlayer | null;
  onBackToLobby: () => void;
  onStartBattle?: (battleId: string, creatorId: string) => void;
}

interface WeaponData {
  id: string;
  name: string;
  damage: number;
  cost: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  battleId,
  player,
  onBackToLobby,
  onStartBattle
}) => {
  const { getCountryById } = useCountries();
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [playerEquipment, setPlayerEquipment] = useState<PlayerEquipment | null>(null);
  const [targetMode, setTargetMode] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [mobileHUDOpen, setMobileHUDOpen] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState<string>('');
  const [myActiveDefenseCharges, setMyActiveDefenseCharges] = useState(0);
  
  const {
    battle,
    participants,
    turns,
    loading,
    error,
    isMyTurn,
    timeRemaining,
    executeAction,
    refreshBattle
  } = usePvPBattle(battleId, player?.id);

  // Load player equipment
  useEffect(() => {
    const loadEquipment = async () => {
      if (player) {
        const { data } = await supabase
          .from('player_equipment')
          .select('*')
          .eq('player_id', player.id)
          .single();
        
        setPlayerEquipment(data);
      }
    };

    loadEquipment();
  }, [player]);

  // Load my active defense charges
  useEffect(() => {
    const loadMyActiveDefenseCharges = async () => {
      if (!player?.id || !battle) return;
      
      try {
        const { data, error } = await supabase
          .from('pvp_battle_participants')
          .select('active_defense_charges')
          .eq('battle_id', battle.id)
          .eq('player_id', player.id)
          .single();

        if (error) {
          console.error('Error loading active defense charges:', error);
          return;
        }

        setMyActiveDefenseCharges(data?.active_defense_charges || 0);
      } catch (error) {
        console.error('Error loading active defense charges:', error);
      }
    };

    loadMyActiveDefenseCharges();
  }, [player?.id, battle?.id, battle?.turn_number]);

  // Auto-refresh battle every 8 seconds
  useEffect(() => {
    if (battle?.battle_status === 'in_progress') {
      const interval = setInterval(() => {
        console.log('Auto-refreshing battle data for reconnection handling...');
        refreshBattle();
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [battle?.battle_status, refreshBattle]);

  // Handle reconnection - check if battle state needs recovery
  useEffect(() => {
    if (battle && player && participants.length > 0) {
      const myParticipant = participants.find(p => p.player_id === player.id);
      
      if (myParticipant && battle.battle_status === 'in_progress') {
        console.log('Reconnection detected - updating participant activity');
        
        const updateActivity = async () => {
          try {
            await supabase
              .from('pvp_battle_participants')
              .update({ last_action_at: new Date().toISOString() })
              .eq('battle_id', battle.id)
              .eq('player_id', player.id);
          } catch (error) {
            console.error('Error updating participant activity:', error);
          }
        };
        
        updateActivity();
      }
    }
  }, [battle?.id, player?.id, participants]);

  // Auto-enable target mode when battle starts and it's player's turn
  useEffect(() => {
    if (battle?.battle_status === 'in_progress' && isMyTurn && !targetMode) {
      setTargetMode(true);
    }
  }, [battle?.battle_status, isMyTurn, targetMode]);

  // Check if player is still in the battle
  useEffect(() => {
    if (battle && player && participants.length > 0) {
      const isParticipant = participants.some(p => p.player_id === player.id);
      if (!isParticipant && battle.battle_status !== 'waiting_for_players') {
        console.warn('Player not found in participants:', {
          playerId: player.id,
          battleId: battle.id,
          battleStatus: battle.battle_status,
          participantIds: participants.map(p => p.player_id)
        });
        onBackToLobby();
        toast.error('You are not a participant in this battle');
        return;
      }
    }
  }, [battle, participants, player, onBackToLobby]);

  // Close mobile menus when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
        setMobileActionsOpen(false);
        setMobileHUDOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if player can start battle early
  const canStartEarly = battle && player && 
    battle.creator_id === player.id && 
    battle.battle_status === 'waiting_for_players' && 
    battle.current_participants >= 2;

  const handleStartEarly = async () => {
    if (canStartEarly && onStartBattle && player) {
      try {
        await onStartBattle(battleId, player.id);
        toast.success('🚀 Battle started early! Let the war begin!');
      } catch (error) {
        console.error('Error starting battle early:', error);
        toast.error('Failed to start battle early');
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAttack = async (targetPlayerId: string, weaponType: string) => {
    if (!player || !targetPlayerId || !weaponType) return;

    try {
      await executeAction({
        action_type: 'attack',
        target_player_id: targetPlayerId,
        weapon_used: weaponType
      });
      
      setSelectedTarget('');
      setTargetMode(false);
      setMobileMenuOpen(false);
      setMobileActionsOpen(false);
      setSelectedWeapon('');
      
      setTimeout(() => {
        refreshBattle();
      }, 500);
    } catch (error) {
      console.error('Attack failed:', error);
      toast.error('Attack failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDefend = async () => {
    if (!player) return;

    if (playerEquipment && !canDeployDefenseSystem(playerEquipment)) {
      const defenseInfo = getDefenseSystemPreview(playerEquipment);
      if (defenseInfo.systemsCount === 0) {
        toast.error('You need defense systems to deploy defenses!');
      } else {
        toast.error('No defense systems remaining!');
      }
      return;
    }

    try {
      await executeAction({
        action_type: 'deploy_defense'
      });
      
      const defenseInfo = playerEquipment ? getDefenseSystemPreview(playerEquipment) : null;
      toast.success(`Defense system deployed! (+${defenseInfo?.chargesPerSystem || 0} charges)`);
      setMobileMenuOpen(false);
      setMobileActionsOpen(false);
      
      setTimeout(() => {
        refreshBattle();
      }, 500);
    } catch (error) {
      console.error('Defend failed:', error);
      toast.error('Defense failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handlePass = async () => {
    if (!player) return;

    try {
      await executeAction({
        action_type: 'pass'
      });
      toast.success('You passed your turn');
      setMobileMenuOpen(false);
      setMobileActionsOpen(false);
      
      setTimeout(() => {
        refreshBattle();
      }, 500);
    } catch (error) {
      console.error('Pass failed:', error);
      toast.error('Pass failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
        <BackgroundEffects />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-lg font-mono">Loading Battle Arena...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !battle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
        <BackgroundEffects />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Swords size={48} className="mx-auto mb-4 text-red-500 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Battle Not Found</h2>
            <p className="text-gray-400 mb-4">{error || 'The battle you\'re looking for doesn\'t exist.'}</p>
            <button
              onClick={onBackToLobby}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 hover:scale-105"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  const availableTargets = participants.filter(p => 
    p.player_id !== player?.id && !p.is_eliminated
  );

  const availableWeapons = playerEquipment ? getAvailableWeapons(playerEquipment) : [];
  const defenseInfo = playerEquipment ? getDefenseSystemPreview(playerEquipment) : null;

  const currentTurnPlayer = participants.find(p => p.player_id === battle.current_turn_player_id);
  const myParticipant = participants.find(p => p.player_id === player?.id);

  const currentTurnPlayerCountry = currentTurnPlayer ? getCountryById(currentTurnPlayer.country_id) : null;

  // Weapons data for mobile interface
  const weapons: WeaponData[] = [
    {
      id: 'Missile Strike',
      name: 'Missile Strike',
      damage: 25,
      cost: 1,
      icon: <Target size={16} />,
      color: 'from-red-600 to-red-700',
      description: 'Standard missile attack'
    },
    {
      id: 'Artillery Barrage',
      name: 'Artillery Barrage',
      damage: 35,
      cost: 2,
      icon: <Swords size={16} />,
      color: 'from-orange-600 to-orange-700',
      description: 'Heavy artillery bombardment'
    },
    {
      id: 'Nuclear Strike',
      name: 'Nuclear Strike',
      damage: 50,
      cost: 3,
      icon: <Zap size={16} />,
      color: 'from-purple-600 to-purple-700',
      description: 'Devastating nuclear weapon'
    }
  ];

  const canUseWeapon = (weapon: WeaponData) => {
    return playerEquipment && playerEquipment.rockets >= weapon.cost;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      <BackgroundEffects />
      
      {/* Military Grid Overlay */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header - Enhanced for mobile */}
        <div className="bg-black/95 backdrop-blur-md border-b border-red-500/30 p-2 sm:p-3 relative z-50 shadow-lg shadow-red-500/10">
          <div className="flex items-center justify-between">
            {/* Left side - Back button and battle info */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                onClick={onBackToLobby}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-all duration-200 bg-slate-800/50 hover:bg-slate-700/50 px-2 py-1.5 rounded-lg border border-gray-600/30 hover:border-gray-500/50 flex-shrink-0 hover:scale-105"
              >
                <ArrowLeft size={16} />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Back</span>
              </button>
              
              <div className="flex items-center gap-2 min-w-0">
                <Swords className="text-red-500 flex-shrink-0" size={16} />
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-lg font-bold font-mono truncate">{battle.battle_name}</h1>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`px-1.5 py-0.5 rounded text-xs font-semibold border ${
                      battle.battle_status === 'in_progress' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                      battle.battle_status === 'waiting_for_players' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
                      'text-blue-400 border-blue-500/30 bg-blue-500/10'
                    }`}>
                      {battle.battle_status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Controls and menu */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Quick stats for desktop */}
              <div className="hidden lg:flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Users className="text-blue-400" size={12} />
                  <span className="text-white font-semibold">{battle.current_participants}/{battle.max_participants}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="text-yellow-400" size={12} />
                  <span className="text-yellow-400 font-semibold">{battle.total_prize_pool?.toLocaleString()}</span>
                </div>
                {isMyTurn && (
                  <div className="flex items-center gap-1">
                    <Clock className="text-green-400 animate-pulse" size={12} />
                    <span className="text-green-400 font-semibold">Your Turn ({formatTime(timeRemaining)})</span>
                  </div>
                )}
              </div>

              {/* Mobile HUD toggle */}
              <button
                onClick={() => setMobileHUDOpen(!mobileHUDOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 border border-gray-600/30"
              >
                <Info size={16} />
              </button>

              {/* Start Battle Early Button */}
              {canStartEarly && (
                <button
                  onClick={handleStartEarly}
                  className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-1.5 px-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-green-600/30 text-xs"
                >
                  <Play size={14} />
                  <span className="hidden md:inline">Start Now</span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 border border-gray-600/30"
              >
                {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>

          {/* Mobile status bar */}
          <div className="lg:hidden mt-2 pt-2 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Users className="text-blue-400" size={10} />
                  <span className="text-white">{battle.current_participants}/{battle.max_participants}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="text-yellow-400" size={10} />
                  <span className="text-yellow-400">{battle.total_prize_pool?.toLocaleString()}</span>
                </div>
              </div>
              {isMyTurn && (
                <div className="flex items-center gap-1 text-green-400 animate-pulse">
                  <Clock size={10} />
                  <span className="font-mono">{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile HUD Overlay */}
        {mobileHUDOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] pt-20 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-lg">Battle Status</h2>
                <button
                  onClick={() => setMobileHUDOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>
              
              <BattleHUD 
                battle={battle}
                participants={participants}
                currentPlayer={player}
                isMyTurn={isMyTurn}
                timeRemaining={timeRemaining}
                myActiveDefenseCharges={myActiveDefenseCharges}
              />
              
              {/* Start Battle Early Button in Mobile HUD */}
              {canStartEarly && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="text-green-400 font-semibold mb-2 text-sm flex items-center gap-2">
                    <Crown size={16} />
                    Creator Controls
                  </div>
                  <button
                    onClick={() => {
                      handleStartEarly();
                      setMobileHUDOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-green-600/30 flex items-center justify-center gap-2"
                  >
                    <Play size={18} />
                    Start Battle Now
                  </button>
                  <div className="text-green-300 text-xs mt-2 text-center">
                    {battle.current_participants} of {battle.max_participants} players ready
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] pt-20 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-lg">Battle Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => {
                    setMobileHUDOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-semibold py-3 px-4 rounded-lg border border-blue-500/30 transition-colors flex items-center gap-2"
                >
                  <Info size={16} />
                  View Battle Status
                </button>

                <button
                  onClick={() => {
                    setChatCollapsed(!chatCollapsed);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 font-semibold py-3 px-4 rounded-lg border border-purple-500/30 transition-colors flex items-center gap-2"
                >
                  <MessageCircle size={16} />
                  {chatCollapsed ? 'Show' : 'Hide'} Battle Log
                </button>

                {isMyTurn && (
                  <button
                    onClick={() => {
                      setMobileActionsOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-3 px-4 rounded-lg border border-red-500/30 transition-colors flex items-center gap-2"
                  >
                    <Sword size={16} />
                    Take Action
                  </button>
                )}
              </div>

              {/* Battle Info */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-600/30">
                <h3 className="text-white font-semibold mb-3">Battle Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Turn:</span>
                    <span className="text-white">#{battle.turn_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Players:</span>
                    <span className="text-white">{participants.filter(p => !p.is_eliminated).length}/{participants.length}</span>
                  </div>
                  {currentTurnPlayer && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Turn:</span>
                      <span className="text-blue-400">{currentTurnPlayer.username}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Actions Overlay */}
        {mobileActionsOpen && isMyTurn && (
          <div className="lg:hidden fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] pt-20 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-lg">Your Turn</h2>
                <button
                  onClick={() => setMobileActionsOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Equipment Status */}
              {playerEquipment && (
                <div className="bg-slate-800/50 rounded-lg p-3 border border-gray-600/30 mb-4">
                  <div className="text-white font-semibold mb-2 text-sm flex items-center gap-2">
                    <Activity size={14} />
                    Equipment Status
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Target size={12} className="text-red-400" />
                      <span className="text-gray-400">Rockets:</span>
                      <span className="text-white font-semibold">{playerEquipment.rockets}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield size={12} className="text-blue-400" />
                      <span className="text-gray-400">Defense:</span>
                      <span className="text-white font-semibold">{playerEquipment.defense_systems}</span>
                    </div>
                  </div>
                </div>
              )}

              {!selectedTarget ? (
                // Target Selection
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Select Target</h3>
                  
                  <button
                    onClick={() => {
                      setTargetMode(true);
                      setMobileActionsOpen(false);
                      toast.success('Tap on enemy countries on the map to target them');
                    }}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Target size={16} />
                    Use Map to Target
                  </button>
                  
                  <div className="space-y-2">
                    <h4 className="text-gray-400 text-sm">Or select from list:</h4>
                    {availableTargets.length === 0 ? (
                      <div className="text-center py-4 text-gray-400">
                        <Users size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No targets available</p>
                      </div>
                    ) : (
                      availableTargets.map((target) => (
                        <button
                          key={target.player_id}
                          onClick={() => setSelectedTarget(target.player_id)}
                          className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-left border border-gray-600/30 hover:border-red-500/50"
                        >
                          <img 
                            src={`/flags/32x24/${target.country_id.toLowerCase()}.png`}
                            alt={target.country_name}
                            className="w-4 h-3 object-cover rounded-sm"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="flex-1">
                            <div className="text-white font-semibold text-sm">{target.username}</div>
                            <div className="text-gray-400 text-xs">
                              Health: {target.current_health}/{target.max_health}
                            </div>
                          </div>
                          <Target size={14} className="text-red-400" />
                        </button>
                      ))
                    )}
                  </div>
                  
                  {/* Other Actions */}
                  <div className="space-y-2 pt-4 border-t border-gray-700">
                    <button
                      onClick={handleDefend}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Shield size={18} />
                      Deploy Defense
                    </button>
                    
                    <button
                      onClick={handlePass}
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <SkipForward size={18} />
                      Pass Turn
                    </button>
                  </div>
                </div>
              ) : (
                // Weapon Selection
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="text-red-400" size={16} />
                    <span className="text-white font-semibold">Select Weapon</span>
                  </div>
                  
                  {/* Selected Target Display */}
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="text-red-400 text-sm font-semibold mb-1">Target Selected:</div>
                    <div className="text-white font-semibold">
                      {availableTargets.find(t => t.player_id === selectedTarget)?.username}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {weapons.map((weapon) => {
                      const isAvailable = availableWeapons.includes(weapon.id);
                      const canUse = canUseWeapon(weapon);
                      
                      return (
                        <button
                          key={weapon.id}
                          onClick={() => handleAttack(selectedTarget, weapon.id)}
                          disabled={!isAvailable || !canUse}
                          className={`w-full bg-gradient-to-r ${weapon.color} active:scale-95 disabled:from-gray-600 disabled:to-gray-700 disabled:scale-100 text-white font-bold py-4 px-4 rounded-lg transition-all duration-200 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-lg`}
                        >
                          <div className="flex items-center gap-3">
                            {weapon.icon}
                            <div className="text-left">
                              <div className="font-bold text-sm">{weapon.name}</div>
                              <div className="text-xs opacity-80">{weapon.description}</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1">
                            <Zap size={14} />
                              <span className="text-sm font-bold">{weapon.damage} DMG</span>
                            </div>
                            <div className="text-xs opacity-80">Cost: {weapon.cost} 🚀</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Insufficient Rockets Warning */}
                  {playerEquipment && playerEquipment.rockets < 3 && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="text-yellow-400" size={14} />
                        <span className="text-yellow-400 font-semibold text-sm">Limited Arsenal</span>
                      </div>
                      <p className="text-yellow-300 text-xs">
                        You need more rockets to use all weapons. Visit the Arsenal to purchase more.
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      setSelectedTarget('');
                      setSelectedWeapon('');
                      setTargetMode(false);
                    }}
                    className="w-full bg-gray-600 active:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 touch-manipulation shadow-lg"
                  >
                    <X size={16} />
                    Cancel Attack
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Battle Interface */}
        <div className="flex-1 flex overflow-hidden relative min-h-0">
          {/* Desktop Left Panel - Battle Status */}
          <div className={`hidden lg:flex bg-black/90 backdrop-blur-md border-r border-red-500/30 flex-col overflow-hidden shadow-lg shadow-red-500/10 transition-all duration-300 ${
            leftPanelCollapsed ? 'w-12' : 'w-80'
          }`}>
            {/* Panel Header with Collapse Button */}
            <div className="flex items-center justify-between p-3 border-b border-red-500/30">
              {!leftPanelCollapsed && (
                <div className="flex items-center gap-2">
                  <Activity className="text-red-400" size={16} />
                  <span className="text-white font-bold text-sm">Battle Status</span>
                </div>
              )}
              <button
                onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                className="p-1 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded transition-all duration-200"
              >
                {leftPanelCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>

            {/* Panel Content */}
            {!leftPanelCollapsed && (
              <div className="flex-1 overflow-y-auto min-h-0">
                <BattleHUD 
                  battle={battle}
                  participants={participants}
                  currentPlayer={player}
                  isMyTurn={isMyTurn}
                  timeRemaining={timeRemaining}
                  myActiveDefenseCharges={myActiveDefenseCharges}
                />
                
                {/* Start Battle Early Button in Left Panel */}
                {canStartEarly && (
                  <div className="border-t border-green-500/30 p-3 bg-green-500/5">
                    <div className="text-green-400 font-semibold mb-2 text-sm flex items-center gap-2">
                      <Crown size={14} />
                      Creator Controls
                    </div>
                    <button
                      onClick={handleStartEarly}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2 px-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 text-sm"
                    >
                      <Play size={16} />
                      Start Battle Now
                    </button>
                    <div className="text-green-300 text-xs mt-1 text-center">
                      {battle.current_participants} of {battle.max_participants} players ready
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center - Expanded Battle Map */}
          <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
            {/* Map Container - Takes most of the space */}
            <div className="flex-1 relative overflow-hidden min-h-0">
              <BattleMap
                battle={battle}
                participants={participants}
                turns={turns}
                currentPlayer={player}
                isMyTurn={isMyTurn}
                selectedTarget={selectedTarget}
                onTargetSelect={setSelectedTarget}
                targetMode={targetMode}
                timeRemaining={timeRemaining}
              />
            </div>

            {/* Bottom Chat Panel - Enhanced for mobile */}
            <div className={`flex bg-black/95 backdrop-blur-md border-t border-red-500/30 flex-col overflow-hidden shadow-lg shadow-red-500/10 transition-all duration-300 flex-shrink-0 ${
              chatCollapsed ? 'h-12' : 'h-80 sm:h-80 lg:h-80'
            } ${
              battle.battle_status === 'in_progress' ? 'mb-16 lg:mb-0' : ''
            }`}>
              {/* Chat Header with Collapse Button */}
              <div className="flex items-center justify-between p-2 sm:p-3 border-b border-red-500/30 bg-black/50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <MessageCircle size={14} className="text-blue-400 sm:w-4 sm:h-4" />
                  <span className="text-white font-bold text-xs sm:text-sm">
                    {chatCollapsed ? `Battle Log (${turns.length} actions)` : 'Battle Log'}
                  </span>
                  {chatCollapsed && turns.length > 0 && (
                    <div className="text-xs text-gray-400 hidden sm:block">
                      - Last: {turns[turns.length - 1]?.username} {turns[turns.length - 1]?.action_type}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setChatCollapsed(!chatCollapsed)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded transition-all duration-200"
                >
                  {chatCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Chat Content */}
              {!chatCollapsed && (
                <div className="flex-1 overflow-hidden min-h-0">
                  <BattleChat 
                    battleId={battleId}
                    turns={turns}
                    currentPlayer={player}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Desktop Right Panel - Turn Actions */}
          {battle.battle_status === 'in_progress' && (
            <div className="hidden lg:flex bg-black/90 backdrop-blur-md border-l border-orange-500/30 w-80 flex-col overflow-hidden shadow-lg shadow-orange-500/10 min-h-0">
              {isMyTurn ? (
                <>
                  <div className="p-3 border-b border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Zap className="text-orange-400 animate-pulse" size={20} />
                      <span className="text-white font-bold">Your Turn</span>
                      <div className="ml-auto text-orange-400 font-mono text-sm">
                         {formatTime(timeRemaining)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto min-h-0">
                    <BattleTurnPanel
                      availableTargets={availableTargets}
                      availableWeapons={availableWeapons}
                      selectedTarget={selectedTarget}
                      onTargetSelect={setSelectedTarget}
                      onAttack={handleAttack}
                      onDeployDefense={handleDefend}
                      onPass={handlePass}
                      playerEquipment={playerEquipment}
                      currentPlayer={player}
                      onTargetModeChange={setTargetMode}
                      activeDefenseCharges={myActiveDefenseCharges}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 border-b border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Clock className="text-blue-400 animate-pulse" size={20} />
                      <span className="text-white font-bold">Current Turn</span>
                      <div className="ml-auto text-blue-400 font-mono text-sm">
                        {formatTime(timeRemaining)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 min-h-0">
                    {currentTurnPlayer ? (
                      <div className="space-y-4">
                        {/* Current Turn Player Info */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <div className="text-blue-400 font-semibold mb-3 text-sm flex items-center gap-2">
                            <Activity size={14} />
                            Active Player
                          </div>
                          
                          <div className="flex items-center gap-3 mb-3">
                            {currentTurnPlayerCountry && (
                              <img 
                                src={`https://flagcdn.com/24x18/${currentTurnPlayerCountry.code.toLowerCase()}.png`}
                                alt={`${currentTurnPlayerCountry.name} flag`}
                                className="w-6 h-4 object-cover rounded-sm"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (!target.src.includes(currentTurnPlayerCountry.code.toLowerCase())) {
                                    target.src = `https://flagcdn.com/24x18/${currentTurnPlayerCountry.code.toLowerCase()}.png`;
                                  }
                                }}
                              />
                            )}
                            <div>
                              <div className="text-white font-bold">{currentTurnPlayer.username}</div>
                              <div className="text-gray-400 text-sm">{currentTurnPlayerCountry?.name}</div>
                            </div>
                          </div>
                          
                          {/* Current player's health */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Health:</span>
                              <span className="text-white font-semibold">
                                {currentTurnPlayer.current_health}/{currentTurnPlayer.max_health}
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  (currentTurnPlayer.current_health / currentTurnPlayer.max_health) > 0.7 ? 'bg-green-500' :
                                  (currentTurnPlayer.current_health / currentTurnPlayer.max_health) > 0.4 ? 'bg-yellow-500' :
                                  (currentTurnPlayer.current_health / currentTurnPlayer.max_health) > 0.2 ? 'bg-orange-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${(currentTurnPlayer.current_health / currentTurnPlayer.max_health) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Current player's stats */}
                          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                            <div className="flex items-center gap-1">
                              <Sword size={10} className="text-red-400" />
                              <span className="text-gray-400">DMG:</span>
                              <span className="text-white">{Math.round(currentTurnPlayer.total_damage_dealt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity size={10} className="text-purple-400" />
                              <span className="text-gray-400">Turns:</span>
                              <span className="text-white">{currentTurnPlayer.turns_taken}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Shield size={10} className="text-blue-400" />
                              <span className="text-gray-400">Taken:</span>
                              <span className="text-white">{Math.round(currentTurnPlayer.total_damage_taken)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Turn Status */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-gray-600/30">
                          <div className="text-center">
                            <div className="text-blue-400 font-semibold text-sm mb-1">
                              Waiting for {currentTurnPlayer.username}'s action
                            </div>
                            <div className="text-gray-400 text-xs">
                              Turn #{battle.turn_number}
                            </div>
                            {timeRemaining < 60 && (
                              <div className="text-red-400 text-xs mt-1 animate-pulse">
                                ⚠️ Time running out!
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Clock size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Loading turn information...</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Mobile Action Bar - Fixed at bottom */}
        {battle.battle_status === 'in_progress' && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-red-500/30 p-2 z-[100] shadow-lg shadow-red-500/10 safe-area-inset-bottom">
            {isMyTurn ? (
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={() => setMobileActionsOpen(true)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 active:from-red-700 active:to-red-800 text-white font-bold py-3 px-2 sm:px-3 rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm touch-manipulation shadow-lg"
                >
                  <Sword size={14} className="sm:w-4 sm:h-4" />
                  <span>Attack</span>
                </button>
                <button
                  onClick={handleDefend}
                  disabled={!defenseInfo?.canUse}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 active:from-blue-700 active:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-2 sm:px-3 rounded-lg transition-all duration-200 active:scale-95 disabled:scale-100 flex flex-col items-center justify-center gap-0.5 text-xs sm:text-sm touch-manipulation shadow-lg disabled:opacity-50"
                >
                  <div className="flex items-center gap-1">
                    <Shield size={14} className="sm:w-4 sm:h-4" />
                    <span>Defend</span>
                  </div>
                  {defenseInfo && (
                    <span className="text-xs opacity-80">
                      {defenseInfo.canUse ? `${defenseInfo.systemsCount}⚡` : 'No systems'}
                    </span>
                  )}
                </button>
                <button
                  onClick={handlePass}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 active:from-gray-700 active:to-gray-800 text-white font-bold py-3 px-2 sm:px-3 rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm touch-manipulation shadow-lg"
                >
                  <SkipForward size={14} className="sm:w-4 sm:h-4" />
                  <span>Pass</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-2 sm:py-3">
                <div className="text-blue-400 font-semibold text-sm">
                  {currentTurnPlayer ? `${currentTurnPlayer.username}'s turn` : 'Loading...'}
                </div>
                <div className="text-gray-400 text-xs">
                  {formatTime(timeRemaining)} remaining
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};