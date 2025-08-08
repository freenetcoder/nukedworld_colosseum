import React, { useState } from 'react';
import { GamePlayer } from '../types/game';
import { 
  X, 
  Swords, 
  Users, 
  Coins, 
  Clock, 
  Target, 
  Crown, 
  Trophy, 
  Shield,
  Info,
  Zap,
  Star
} from 'lucide-react';
import { formatTokens } from '../lib/solana';
import { getPlayerRank } from '../lib/rankSystem';

interface CreateBattleModalProps {
  player: GamePlayer | null;
  onClose: () => void;
  onCreateBattle: (battleData: any) => void;
}

export const CreateBattleModal: React.FC<CreateBattleModalProps> = ({
  player,
  onClose,
  onCreateBattle
}) => {
  const [battleName, setBattleName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [entryFee, setEntryFee] = useState(1000);
  const [turnTimeLimit, setTurnTimeLimit] = useState(300); // 5 minutes
  const [loading, setLoading] = useState(false);

  const playerRank = player ? getPlayerRank(player) : null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!player) return;
    if (!battleName.trim()) return;

    setLoading(true);

    try {
      const battleData = {
        battle_name: battleName.trim(),
        battle_type: 'health_based',
        max_participants: maxParticipants,
        entry_fee: entryFee,
        turn_time_limit: turnTimeLimit,
        max_rank: player.rank_level,
        battle_settings: {
          allow_spectators: true,
          enable_chat: true,
          auto_start: true
        }
      };

      await onCreateBattle(battleData);
    } catch (error) {
      console.error('Error creating battle:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPrizePool = entryFee * maxParticipants;
  const devFee = Math.floor(totalPrizePool * 0.05); // 5% dev fee
  const winnerPayout = totalPrizePool - devFee;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-red-500/30 shadow-2xl shadow-red-500/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Swords className="text-red-500" size={24} />
            <h2 className="text-2xl font-bold text-white font-mono">Create Battle</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="text-gray-400" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Battle Name */}
          <div>
            <label className="block text-white font-semibold mb-2">Battle Name</label>
            <input
              type="text"
              value={battleName}
              onChange={(e) => setBattleName(e.target.value)}
              placeholder="Enter battle name..."
              className="w-full px-4 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors"
              required
              maxLength={50}
            />
          </div>

          {/* Battle Type Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-blue-400" size={20} />
              <span className="text-blue-400 font-semibold">Battle Type: Health-Based</span>
            </div>
            <p className="text-blue-300 text-sm">
              Turn-based combat where the last commander standing with the most health wins the entire prize pool.
            </p>
          </div>

          {/* Rank Restriction Info */}
          {playerRank && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="text-yellow-400" size={20} />
                <span className="text-yellow-400 font-semibold">Rank Restriction</span>
              </div>
              <p className="text-yellow-300 text-sm">
                Only players with rank <strong>{playerRank.name} (Level {player?.rank_level})</strong> or lower can join this battle. 
                This ensures fair competition within your skill tier.
              </p>
            </div>
          )}
          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Max Participants */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <Users size={16} />
                Max Participants
              </label>
              <select
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:outline-none transition-colors"
              >
                <option value={2}>2 Players</option>
                <option value={3}>3 Players</option>
                <option value={4}>4 Players</option>
                <option value={6}>6 Players</option>
                <option value={8}>8 Players</option>
              </select>
            </div>

            {/* Entry Fee */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <Coins size={16} />
                Entry Cost ($NUKED)
              </label>
              <select
                value={entryFee}
                onChange={(e) => setEntryFee(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:outline-none transition-colors"
              >
                <option value={500}>500 $NUKED</option>
                <option value={1000}>1,000 $NUKED</option>
                <option value={2500}>2,500 $NUKED</option>
                <option value={5000}>5,000 $NUKED</option>
                <option value={10000}>10,000 $NUKED</option>
                <option value={25000}>25,000 $NUKED</option>
              </select>
            </div>

            {/* Turn Time Limit */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <Clock size={16} />
                Turn Time Limit
              </label>
              <select
                value={turnTimeLimit}
                onChange={(e) => setTurnTimeLimit(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:outline-none transition-colors"
              >
                <option value={180}>3 Minutes</option>
                <option value={300}>5 Minutes</option>
                <option value={600}>10 Minutes</option>
                <option value={900}>15 Minutes</option>
              </select>
            </div>

            {/* Creator Info */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <Shield size={16} />
                Your Commander
              </label>
              <div className="px-4 py-3 bg-slate-800/50 border border-gray-600 rounded-lg">
                <div className="text-white font-medium">{player?.username}</div>
                <div className="text-gray-400 text-sm">
                  {playerRank ? `${playerRank.name} (Level ${player?.rank_level})` : 'Ready for battle'}
                </div>
              </div>
            </div>
          </div>

          {/* Prize Pool Info */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="text-yellow-400" size={20} />
              <span className="text-yellow-400 font-semibold">Prize Pool Breakdown</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{formatTokens(totalPrizePool)}</div>
                <div className="text-gray-400">Total Pool</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{formatTokens(winnerPayout)}</div>
                <div className="text-gray-400">Winner Gets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{formatTokens(devFee)}</div>
                <div className="text-gray-400">Dev Fee (5%)</div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="text-blue-400" size={16} />
              <span className="text-blue-400 font-semibold text-sm">Battle Rules</span>
            </div>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Entry cost is transferred to reward pool after transaction confirmation</li>
              <li>• Winner receives the full prize pool (minus 5% dev fee)</li>
              <li>• Turn-based combat on the world map</li>
              <li>• First player is chosen randomly</li>
              <li>• Winner gets massive reputation boost</li>
              <li>• Battle auto-starts when full, or creator can start early with 2+ players</li>
              <li>• Players can rejoin if they leave the page during battle</li>
              <li>• Only players with your rank or lower can join this battle</li>
              <li>• <strong>Important:</strong> Battle is only created after your transaction is confirmed on-chain</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !battleName.trim()}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Zap className="animate-spin" size={20} />
                  Creating...
                </>
              ) : (
                <>
                  <Swords size={20} />
                  Create Battle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};