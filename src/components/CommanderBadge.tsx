import React from 'react';
import { GamePlayer } from '../types/game';
import { getPlayerRank, getNextRank, getLevelsToNextRank, getRankProgress, getTierColor } from '../lib/rankSystem';
import { TrendingUp, Award, Star, Shield, Sword, Zap } from 'lucide-react';

interface CommanderBadgeProps {
  player: GamePlayer;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  showTooltip?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export const CommanderBadge: React.FC<CommanderBadgeProps> = ({
  player,
  size = 'medium',
  showProgress = false,
  showTooltip = true,
  className = '',
  variant = 'default'
}) => {
  const rank = getPlayerRank(player);
  const nextRank = getNextRank(player);
  const levelsToNext = getLevelsToNextRank(player);
  const progress = getRankProgress(player);

  const sizeClasses = {
    small: 'text-xs px-1.5 py-0.5',
    medium: 'text-sm px-2 py-1',
    large: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    small: 12,
    medium: 16,
    large: 20
  };

  const renderCompactBadge = () => (
    <div 
      className={`inline-flex items-center gap-1 rounded-md font-bold border transition-all duration-200 hover:scale-105 ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: `${rank.color}15`,
        borderColor: `${rank.color}80`,
        color: rank.color
      }}
    >
      <span className="text-xs">{rank.icon}</span>
      <span className="font-mono font-bold tracking-wider text-xs">{rank.badge}</span>
    </div>
  );

  const renderDetailedBadge = () => (
    <div 
      className={`inline-flex items-center gap-2 rounded-lg font-bold border-2 transition-all duration-200 hover:scale-105 ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: `${rank.color}20`,
        borderColor: rank.color,
        color: rank.color
      }}
    >
      <span className="text-sm">{rank.icon}</span>
      <div className="flex flex-col items-start">
        <span className="font-mono font-bold tracking-wider text-xs">{rank.badge}</span>
        <span className="text-xs opacity-80">Level {player.rank_level}</span>
      </div>
      {size === 'large' && (
        <Award size={iconSizes[size]} className="ml-1" />
      )}
    </div>
  );

  const renderDefaultBadge = () => (
    <div 
      className={`inline-flex items-center gap-1 sm:gap-2 rounded-lg font-bold border-2 transition-all duration-200 hover:scale-105 ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: `${rank.color}20`,
        borderColor: rank.color,
        color: rank.color
      }}
    >
      <span className="text-sm sm:text-base">{rank.icon}</span>
      <span className="font-mono font-bold tracking-wider">{rank.badge}</span>
      {size === 'large' && (
        <Award size={iconSizes[size]} className="ml-1" />
      )}
    </div>
  );

  const renderBadge = () => {
    switch (variant) {
      case 'compact':
        return renderCompactBadge();
      case 'detailed':
        return renderDetailedBadge();
      default:
        return renderDefaultBadge();
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Main Badge */}
      {renderBadge()}

      {/* Progress Bar (if enabled) */}
      {showProgress && nextRank && (
        <div className="mt-1 w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${progress}%`,
              backgroundColor: rank.color
            }}
          ></div>
        </div>
      )}

      {/* Enhanced Tooltip */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
          <div className="relative">
            <div className="bg-black backdrop-blur-md rounded-lg p-4 border border-gray-600 shadow-2xl min-w-80 max-w-sm relative z-[9999]
                          sm:left-0 md:-left-20 lg:-left-32 xl:-left-40">
              <div className="text-center">
                {/* Rank Header */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-3xl">{rank.icon}</span>
                  <div>
                    <h3 className="text-white font-bold text-base">{rank.name}</h3>
                    <p className="text-gray-400 text-xs">{rank.description}</p>
                    <div 
                      className="text-xs font-semibold mt-1 px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${getTierColor(rank.tier)}20`,
                        color: getTierColor(rank.tier)
                      }}
                    >
                      {rank.tier.toUpperCase()} TIER
                    </div>
                  </div>
                </div>
                
                {/* Stats Section */}
                <div className="border-t border-gray-600 pt-3 mt-3 space-y-3">
                  {/* Level and Reputation */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Level:</span>
                    <span className="text-white font-semibold">{player.rank_level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Reputation:</span>
                    <span className="text-white font-semibold">{player.reputation}</span>
                  </div>
                  
                  {/* Combat Bonuses */}
                  {(rank.bonuses.damageBonus > 0 || rank.bonuses.defenseBonus > 0) && (
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <div className="text-gray-400 text-xs mb-2">Combat Bonuses</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {rank.bonuses.damageBonus > 0 && (
                          <div className="flex items-center gap-1 text-red-400">
                            <Sword size={10} />
                            <span>+{rank.bonuses.damageBonus}% DMG</span>
                          </div>
                        )}
                        {rank.bonuses.defenseBonus > 0 && (
                          <div className="flex items-center gap-1 text-blue-400">
                            <Shield size={10} />
                            <span>+{rank.bonuses.defenseBonus}% DEF</span>
                          </div>
                        )}
                      </div>
                      {rank.bonuses.reputationMultiplier !== 1.0 && (
                        <div className="flex items-center gap-1 text-purple-400 text-xs mt-1">
                          <Zap size={10} />
                          <span>{rank.bonuses.reputationMultiplier}x REP</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Rank Progress */}
                  {nextRank ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Next Rank:</span>
                        <span className="text-yellow-400 font-semibold flex items-center gap-1">
                          {nextRank.icon} {nextRank.name}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress:</span>
                        <span className="text-green-400 font-semibold">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Levels Needed:</span>
                        <span className="text-orange-400 font-semibold">+{levelsToNext}</span>
                      </div>
                      
                      {/* Progress Bar in Tooltip */}
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: rank.color
                          }}
                        ></div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-400">
                        <Star size={12} />
                        <span className="text-xs font-semibold">MAXIMUM RANK ACHIEVED</span>
                        <Star size={12} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};