import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  Globe,
  Shield, 
  Home, 
  Target, 
  LogOut, 
  Menu, 
  X,
  Wallet,
  Copy,
  Check,
  Zap,
  Coins,
  Swords,
  Book
} from 'lucide-react';
import { GamePlayer, PlayerEquipment } from '../types/game';
import { useCountries } from '../hooks/useCountries';
import { formatTokens } from '../lib/solana';
import { NuclearLogo } from './NuclearLogo';
import { CommanderBadge } from './CommanderBadge';
import { isDevWallet } from '../lib/smartContract';
import toast from 'react-hot-toast';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  player?: GamePlayer | null;
  equipment?: PlayerEquipment | null;
  tokenBalance?: number;
  solBalance?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onPageChange,
  player,
  equipment,
  tokenBalance = 0,
  solBalance = 0
}) => {
  const { connected, disconnect, publicKey } = useWallet();
  const { getCountryById } = useCountries();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  
  const playerCountry = player ? getCountryById(player.selected_country_id) : null;

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setWalletDropdownOpen(false);
      setMobileMenuOpen(false);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const copyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toString());
        setAddressCopied(true);
        toast.success('Address copied to clipboard');
        setTimeout(() => setAddressCopied(false), 2000);
      } catch (error) {
        toast.error('Failed to copy address');
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleJoinWar = () => {
    onPageChange('home');
    setMobileMenuOpen(false);
    setWalletDropdownOpen(false);
    
    // Trigger country selection modal
    setTimeout(() => {
      const event = new CustomEvent('openCountrySelector');
      window.dispatchEvent(event);
    }, 100);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, alwaysVisible: true },
    { 
      id: 'arsenal', 
      label: 'Arsenal', 
      icon: Target, 
      alwaysVisible: false,
      requiresPlayer: true
    },

    { 
      id: 'pvp', 
      label: 'Battle Arena', 
      icon: Swords, 
      alwaysVisible: true,
      badge: '🔥HOT',
      badgeColor: 'from-red-500 to-purple-600'
    },

        { 
      id: 'docs', 
      label: 'Docs', 
      icon: Book, 
      alwaysVisible: true
    },
    { 
      id: 'admin', 
      label: 'Admin', 
      icon: Shield, 
      alwaysVisible: false,
      requiresDev: true
    }
  ];

  const visibleNavItems = navItems.filter(item => 
    item.alwaysVisible || 
    (item.requiresPlayer && player) ||
    (item.requiresDev && publicKey && isDevWallet(publicKey))
  );

  return (
    <>
      <nav className="bg-black/95 backdrop-blur-md border-b border-orange-500/30 sticky top-0 z-50 shadow-lg shadow-orange-500/10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={() => {
                  onPageChange('home');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1 sm:gap-2 hover:scale-105 transition-transform duration-200"
              >
                <div className="relative">
                  <NuclearLogo size={36} animated={true} />
                </div>
                <div className="text-lg sm:text-xl font-bold">
                  <span className="text-white">NUKED</span>
                  <span className="text-orange-500">WORLD</span>
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2 flex-1 justify-center">
              {visibleNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    currentPage === item.id
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                      : 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                  {item.badge && (
                    <div className={`absolute -top-2 -right-1 bg-gradient-to-r ${item.badgeColor} text-black text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1`}>
                      {item.badge}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Join War Button */}
              {connected && !player && (
                <button
                  onClick={handleJoinWar}
                  className="hidden sm:flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-green-600/30 text-xs sm:text-sm"
                >
                  <Zap size={14} />
                  <span className="hidden md:inline">Enter War</span>
                  <span className="md:hidden">Enter</span>
                </button>
              )}

              {/* Player Info (Desktop) */}
              {connected && player && playerCountry && equipment && (
                <div className="hidden lg:flex items-center gap-2 sm:gap-3 bg-slate-800/50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-colors">
                  <div className="text-xl sm:text-2xl animate-pulse">
                    <img 
                      src={`https://flagcdn.com/48x36/${playerCountry.code.toString().toLowerCase()}.png`} 
                      alt={`${playerCountry.name} flag`}
                      className="w-6 h-4 sm:w-8 sm:h-6 object-cover rounded-sm"
                    />
                  </div>
                  
                  <div className="text-left">
                    <div className="text-white font-bold text-xs sm:text-sm truncate max-w-24">{player.username}</div>
                    <div className="text-green-400 text-xs font-semibold truncate max-w-24">{playerCountry.name}</div>
                  </div>
                  
                  <div className="border-l border-gray-600 pl-2 relative">
                    <CommanderBadge 
                      player={player} 
                      size="small" 
                      showTooltip={true} 
                      variant="compact"
                      className="relative z-[60]"
                    />
                  </div>
                  
                  <div className="border-l border-gray-600 pl-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-orange-400 font-bold">{formatTokens(tokenBalance)}</div>
                        <div className="text-gray-400">$NUKED</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Compact Player Info (Tablet) */}
              {connected && player && playerCountry && equipment && (
                <div className="hidden md:flex lg:hidden items-center gap-1 sm:gap-2 bg-slate-800/50 px-2 py-1.5 rounded-lg border border-green-500/30">
                  <span className="text-lg">
                    <img 
                      src={`https://flagcdn.com/48x36/${playerCountry.code.toString().toLowerCase()}.png`} 
                      alt={`${playerCountry.name} flag`}
                      className="w-5 h-4 object-cover rounded-sm"
                    />
                  </span>
                  <div className="text-xs">
                    <div className="text-white font-semibold truncate max-w-16">{player.username}</div>
                    <div className="flex items-center gap-1">
                      <Coins size={10} className="text-orange-400" />
                      <span className="text-orange-400 font-mono text-xs">{formatTokens(tokenBalance)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-red-400">🚀{equipment.rockets}</span>
                      <span className="text-blue-400">🛡️{equipment.defense_systems}</span>
                    </div>
                  </div>
                  <div className="relative z-[60]">
                    <CommanderBadge 
                      player={player} 
                      size="small" 
                      showTooltip={false} 
                      variant="compact"
                    />
                  </div>
                </div>
              )}

              {/* Wallet Section */}
              {connected && publicKey ? (
                <div className="relative">
                  <button
                    onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                    className="flex items-center gap-1 sm:gap-2 bg-blue-600/20 hover:bg-blue-600/30 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-blue-500/30 transition-all duration-200"
                  >
                    <Wallet size={14} className="text-blue-400" />
                    <div className="text-xs hidden sm:block">
                      <div className="text-blue-400 font-semibold">Connected</div>
                      <div className="text-white font-mono text-xs">
                        {formatAddress(publicKey.toString())}
                      </div>
                    </div>
                  </button>

                  {/* Wallet Dropdown */}
                  {walletDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md rounded-lg border border-blue-500/30 shadow-xl shadow-blue-500/10 z-[70]">
                      <div className="p-3 sm:p-4">
                        <div className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Wallet size={16} className="text-blue-400" />
                          Wallet Details
                        </div>
                        
                        {/* Balances */}
                        <div className="bg-slate-800/50 rounded-lg p-3 mb-3 border border-blue-500/20">
                          <div className="text-white font-semibold mb-2 text-sm">Balances</div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="text-center">
                              <div className="text-green-400 font-bold">{solBalance.toFixed(4)}</div>
                              <div className="text-gray-400 text-xs">SOL</div>
                            </div>
                            <div className="text-center">
                              <div className="text-orange-400 font-bold">{formatTokens(tokenBalance)}</div>
                              <div className="text-gray-400 text-xs">$NUKED</div>
                            </div>
                          </div>
                          {player && equipment && (
                            <div className="grid grid-cols-2 gap-3 text-sm mt-2 pt-2 border-t border-gray-600">
                              <div className="text-center">
                                <div className="text-red-400 font-bold">{equipment.rockets}</div>
                                <div className="text-gray-400 text-xs">Rockets</div>
                              </div>
                              <div className="text-center">
                                <div className="text-blue-400 font-bold">{equipment.defense_systems}</div>
                                <div className="text-gray-400 text-xs">Defense</div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Player Info */}
                        {player && playerCountry && (
                          <div className="bg-slate-800/50 rounded-lg p-3 mb-3 border border-green-500/20">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                              <span className="text-2xl">
                                <img 
                                  src={`https://flagcdn.com/48x36/${playerCountry.code.toString().toLowerCase()}.png`} 
                                  alt={`${playerCountry.name} flag`}
                                  className="w-8 h-6 object-cover rounded-sm"
                                />
                              </span>
                              <div className="flex-1">
                                <div className="text-white font-semibold text-sm">{player.username}</div>
                                <div className="text-xs text-gray-400">{playerCountry.name}</div>
                                <div className="text-xs text-green-400">Military: {playerCountry.military_strength}/100</div>
                              </div>
                              <div className="relative z-[60]">
                                <CommanderBadge 
                                  player={player} 
                                  size="small" 
                                  showTooltip={false} 
                                  variant="compact"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Address */}
                        <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                          <div className="text-gray-400 text-xs mb-1">Wallet Address</div>
                          <div className="flex items-center gap-2">
                            <code className="text-white font-mono text-xs flex-1 break-all">
                              {publicKey.toString()}
                            </code>
                            <button
                              onClick={copyAddress}
                              className="p-1 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                            >
                              {addressCopied ? (
                                <Check size={12} className="text-green-400" />
                              ) : (
                                <Copy size={12} className="text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                          {!player && (
                            <button
                              onClick={handleJoinWar}
                              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 shadow-lg shadow-green-600/30 text-sm"
                            >
                              <Zap size={14} />
                              Enter the Nuked World
                            </button>
                          )}
                          {player && (
                            <button
                              onClick={() => {
                                onPageChange('arsenal');
                                setWalletDropdownOpen(false);
                              }}
                              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 shadow-lg shadow-orange-600/30 text-sm"
                            >
                              <Target size={14} />
                              Load Weapons
                            </button>
                          )}
                          <button
                            onClick={handleDisconnect}
                            className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-semibold py-2 px-4 rounded-lg border border-red-500/30 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <LogOut size={14} />
                            Disconnect Wallet
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <WalletMultiButton className="!bg-gradient-to-r !from-orange-600 !to-orange-700 hover:!from-orange-700 hover:!to-orange-800 !rounded-lg !font-semibold !py-1.5 !px-2 sm:!py-2 sm:!px-4 !text-xs sm:!text-sm !transition-all !duration-200 hover:!scale-105 !shadow-lg !shadow-orange-600/30" />
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-orange-500/30 bg-black/90 backdrop-blur-md">
              <div className="py-3 space-y-1">
                {visibleNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm ${
                      currentPage === item.id
                        ? 'bg-orange-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                    {item.badge && (
                      <div className={`bg-gradient-to-r ${item.badgeColor} text-black text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1`}>
                        {item.badge}
                      </div>
                    )}
                  </button>
                ))}

                {/* Mobile Join War Button */}
                {connected && !player && (
                  <div className="mx-3 mt-2">
                    <button
                      onClick={handleJoinWar}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-600/30 text-sm"
                    >
                      <Zap size={18} />
                      Enter the Nuked World
                    </button>
                  </div>
                )}

                {/* Mobile Balances */}
                {connected && (
                  <div className="mx-3 mt-3 p-3 bg-slate-800/50 rounded-lg border border-blue-500/30">
                    <div className="text-white font-semibold mb-2 text-sm">Balances</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-center">
                        <div className="text-green-400 font-bold">{solBalance.toFixed(4)}</div>
                        <div className="text-gray-400 text-xs">SOL</div>
                      </div>
                      <div className="text-center">
                        <div className="text-orange-400 font-bold">{formatTokens(tokenBalance)}</div>
                        <div className="text-gray-400 text-xs">$NUKED</div>
                      </div>
                    </div>
                    {player && equipment && (
                      <div className="grid grid-cols-2 gap-3 text-sm mt-3 pt-3 border-t border-gray-600">
                        <div className="text-center">
                          <div className="text-red-400 font-bold">{equipment.rockets}</div>
                          <div className="text-gray-400 text-xs">🚀 Rockets</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-400 font-bold">{equipment.defense_systems}</div>
                          <div className="text-gray-400 text-xs">🛡️ Defense</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Player Info */}
                {player && playerCountry && (
                  <div className="mx-3 mt-3 p-3 bg-slate-800/50 rounded-lg border border-green-500/30">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl animate-pulse">
                        <img 
                          src={`https://flagcdn.com/48x36/${playerCountry.code.toString().toLowerCase()}.png`} 
                          alt={`${playerCountry.name} flag`}
                          className="w-8 h-6 object-cover rounded-sm"
                        />
                      </span>
                      <div className="flex-1">
                        <div className="text-white font-bold text-base">{player.username}</div>
                        <div className="text-green-400 font-semibold text-sm">{playerCountry.name}</div>
                        <div className="text-xs text-gray-400">Military: {playerCountry.military_strength}/100</div>
                        {playerCountry.nuclear_capability && (
                          <div className="text-orange-400 text-xs font-semibold">☢️ Nuclear Armed</div>
                        )}
                      </div>
                      <CommanderBadge 
                        player={player} 
                        size="medium" 
                        showTooltip={false} 
                        variant="detailed"
                      />
                    </div>
                  </div>
                )}

                {/* Mobile Load Weapons Button */}
                {connected && player && (
                  <div className="mx-3 mt-2">
                    <button
                      onClick={() => {
                        onPageChange('arsenal');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 text-sm"
                    >
                      <Target size={18} />
                      Load Weapons
                    </button>
                  </div>
                )}

                {/* Mobile Disconnect Button */}
                {connected && (
                  <div className="mx-3 mt-2">
                    <button
                      onClick={handleDisconnect}
                      className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-semibold py-2 px-4 rounded-lg border border-red-500/30 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <LogOut size={14} />
                      Disconnect Wallet
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Overlay for dropdown */}
      {walletDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setWalletDropdownOpen(false)}
        />
      )}
    </>
  );
};