import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { GamePlayer } from '../types/game';
import { PvPBattleList } from './PvPBattleList';
import { CreateBattleModal } from './CreateBattleModal';
import { BattleArena } from './BattleArena';
import { usePvPBattles } from '../hooks/usePvPBattles';
import { BackgroundEffects } from './BackgroundEffects';
import { 
  Swords, 
  Plus, 
  Trophy, 
  Users, 
  Clock, 
  Zap,
  Shield,
  Target,
  Crown,
  Flame,
  Activity,
  X,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PvPBattlePageProps {
  player: GamePlayer | null;
  loading: boolean;
}

export const PvPBattlePage: React.FC<PvPBattlePageProps> = ({ player, loading }) => {
  const { connected } = useWallet();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBattleId, setSelectedBattleId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'lobby' | 'battle'>('lobby');
  const [playerActiveBattle, setPlayerActiveBattle] = useState<any>(null);
  const [checkingActiveBattle, setCheckingActiveBattle] = useState(true);
  
  const { 
    activeBattles, 
    battleHistory, 
    loading: battlesLoading,
    createBattle,
    joinBattle,
    cancelBattle,
    startBattleManually,
    rejoinBattle,
    getPlayerActiveBattle,
    refreshBattles
  } = usePvPBattles();

  // Check for active battle ONLY ONCE on mount
  useEffect(() => {
    const checkPlayerActiveBattle = async () => {
      if (player) {
        setCheckingActiveBattle(true);
        try {
          console.log('Checking for active battle for player:', player.username, player.id);
          const activeBattle = await getPlayerActiveBattle(player.id);
          setPlayerActiveBattle(activeBattle);
          
          if (activeBattle) {
            console.log('Found active battle:', activeBattle.battle_name, activeBattle.id);
            setSelectedBattleId(activeBattle.id);
            setCurrentView('battle');
          } else {
            console.log('No active battle found for player');
          }
        } catch (error) {
          console.error('Error checking active battle:', error);
        } finally {
          setCheckingActiveBattle(false);
        }
      } else {
        setCheckingActiveBattle(false);
      }
    };

    checkPlayerActiveBattle();
  }, [player?.id]); // Only depend on player ID, not the function


  const handleCreateBattle = async (battleData: any) => {
    if (!player) {
      toast.error('Please connect wallet and select a country first');
      return;
    }
    
    try {
      toast.success('🚀 Creating battle... Please confirm the transaction in your wallet.');
      const battleId = await createBattle(player, battleData);
      setSelectedBattleId(battleId);
      setCurrentView('battle');
      setShowCreateModal(false);
      
      // Set the created battle as active
      setPlayerActiveBattle({ id: battleId } as any);
    } catch (error) {
      console.error('Error creating battle:', error);
      // Error handling is now done in the hook
    }
  };

  const handleJoinBattle = async (battleId: string) => {
    if (!player) {
      toast.error('Please connect wallet and select a country first');
      return;
    }
    
    try {
      toast.success('🚀 Joining battle... Please confirm the transaction in your wallet.');
      await joinBattle(player, battleId);
      setSelectedBattleId(battleId);
      setCurrentView('battle');
      
      // Set the joined battle as active
      setPlayerActiveBattle({ id: battleId } as any);
    } catch (error) {
      console.error('Error joining battle:', error);
      // Error handling is now done in the hook
    }
  };

  const handleCancelBattle = async (battleId: string) => {
    if (!player) {
      toast.error('Please connect wallet and select a country first');
      return;
    }

    try {
      await cancelBattle(battleId, player.id);
      setPlayerActiveBattle(null);
      setCurrentView('lobby');
      setSelectedBattleId(null);
      refreshBattles(); // Manual refresh only
    } catch (error) {
      console.error('Error cancelling battle:', error);
      toast.error('Failed to cancel battle');
    }
  };

  const handleStartBattle = async (battleId: string, creatorId: string) => {
    if (!player) {
      toast.error('Please connect wallet and select a country first');
      return;
    }

    try {
      await startBattleManually(battleId, creatorId);
      setSelectedBattleId(battleId);
      setCurrentView('battle');
      
      // Set the started battle as active
      setPlayerActiveBattle({ id: battleId } as any);
      
      toast.success('Battle started successfully!');
    } catch (error) {
      console.error('Error starting battle:', error);
      toast.error('Failed to start battle');
    }
  };

  const handleRejoinBattleWrapper = async (player: GamePlayer, battleId: string) => {
    try {
      await rejoinBattle(player, battleId);
      setSelectedBattleId(battleId);
      setCurrentView('battle');
      
      // Set the rejoined battle as active
      setPlayerActiveBattle({ id: battleId } as any);
      
      toast.success('Entered battle successfully!');
    } catch (error) {
      console.error('Error entering battle:', error);
      toast.error('Failed to enter battle');
    }
  };

  const handleBackToLobby = () => {
    setCurrentView('lobby');
    setSelectedBattleId(null);
    setPlayerActiveBattle(null);
    refreshBattles(); // Manual refresh only
  };

  if (loading || battlesLoading || checkingActiveBattle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
        <BackgroundEffects />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-3 text-white">
            <Activity className="animate-spin" size={24} />
            <span className="text-lg font-mono">Loading PvP Arena...</span>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'battle' && selectedBattleId) {
    return (
      <BattleArena 
        battleId={selectedBattleId}
        player={player}
        onBackToLobby={handleBackToLobby}
        onStartBattle={handleStartBattle}
      />
    );
  }

  // If player has an active battle, show battle management interface
  if (playerActiveBattle && currentView === 'lobby') {
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

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Swords className="text-red-500" size={48} />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent font-mono">
                  ACTIVE BATTLE
                </h1>
              </div>
              <p className="text-xl text-gray-300 font-mono">
                You have an active battle that requires your attention
              </p>
            </div>

            {/* Active Battle Card */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-red-500/30 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="text-yellow-400" size={24} />
                <h2 className="text-2xl font-bold text-white">{playerActiveBattle.battle_name}</h2>
                <div className={`px-3 py-1 rounded-md border text-sm font-semibold ${
                  playerActiveBattle.battle_status === 'waiting_for_players' 
                    ? 'text-green-400 border-green-500/30 bg-green-500/10'
                    : playerActiveBattle.battle_status === 'in_progress'
                      ? 'text-red-400 border-red-500/30 bg-red-500/10'
                      : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                }`}>
                  {playerActiveBattle.battle_status.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{playerActiveBattle.current_participants}/{playerActiveBattle.max_participants}</div>
                  <div className="text-gray-400 text-sm">Players</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{playerActiveBattle.total_prize_pool?.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">Prize Pool</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setSelectedBattleId(playerActiveBattle.id);
                    setCurrentView('battle');
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Swords size={20} />
                  Enter Battle
                </button>

                {/* Creator-only actions */}
                {playerActiveBattle.creator_id === player?.id && (
                  <div className="flex gap-3">
                    {playerActiveBattle.battle_status === 'waiting_for_players' && playerActiveBattle.current_participants >= 2 && (
                      <button
                        onClick={() => {
                          if (player) {
                            handleStartBattle(playerActiveBattle.id, player.id);
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <Swords size={16} />
                        Start Battle Now
                      </button>
                    )}
                    
                    {playerActiveBattle.battle_status === 'waiting_for_players' && playerActiveBattle.current_participants < 2 && (
                      <div className="flex-1 bg-gray-600/50 text-gray-400 font-bold py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                        <Crown size={16} />
                        Need 1 More Player
                      </div>
                    )}
                    
                    {playerActiveBattle.battle_status === 'waiting_for_players' && (
                      <button
                        onClick={() => handleCancelBattle(playerActiveBattle.id)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <X size={16} />
                        Cancel Battle
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-yellow-400" size={16} />
                <span className="text-yellow-400 font-semibold text-sm">Important</span>
              </div>
              <p className="text-yellow-300 text-sm">
                {playerActiveBattle.creator_id === player?.id 
                  ? `As the battle creator, you can start the battle early once you have at least 2 players (currently ${playerActiveBattle.current_participants}/${playerActiveBattle.max_participants}), or cancel it to create a new one.`
                  : "You must complete this battle before you can join or create another one."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Swords className="text-red-500 animate-pulse" size={48} />
              <div className="absolute -top-1 -right-1">
                <Flame className="text-orange-500 animate-bounce" size={20} />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent font-mono">
              BATTLE ARENA
            </h1>
            <div className="relative">
              <Crown className="text-yellow-500 animate-pulse" size={48} />
              <div className="absolute -top-1 -right-1">
                <Zap className="text-blue-500 animate-bounce" size={20} />
              </div>
            </div>
          </div>
          <p className="text-xl text-gray-300 font-mono max-w-3xl mx-auto">
            Enter the ultimate battlefield where commanders clash in tactical combat. 
            Winner takes all the prize pool and gains massive reputation!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-blue-500/30 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="text-blue-400" size={20} />
              <span className="text-blue-400 font-semibold text-sm">Active Battles</span>
            </div>
            <div className="text-2xl font-bold text-white">{activeBattles.length}</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-green-500/30 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="text-green-400" size={20} />
              <span className="text-green-400 font-semibold text-sm">Total Battles</span>
            </div>
            <div className="text-2xl font-bold text-white">{battleHistory.length + activeBattles.length}</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-purple-500/30 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="text-purple-400" size={20} />
              <span className="text-purple-400 font-semibold text-sm">Active Prize Pools</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {activeBattles.reduce((sum, battle) => sum + (battle.total_prize_pool || 0), 0).toLocaleString()}
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-orange-500/30 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="text-orange-400" size={20} />
              <span className="text-orange-400 font-semibold text-sm">Avg Duration</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {battleHistory.length > 0 
                ? Math.round(battleHistory.reduce((sum, battle) => sum + (battle.battle_duration_minutes || 0), 0) / battleHistory.length)
                : 0}m
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={!connected || !player}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 disabled:scale-100 shadow-lg shadow-red-600/30"
          >
            <Plus size={20} />
            Create Battle
          </button>
          
          <button
            onClick={refreshBattles}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-600/30"
          >
            <Activity size={20} />
            Refresh Battles
          </button>
        </div>

        {/* Connection Warning */}
        {!connected && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-yellow-400" size={16} />
              <span className="text-yellow-400 font-semibold text-sm">Wallet Required</span>
            </div>
            <p className="text-yellow-300 text-sm">
              Connect your wallet and select a country to participate in PvP battles.
            </p>
          </div>
        )}

        {!player && connected && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-orange-400" size={16} />
              <span className="text-orange-400 font-semibold text-sm">Country Selection Required</span>
            </div>
            <p className="text-orange-300 text-sm">
              Please select a country from the home page to enter PvP battles.
            </p>
          </div>
        )}

        {/* Battle Lists */}
        <PvPBattleList 
          activeBattles={activeBattles}
          battleHistory={battleHistory}
          player={player}
          onJoinBattle={handleJoinBattle}
          onStartBattle={handleStartBattle}
          onRejoinBattle={handleRejoinBattleWrapper}
          onCancelBattle={handleCancelBattle}
          onRefresh={refreshBattles}
        />

        {/* Create Battle Modal */}
        {showCreateModal && (
          <CreateBattleModal
            player={player}
            onClose={() => setShowCreateModal(false)}
            onCreateBattle={handleCreateBattle}
          />
        )}
      </div>
    </div>
  );
};