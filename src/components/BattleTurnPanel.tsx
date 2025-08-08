import React, { useState, useMemo } from 'react';
import { PvPBattleParticipant } from '../types/game';
import { 
  getWeaponCost,
  calculatePvPAttackDamage,
  canDeployDefenseSystem,
  getDefenseSystemPreview
} from '../lib/gameLogic';
import { getPlayerRank } from '../lib/rankSystem';
import { 
  Sword, 
  Shield, 
  SkipForward, 
  Target, 
  Zap, 
  X,
  Flame,
  Bomb,
  Activity,
  AlertTriangle,
  Users,
  Crosshair,
  TrendingUp,
  Award,
  Crown,
  Flag
} from 'lucide-react';

interface BattleTurnPanelProps {
  availableTargets: PvPBattleParticipant[];
  availableWeapons: string[];
  selectedTarget: string;
  onTargetSelect: (targetId: string) => void;
  onAttack: (targetId: string, weaponType: string) => void;
  onDeployDefense: () => void;
  onPass: () => void;
  playerEquipment: any;
  currentPlayer?: any; // Add current player for rank calculations
  onTargetModeChange?: (targetMode: boolean) => void;
  activeDefenseCharges?: number; // Add active defense charges
}

export const BattleTurnPanel: React.FC<BattleTurnPanelProps> = ({
  availableTargets,
  availableWeapons,
  selectedTarget,
  onTargetSelect,
  onAttack,
  onDeployDefense,
  onPass,
  playerEquipment,
  currentPlayer,
  onTargetModeChange,
  activeDefenseCharges = 0
}) => {
  const [selectedWeapon, setSelectedWeapon] = useState<string>('');

  // Get player rank for damage calculations
  const playerRank = currentPlayer ? getPlayerRank(currentPlayer) : null;
  
  // Get defense system info
  const defenseInfo = playerEquipment ? getDefenseSystemPreview(playerEquipment) : null;

  // Group targets by country for better organization
  const targetsByCountry = useMemo(() => {
    return availableTargets.reduce((acc, target) => {
      const countryName = target.country_name || 'Unknown';
      if (!acc[countryName]) {
        acc[countryName] = [];
      }
      acc[countryName].push(target);
      return acc;
    }, {} as Record<string, PvPBattleParticipant[]>);
  }, [availableTargets]);

  // Check if there are civil war scenarios (same country targets)
  const currentPlayerCountry = currentPlayer?.selected_country_id;
  const civilWarTargets = availableTargets.filter(target => target.country_id === currentPlayerCountry);
  const foreignTargets = availableTargets.filter(target => target.country_id !== currentPlayerCountry);

  const weapons = [
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
      icon: <Bomb size={16} />,
      color: 'from-orange-600 to-orange-700',
      description: 'Heavy artillery bombardment'
    },
    {
      id: 'Nuclear Strike',
      name: 'Nuclear Strike',
      damage: 50,
      cost: 3,
      icon: <Flame size={16} />,
      color: 'from-purple-600 to-purple-700',
      description: 'Devastating nuclear weapon'
    }
  ];

  // Memoize damage calculations to prevent constant recalculation
  const weaponDamageCalculations = useMemo(() => {
    if (!currentPlayer) {
      return weapons.reduce((acc, weapon) => {
        acc[weapon.id] = { base: weapon.damage, actual: weapon.damage, bonus: 0 };
        return acc;
      }, {} as Record<string, { base: number; actual: number; bonus: number }>);
    }

    return weapons.reduce((acc, weapon) => {
      // Calculate base damage without random factor for display
      let baseDamage = weapon.damage;
      
      // Apply rank damage bonus
      if (playerRank && playerRank.bonuses.damageBonus > 0) {
        baseDamage *= (1 + playerRank.bonuses.damageBonus / 100);
      }
      
      const actualDamage = Math.round(baseDamage);
      const bonus = actualDamage - weapon.damage;
      
      acc[weapon.id] = {
        base: weapon.damage,
        actual: actualDamage,
        bonus: Math.round(bonus)
      };
      return acc;
    }, {} as Record<string, { base: number; actual: number; bonus: number }>);
  }, [currentPlayer?.id, playerRank?.bonuses.damageBonus]);

  // Get damage calculation for a specific weapon
  const getActualDamage = (weaponType: string) => {
    return weaponDamageCalculations[weaponType] || { base: 0, actual: 0, bonus: 0 };
  };

  const handleWeaponSelect = (weaponId: string) => {
    if (!selectedTarget) {
      return;
    }
    
    setSelectedWeapon(weaponId);
    onTargetModeChange?.(false); // Exit target mode when attacking
    onAttack(selectedTarget, weaponId);
  };

  const canUseWeapon = (weapon: any) => {
    return playerEquipment && playerEquipment.rockets >= weapon.cost;
  };

  // Auto-scroll to weapon selection when target is selected
  React.useEffect(() => {
    if (selectedTarget) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const weaponSection = document.getElementById('weapon-selection-section');
        if (weaponSection) {
          weaponSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
          });
        }
      }, 100);
    }
  }, [selectedTarget]);
  return (
    <div className="p-4 space-y-4">
      {/* Equipment Status */}
      {playerEquipment && (
        <div className="bg-slate-800/50 rounded-lg p-3 border border-gray-600/30">
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
              <span className="text-gray-400">Active:</span>
              <span className="text-white font-semibold">{activeDefenseCharges}</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield size={12} className="text-blue-400" />
              <span className="text-gray-400">Systems:</span>
              <span className="text-white font-semibold">{playerEquipment.defense_systems}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={12} className="text-purple-400" />
              <span className="text-gray-400">Intercept:</span>
              <span className="text-white font-semibold">{defenseInfo?.interceptChance || 0}%</span>
            </div>
          </div>
          
          {/* Rank Bonus Display */}
          {playerRank && playerRank.bonuses.damageBonus > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-600/30">
              <div className="flex items-center gap-2 text-xs">
                <Award size={12} className="text-yellow-400" />
                <span className="text-gray-400">Rank Bonus:</span>
                <span className="text-yellow-400 font-semibold">+{playerRank.bonuses.damageBonus}% DMG</span>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedTarget ? (
        // Enhanced target selection with country grouping
        <div className="space-y-4">
          {/* Target Selection Header */}
          <div>
            <div className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
              <Crosshair size={14} />
              Select Target
            </div>
            
            <button
              onClick={() => onTargetModeChange?.(true)}
              className="w-full mb-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Target size={16} />
              Use Map to Target
            </button>
            
            {/* Enhanced Target List with Country Grouping */}
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {availableTargets.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  <Users size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No targets available</p>
                </div>
              ) : (
                <>
                  {/* Civil War Targets (Same Country) */}
                  {civilWarTargets.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-red-400 font-semibold">
                        <Sword size={12} />
                        <span>CIVIL WAR TARGETS</span>
                        <div className="flex-1 h-px bg-red-500/30"></div>
                      </div>
                      {civilWarTargets.map((target) => (
                        <button
                          key={target.player_id}
                          onClick={() => onTargetSelect(target.player_id)}
                          className="w-full flex items-center gap-3 p-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors text-left border border-red-500/30 hover:border-red-500/50"
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
                            <div className="text-white font-semibold text-sm flex items-center gap-2">
                              {target.username}
                              <span className="text-red-400 text-xs">⚔️</span>
                            </div>
                            <div className="text-gray-400 text-xs">
                              Health: {target.current_health}/{target.max_health} • Same Country
                            </div>
                          </div>
                          <Target size={14} className="text-red-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Foreign Targets */}
                  {foreignTargets.length > 0 && (
                    <div className="space-y-2">
                      {civilWarTargets.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
                          <Flag size={12} />
                          <span>FOREIGN TARGETS</span>
                          <div className="flex-1 h-px bg-blue-500/30"></div>
                        </div>
                      )}
                      {Object.entries(targetsByCountry).map(([countryName, targets]) => {
                        // Skip if this is the current player's country (already shown above)
                        if (targets.some(t => t.country_id === currentPlayerCountry)) {
                          return null;
                        }
                        
                        return (
                          <div key={countryName} className="space-y-1">
                            {targets.length > 1 && (
                              <div className="text-xs text-gray-500 font-semibold px-2">
                                {countryName} ({targets.length} targets)
                              </div>
                            )}
                            {targets.map((target) => (
                              <button
                                key={target.player_id}
                                onClick={() => onTargetSelect(target.player_id)}
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
                                    Health: {target.current_health}/{target.max_health} • {target.country_name}
                                  </div>
                                </div>
                                <Target size={14} className="text-red-400" />
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Other Actions */}
          <div className="space-y-2">
            <button
              onClick={onDeployDefense}
              disabled={!defenseInfo?.canUse}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 disabled:scale-100 flex flex-col gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                <Shield size={18} />
                <span>Deploy Defense System</span>
              </div>
              {defenseInfo && (
                <div className="text-xs opacity-80">
                  {defenseInfo.canUse ? (
                    `Uses 1 system • +${defenseInfo.chargesPerSystem} charges • ${defenseInfo.interceptChance}% intercept`
                  ) : (
                    'No defense systems available'
                  )}
                </div>
              )}
            </button>
            
            <button
              onClick={onPass}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              <SkipForward size={18} />
              Pass Turn
            </button>
          </div>
        </div>
      ) : (
        // Enhanced weapon selection with target info
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="text-red-400 animate-pulse" size={16} />
            <span className="text-white font-semibold">🎯 TARGET LOCKED - Select Weapon</span>
          </div>
          
          {/* Enhanced Selected Target Display */}
          <div className="p-3 bg-red-500/20 border-2 border-red-500/50 rounded-lg animate-pulse">
            <div className="text-red-400 text-sm font-semibold mb-1 flex items-center gap-2">
              <Crosshair size={14} className="animate-spin" />
              Target Locked:
            </div>
            {(() => {
              const target = availableTargets.find(t => t.player_id === selectedTarget);
              const isCivilWar = target?.country_id === currentPlayerCountry;
              return (
                <div className="flex items-center gap-2 bg-black/30 rounded p-2">
                  <img 
                    src={`/flags/32x24/${target?.country_id.toLowerCase()}.png`}
                    alt={target?.country_name}
                    className="w-4 h-3 object-cover rounded-sm"
                  />
                  <div className="text-white font-bold text-lg">{target?.username}</div>
                  <div className="text-red-400 font-mono text-sm">
                    HP: {target?.current_health}/{target?.max_health}
                  </div>
                  {isCivilWar && (
                    <div className="flex items-center gap-1 text-red-400 text-xs">
                      <Sword size={10} />
                      <span>CIVIL WAR</span>
                    </div>
                  )}
                  <div className="ml-auto text-red-400 animate-pulse">🎯</div>
                </div>
              );
            })()}
          </div>
          
          {/* Weapon Selection Section with ID for auto-scroll */}
          <div id="weapon-selection-section" className="space-y-2">
            <div className="text-center text-sm text-red-400 font-semibold mb-2 animate-pulse">
              ⚡ CHOOSE YOUR WEAPON ⚡
            </div>
            {weapons.map((weapon) => {
              const isAvailable = availableWeapons.includes(weapon.id);
              const canUse = canUseWeapon(weapon);
              const damageCalc = getActualDamage(weapon.id);
              
              return (
                <button
                  key={weapon.id}
                  onClick={() => handleWeaponSelect(weapon.id)}
                  disabled={!isAvailable || !canUse}
                  className={`w-full bg-gradient-to-r ${weapon.color} hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 disabled:from-gray-600 disabled:to-gray-700 disabled:scale-100 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex flex-col gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-white/30`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {weapon.icon}
                      <span className="text-lg">{weapon.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">({weapon.cost} 🚀)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Zap size={14} />
                      {damageCalc.bonus > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-300 line-through text-sm">{damageCalc.base}</span>
                          <span className="text-green-400 font-bold text-lg">{damageCalc.actual}</span>
                          <span className="text-green-400 font-bold">DMG</span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold">{damageCalc.actual} DMG</span>
                      )}
                    </div>
                    
                    {damageCalc.bonus > 0 && (
                      <div className="flex items-center gap-1 text-sm text-green-400 font-bold">
                        <TrendingUp size={10} />
                        <span>+{damageCalc.bonus}</span>
                      </div>
                    )}
                  </div>
                  
                </button>
              );
            })}
          </div>

          {/* Enhanced Info Sections */}
          {defenseInfo && !defenseInfo.canUse && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="text-red-400" size={14} />
                <span className="text-red-400 font-semibold text-sm">No Defense Systems</span>
              </div>
              <p className="text-red-300 text-xs">
                You need defense systems to deploy defenses. Visit the Arsenal to purchase them.
              </p>
            </div>
          )}
          
          {/* Civil War Warning */}
          {(() => {
            const target = availableTargets.find(t => t.player_id === selectedTarget);
            const isCivilWar = target?.country_id === currentPlayerCountry;
            return isCivilWar ? (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Sword className="text-red-400" size={14} />
                  <span className="text-red-400 font-semibold text-sm">Civil War Attack</span>
                </div>
                <p className="text-red-300 text-xs">
                  You are attacking a fellow commander from your own country. This will be marked as a civil war action.
                </p>
              </div>
            ) : null;
          })()}
          
          {/* Weapon Requirements Warning */}
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
          
          {/* Rank Bonus Info */}
          {playerRank && playerRank.bonuses.damageBonus > 0 && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Award className="text-yellow-400" size={14} />
                <span className="text-yellow-400 font-semibold text-sm">Rank Bonus Active</span>
              </div>
              <p className="text-yellow-300 text-xs">
                Your {playerRank.name} rank provides +{playerRank.bonuses.damageBonus}% damage bonus to all weapons!
              </p>
            </div>
          )}
          
          {/* Defense Bonus Info */}
          {playerRank && playerRank.bonuses.defenseBonus > 0 && activeDefenseCharges > 0 && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="text-blue-400" size={14} />
                <span className="text-blue-400 font-semibold text-sm">Active Defense Systems</span>
              </div>
              <p className="text-blue-300 text-xs">
                You have {activeDefenseCharges} active defense charges. Your {playerRank.name} rank provides +{playerRank.bonuses.defenseBonus}% defense effectiveness!
              </p>
            </div>
          )}
          
          <button
            onClick={() => {
              onTargetSelect('');
              setSelectedWeapon('');
              onTargetModeChange?.(false);
            }}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 border border-gray-500/30"
          >
            <X size={16} />
            Cancel Target Lock
          </button>
        </div>
      )}

      {/* Enhanced Turn Info */}
      <div className="pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          {selectedTarget ? (
            <span className="text-red-400 font-bold animate-pulse">🎯 TARGET LOCKED - Choose your weapon to fire! 🎯</span>
          ) : defenseInfo && !defenseInfo.canUse ? (
            <span className="text-red-400">No defense systems - Attack or pass turn</span>
          ) : activeDefenseCharges > 0 ? (
            <span className="text-blue-400">Defense systems active - {activeDefenseCharges} charges protecting you</span>
          ) : civilWarTargets.length > 0 && foreignTargets.length > 0 ? (
            <span className="text-yellow-400">Civil war and foreign targets available</span>
          ) : civilWarTargets.length > 0 ? (
            <span className="text-red-400">Only civil war targets available</span>
          ) : (
            <span>Choose your action for this turn</span>
          )}
        </div>
      </div>
    </div>
  );
};