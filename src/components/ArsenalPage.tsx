import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { GamePlayer, PlayerEquipment } from '../types/game';
import { BackgroundEffects } from './BackgroundEffects';
import { useGameData } from '../hooks/useGameData';
import { createTokenBurnTransaction, connection, ROCKET_PRICE, DEFENSE_SYSTEM_PRICE } from '../lib/solana';
import { GAME_CONSTANTS } from '../lib/gameLogic';
import { CommanderBadge } from './CommanderBadge';
import { 
  Rocket, 
  Shield, 
  Coins, 
  Plus, 
  Minus,
  ShoppingCart,
  Zap,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  Flame,
  TrendingUp,
  Info,
  User,
  Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ArsenalPageProps {
  player: GamePlayer | null;
  equipment: PlayerEquipment | null;
  loading: boolean;
  tokenBalance: number;
  onPageChange: (page: string) => void;
}

export const ArsenalPage: React.FC<ArsenalPageProps> = ({ 
  player, 
  equipment,
  loading, 
  tokenBalance,
  onPageChange 
}) => {
  const { publicKey, sendTransaction } = useWallet();
  const { updatePlayerRockets, updatePlayerDefenseSystems, refreshPlayerData } = useGameData();
  const [rocketQuantity, setRocketQuantity] = useState(1);
  const [defenseQuantity, setDefenseQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState<'rockets' | 'defense' | null>(null);

  // Auto-refresh player data every 10 seconds to ensure sync
  useEffect(() => {
    if (player) {
      const interval = setInterval(() => {
        refreshPlayerData();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [player, refreshPlayerData]);

  const handlePurchaseRockets = async () => {
    if (!player || !equipment || !publicKey) {
      toast.error('Please connect wallet and select a country first');
      return;
    }

    const totalCost = ROCKET_PRICE * rocketQuantity;
    if (tokenBalance < totalCost) {
      toast.error(`Insufficient $NUKED tokens. Need ${totalCost.toLocaleString()}, have ${tokenBalance.toLocaleString()}`);
      return;
    }

    setPurchasing('rockets');
    
    try {
      console.log(`🚀 Purchasing ${rocketQuantity} rockets for ${totalCost} $NUKED`);
      
      // Create and send burn transaction
      const burnTransaction = await createTokenBurnTransaction(publicKey, totalCost);
      const signature = await sendTransaction(burnTransaction, connection);
      
      console.log('🔥 Token burn transaction sent:', signature);
      toast.success(`🔥 Burning ${totalCost.toLocaleString()} $NUKED tokens...`);
      
      // Wait for transaction confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('✅ Transaction confirmed');
      
      // Update player rockets in database
      const newRocketCount = equipment.rockets + rocketQuantity;
      console.log(`📊 Updating rockets: ${equipment.rockets} -> ${newRocketCount}`);
      
      await updatePlayerRockets(newRocketCount);
      
      // Force refresh player data
      await refreshPlayerData();
      
      toast.success(`🚀 Successfully purchased ${rocketQuantity} rocket${rocketQuantity > 1 ? 's' : ''}!`);
      setRocketQuantity(1);
      
    } catch (error) {
      console.error('❌ Error purchasing rockets:', error);
      toast.error(`Failed to purchase rockets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setPurchasing(null);
    }
  };

  const handlePurchaseDefense = async () => {
    if (!player || !equipment || !publicKey) {
      toast.error('Please connect wallet and select a country first');
      return;
    }

    const totalCost = DEFENSE_SYSTEM_PRICE * defenseQuantity;
    if (tokenBalance < totalCost) {
      toast.error(`Insufficient $NUKED tokens. Need ${totalCost.toLocaleString()}, have ${tokenBalance.toLocaleString()}`);
      return;
    }

    setPurchasing('defense');
    
    try {
      console.log(`🛡️ Purchasing ${defenseQuantity} defense systems for ${totalCost} $NUKED`);
      
      // Create and send burn transaction
      const burnTransaction = await createTokenBurnTransaction(publicKey, totalCost);
      const signature = await sendTransaction(burnTransaction, connection);
      
      console.log('🔥 Token burn transaction sent:', signature);
      toast.success(`🔥 Burning ${totalCost.toLocaleString()} $NUKED tokens...`);
      
      // Wait for transaction confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('✅ Transaction confirmed');
      
      // Update player defense systems in database
      const newDefenseCount = equipment.defense_systems + defenseQuantity;
      console.log(`📊 Updating defense systems: ${equipment.defense_systems} -> ${newDefenseCount}`);
      
      await updatePlayerDefenseSystems(newDefenseCount);
      
      // Force refresh player data
      await refreshPlayerData();
      
      toast.success(`🛡️ Successfully purchased ${defenseQuantity} defense system${defenseQuantity > 1 ? 's' : ''}!`);
      setDefenseQuantity(1);
      
    } catch (error) {
      console.error('❌ Error purchasing defense systems:', error);
      toast.error(`Failed to purchase defense systems: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
        <BackgroundEffects />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-3 text-white">
            <Activity className="animate-spin" size={24} />
            <span className="text-lg font-mono">Loading Arsenal...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!player || !equipment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
        <BackgroundEffects />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Target size={48} className="mx-auto mb-4 text-orange-500 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Arsenal Access Denied</h2>
            <p className="text-gray-400 mb-4">Connect your wallet and select a country to access your personal arsenal.</p>
            <button
              onClick={() => onPageChange('home')}
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 hover:scale-105"
            >
              Go to Home
            </button>
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
            <Target className="text-orange-500 animate-pulse" size={48} />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent font-mono">
              ARSENAL
            </h1>
            <Shield className="text-blue-500 animate-pulse" size={48} />
          </div>
          <p className="text-xl text-gray-300 font-mono max-w-3xl mx-auto">
            Build your personal military arsenal with advanced weaponry and defensive systems. 
            All purchases burn $NUKED tokens permanently from circulation.
          </p>
        </div>

        {/* Commander Info */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-green-500/30 p-6 mb-8 shadow-lg shadow-green-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <User className="text-green-400" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-white">Commander {player.username}</h2>
                <p className="text-gray-400">Personal Military Assets</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CommanderBadge player={player} size="large" showTooltip={false} />
              <div className="text-right">
                <div className="text-sm text-gray-400">Win Rate</div>
                <div className="text-lg font-bold text-green-400">
                  {player.total_matches > 0 ? Math.round((player.total_wins / player.total_matches) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-orange-500/30 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="text-orange-400" size={20} />
              <span className="text-orange-400 font-semibold text-sm">$NUKED Balance</span>
            </div>
            <div className="text-2xl font-bold text-white">{tokenBalance.toFixed(0).toLocaleString()}</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-red-500/30 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Rocket className="text-red-400" size={20} />
              <span className="text-red-400 font-semibold text-sm">Rockets</span>
            </div>
            <div className="text-2xl font-bold text-white">{equipment.rockets}</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-blue-500/30 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="text-blue-400" size={20} />
              <span className="text-blue-400 font-semibold text-sm">Defense Systems</span>
            </div>
            <div className="text-2xl font-bold text-white">{equipment.defense_systems}</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-green-500/30 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="text-green-400" size={20} />
              <span className="text-green-400 font-semibold text-sm">Defense Charges</span>
            </div>
            <div className="text-2xl font-bold text-white">{equipment.defense_charges}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-purple-500/30 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="text-purple-400" size={20} />
              <span className="text-purple-400 font-semibold text-sm">Battles Won</span>
            </div>
            <div className="text-2xl font-bold text-white">{player.total_wins}</div>
          </div>
        </div>

        {/* Burn Info Banner */}
        <div className="bg-gradient-to-r from-red-600/20 via-orange-500/15 to-red-600/20 backdrop-blur-md rounded-xl border border-red-500/30 p-4 mb-8 shadow-lg shadow-red-500/10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="text-orange-400 animate-pulse" size={20} />
            <h3 className="text-white font-bold text-lg font-mono">DEFLATIONARY MECHANICS</h3>
            <Flame className="text-orange-400 animate-pulse" size={20} />
          </div>
          <p className="text-center text-orange-200 text-sm">
            Every weapon purchase burns $NUKED tokens permanently, reducing total supply and creating deflationary pressure. 
            Your purchases directly impact the token economics!
          </p>
        </div>

        {/* Weapons Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rockets */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-red-500/30 p-6 shadow-lg shadow-red-500/10">
            <div className="flex items-center gap-3 mb-6">
              <Rocket className="text-red-500" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-white font-mono">ROCKETS</h2>
                <p className="text-gray-400">Personal offensive weapons</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-red-400 font-semibold">Price per Rocket:</span>
                  <span className="text-white font-bold">{ROCKET_PRICE.toLocaleString()} $NUKED</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-red-400 font-semibold">Base Damage:</span>
                  <span className="text-white font-bold">{GAME_CONSTANTS.ROCKET_BASE_DAMAGE}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-red-400 font-semibold">Damage Multiplier:</span>
                  <span className="text-white font-bold">{equipment.rocket_damage_multiplier}x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-400 font-semibold">Current Stock:</span>
                  <span className="text-white font-bold">{equipment.rockets}</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="block text-white font-semibold">Quantity to Purchase:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRocketQuantity(Math.max(1, rocketQuantity - 1))}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    disabled={purchasing === 'rockets'}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={rocketQuantity}
                    onChange={(e) => setRocketQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white text-center focus:border-red-500 focus:outline-none"
                    disabled={purchasing === 'rockets'}
                  />
                  <button
                    onClick={() => setRocketQuantity(rocketQuantity + 1)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    disabled={purchasing === 'rockets'}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Total Cost */}
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Cost:</span>
                  <span className="text-red-400 font-bold text-lg">
                    {(ROCKET_PRICE * rocketQuantity).toLocaleString()} $NUKED
                  </span>
                </div>
                    <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-400 text-sm">&nbsp;</span>
              
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-400 text-sm">Tokens to Burn:</span>
                  <span className="text-orange-400 font-semibold text-sm flex items-center gap-1">
                    <Flame size={12} />
                    {(ROCKET_PRICE * rocketQuantity).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={handlePurchaseRockets}
                disabled={purchasing === 'rockets' || tokenBalance < (ROCKET_PRICE * rocketQuantity)}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {purchasing === 'rockets' ? (
                  <>
                    <Activity className="animate-spin" size={20} />
                    Purchasing...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Purchase Rockets
                  </>
                )}
              </button>

              {tokenBalance < (ROCKET_PRICE * rocketQuantity) && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertTriangle size={16} />
                  Insufficient $NUKED tokens
                </div>
              )}
            </div>
          </div>

          {/* Defense Systems */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-blue-500/30 p-6 shadow-lg shadow-blue-500/10">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-blue-500" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-white font-mono">DEFENSE SYSTEMS</h2>
                <p className="text-gray-400">Personal missile interception</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-400 font-semibold">Price per System:</span>
                  <span className="text-white font-bold">{DEFENSE_SYSTEM_PRICE.toLocaleString()} $NUKED</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-400 font-semibold">Effectiveness:</span>
                  <span className="text-white font-bold">{(equipment.defense_effectiveness * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-400 font-semibold">Charges per System:</span>
                  <span className="text-white font-bold">{GAME_CONSTANTS.DEFENSE_CHARGES_PER_SYSTEM}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-400 font-semibold">Current Systems:</span>
                  <span className="text-white font-bold">{equipment.defense_systems}</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="block text-white font-semibold">Quantity to Purchase:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDefenseQuantity(Math.max(1, defenseQuantity - 1))}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    disabled={purchasing === 'defense'}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={defenseQuantity}
                    onChange={(e) => setDefenseQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white text-center focus:border-blue-500 focus:outline-none"
                    disabled={purchasing === 'defense'}
                  />
                  <button
                    onClick={() => setDefenseQuantity(defenseQuantity + 1)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    disabled={purchasing === 'defense'}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Total Cost */}
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Cost:</span>
                  <span className="text-blue-400 font-bold text-lg">
                    {(DEFENSE_SYSTEM_PRICE * defenseQuantity).toLocaleString()} $NUKED
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-400 text-sm">Charges Added:</span>
                  <span className="text-green-400 font-semibold text-sm">
                    +{defenseQuantity * GAME_CONSTANTS.DEFENSE_CHARGES_PER_SYSTEM}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-400 text-sm">Tokens to Burn:</span>
                  <span className="text-orange-400 font-semibold text-sm flex items-center gap-1">
                    <Flame size={12} />
                    {(DEFENSE_SYSTEM_PRICE * defenseQuantity).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={handlePurchaseDefense}
                disabled={purchasing === 'defense' || tokenBalance < (DEFENSE_SYSTEM_PRICE * defenseQuantity)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {purchasing === 'defense' ? (
                  <>
                    <Activity className="animate-spin" size={20} />
                    Purchasing...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Purchase Defense Systems
                  </>
                )}
              </button>

              {tokenBalance < (DEFENSE_SYSTEM_PRICE * defenseQuantity) && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertTriangle size={16} />
                  Insufficient $NUKED tokens
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-md rounded-xl border border-gray-600/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="text-blue-400" size={20} />
            <h3 className="text-white font-bold text-lg">Personal Arsenal Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="text-red-400 font-semibold mb-2">🚀 Personal Rockets</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Used for attacking other commanders</li>
                <li>• Each rocket deals {GAME_CONSTANTS.ROCKET_BASE_DAMAGE} base damage</li>
                <li>• Your damage multiplier: {equipment.rocket_damage_multiplier}x</li>
                <li>• Commander rank provides additional damage bonuses</li>
                <li>• Rockets are consumed when used in combat</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-blue-400 font-semibold mb-2">🛡️ Personal Defense Systems</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Intercept incoming rockets in battles</li>
                <li>• {(equipment.defense_effectiveness * 100).toFixed(0)}% chance to intercept per charge</li>
                <li>• Each system provides {GAME_CONSTANTS.DEFENSE_CHARGES_PER_SYSTEM} charges</li>
                <li>• Charges are consumed when intercepting attacks</li>
                <li>• Commander rank provides defense bonuses</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-orange-400" size={16} />
              <span className="text-orange-400 font-semibold">Token Economics</span>
            </div>
            <p className="text-orange-200 text-sm">
              All weapon purchases burn $NUKED tokens permanently from circulation, creating deflationary pressure. 
              This means every purchase reduces the total supply, potentially increasing the value of remaining tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};