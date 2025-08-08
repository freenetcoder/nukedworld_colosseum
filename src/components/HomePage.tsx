import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { GamePlayer } from '../types/game';
import { CountrySelector } from './CountrySelector';
import { NewsBanner } from './NewsBanner';
import { useGameData } from '../hooks/useGameData';
import { useCountries } from '../hooks/useCountries';
import { supabase } from '../lib/supabase';
import { getTotalBurnedTokens } from '../lib/solana';
import { NuclearLogo } from './NuclearLogo';
import { 
  Zap, 
  Shield, 
  Target, 
  Globe, 
  Rocket,
  Crown,
  Swords,
  AlertTriangle,
  Play,
  Users,
  TrendingUp,
  Award,
  ChevronDown,
  ExternalLink,
  Trophy,
  Github,
  X,
  Check,
  Flame,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface HomePageProps {
  player: GamePlayer | null;
  loading: boolean;
  onPageChange: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ player, loading, onPageChange }) => {
  const { connected } = useWallet();
  const { createPlayer } = useGameData();
  const { countries, getCountryById } = useCountries();
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [username, setUsername] = useState('');
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [totalBattles, setTotalBattles] = useState<number>(0);
  const [totalPrizePools, setTotalPrizePools] = useState<number>(0);
  const [burnedTokensData, setBurnedTokensData] = useState<{
    totalBurned: number;
    currentSupply: number;
    burnPercentage: number;
  }>({
    totalBurned: 0,
    currentSupply: 0,
    burnPercentage: 0
  });
  const [loadingBurnData, setLoadingBurnData] = useState(true);

  const features = [
    {
      icon: <Target className="text-red-400" size={32} />,
      title: "Personal Arsenal",
      description: "Build your own collection of rockets and defense systems for combat"
    },
    {
      icon: <Shield className="text-blue-400" size={32} />,
      title: "Defense Systems",
      description: "Deploy personal missile defense systems to protect yourself in battles"
    },
    {
      icon: <Crown className="text-yellow-400" size={32} />,
      title: "Commander Ranks",
      description: "Rise through military ranks from Recruit to Supreme Commander with combat bonuses"
    },
    {
      icon: <Swords className="text-green-400" size={32} />,
      title: "Combat",
      description: "Challenge other commanders in turn-based tactical battles for prizes"
    }
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Load player count
        const { count: playersCount, error: playersError } = await supabase
          .from('game_players')
          .select('*', { count: 'exact', head: true });

        if (playersError) {
          console.error('Error loading player count:', playersError);
        } else {
          setPlayerCount(playersCount || 0);
        }

        // Load total battles (completed battles)
        const { count: battlesCount, error: battlesError } = await supabase
          .from('pvp_battles')
          .select('*', { count: 'exact', head: true })
          .eq('battle_status', 'completed');

        if (battlesError) {
          console.error('Error loading battles count:', battlesError);
        } else {
          setTotalBattles(battlesCount || 0);
        }

        // Load total prize pools from rewards table
        const { data: prizePoolData, error: prizePoolError } = await supabase
          .from('pvp_battle_rewards')
          .select('total_prize_pool');

        if (prizePoolError) {
          console.error('Error loading prize pools:', prizePoolError);
          setTotalPrizePools(0);
        } else {
          const totalPrizes = prizePoolData?.reduce((sum, reward) => sum + (reward.total_prize_pool || 0), 0) || 0;
          setTotalPrizePools(totalPrizes);
        }
      } catch (error) {
        console.error('Error loading statistics:', error);
      }
    };

    loadStats();
  }, []);

  // Load burned tokens data
  useEffect(() => {
    const loadBurnedTokensData = async () => {
      try {
        setLoadingBurnData(true);
        const burnData = await getTotalBurnedTokens();
        
        // Calculate burn percentage
        const initialSupply = 1000000000; // 1B tokens initial supply
        const burnPercentage = (burnData.totalBurned / initialSupply) * 100;
        
        setBurnedTokensData({
          totalBurned: burnData.totalBurned,
          currentSupply: burnData.currentSupply,
          burnPercentage: burnPercentage
        });
      } catch (error) {
        console.error('Error loading burned tokens data:', error);
        setBurnedTokensData({
          totalBurned: 0,
          currentSupply: 1000000000,
          burnPercentage: 0
        });
      } finally {
        setLoadingBurnData(false);
      }
    };

    loadBurnedTokensData();
    
    // Refresh burn data every 60 seconds
    const interval = setInterval(loadBurnedTokensData, 60000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "Active Commanders", value: formatNumber(playerCount), icon: <Users size={20} /> },
    { label: "Available Nations", value: "26", icon: <Globe size={20} /> },
    { label: "Total Battles", value: formatNumber(totalBattles), icon: <Swords size={20} /> },
    { label: "Total NUKED Paid", value: `${formatNumber(totalPrizePools)}`, icon: <Trophy size={20} /> }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Listen for country selector trigger from Navigation
  useEffect(() => {
    const handleOpenCountrySelector = () => {
      if (connected && !player) {
        setShowCountrySelector(true);
      }
    };

    window.addEventListener('openCountrySelector', handleOpenCountrySelector);
    return () => window.removeEventListener('openCountrySelector', handleOpenCountrySelector);
  }, [connected, player]);

  // Handle country selection and show confirmation popup
  const handleCountrySelect = (countryId: string) => {
    setSelectedCountry(countryId);
    setShowCountrySelector(false);
    setShowConfirmationPopup(true);
  };

  const handleCreatePlayer = async () => {
    if (!selectedCountry || !username.trim()) {
      toast.error('Please select a country and enter a username');
      return;
    }

    if (username.trim().length < 3) {
      toast.error('Username must be at least 3 characters long');
      return;
    }

    if (username.trim().length > 20) {
      toast.error('Username must be less than 20 characters');
      return;
    }

    setIsCreatingPlayer(true);
    try {
      await createPlayer(selectedCountry, username.trim());
      
      setShowConfirmationPopup(false);
      toast.success('🎖️ Welcome to the battlefield, Commander!');
      
      // Navigate to home after a short delay
      setTimeout(() => {
        onPageChange('home');
      }, 1000);
      
    } catch (error) {
      console.error('Error creating player:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create player. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsCreatingPlayer(false);
    }
  };

  const handleEnterBattlefield = () => {
    if (connected) {
      setShowCountrySelector(true);
    }
  };

  const selectedCountryData = selectedCountry ? getCountryById(selectedCountry) : null;

  return (
    <div className="min-h-screen relative">
      {/* News Banner */}
      {/* <NewsBanner /> */}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Radar Sweep Animation */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 opacity-10">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 border-2 border-green-500 rounded-full animate-ping"></div>
              <div className="absolute inset-4 border border-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-8 border border-green-500 rounded-full"></div>
              <div className="absolute top-0 left-1/2 w-1 h-32 bg-green-500 origin-bottom transform -translate-x-1/2 animate-spin" style={{ animationDuration: '4s' }}></div>
            </div>
          </div>

          {/* Floating Military Icons */}
          <div className="absolute top-20 left-10 text-red-500/20 animate-bounce" style={{ animationDelay: '0s' }}>
            <Rocket size={24} />
          </div>
          <div className="absolute top-40 right-20 text-blue-500/20 animate-bounce" style={{ animationDelay: '1s' }}>
            <Shield size={28} />
          </div>
          <div className="absolute bottom-40 left-20 text-yellow-500/20 animate-bounce" style={{ animationDelay: '2s' }}>
            <Target size={26} />
          </div>
          <div className="absolute bottom-20 right-10 text-green-500/20 animate-bounce" style={{ animationDelay: '3s' }}>
            <Crown size={30} />
          </div>
        </div>

        <div className="relative z-10 text-center max-w-6xl mx-auto">
          {/* Logo and Title */}
          <div className="mb-8 sm:mb-10">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <NuclearLogo size={120} animated={true} />
                <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              NUKED WORLD
            </h1>
            
            <div className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-2 font-mono">
              Better to nuke pixels than people
            </div>
            
            <div className="text-sm sm:text-base text-orange-400 font-semibold animate-pulse">
              ⚡ Build your arsenal • Challenge commanders • Win prizes ⚡
            </div>
          </div>

          {/* Social Links */}
          <div className="mb-8 sm:mb-12 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* X (Twitter) */}
              <a
                href="https://x.com/nukedgame"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-black/80 hover:bg-black/90 text-white font-bold py-3 px-4 rounded-lg border-2 border-gray-600/50 hover:border-gray-400 transition-all duration-200 hover:scale-105 shadow-lg shadow-black/30 backdrop-blur-md"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="hidden sm:inline text-sm font-mono">FOLLOW</span>
                <span className="sm:hidden text-xs font-mono">X</span>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/nukedworld"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-600/80 hover:bg-blue-600/90 text-white font-bold py-3 px-4 rounded-lg border-2 border-blue-500/50 hover:border-blue-400 transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-600/30 backdrop-blur-md"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span className="hidden sm:inline text-sm font-mono">JOIN</span>
                <span className="sm:hidden text-xs font-mono">TG</span>
              </a>

              {/* Pump.fun */}
              <a
                href={`https://pump.fun/coin/${import.meta.env.VITE_GAME_MINT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600/80 to-blue-600/80 hover:from-green-600/90 hover:to-blue-600/90 text-white font-bold py-3 px-4 rounded-lg border-2 border-green-500/50 hover:border-green-400 transition-all duration-200 hover:scale-105 shadow-lg shadow-green-600/30 backdrop-blur-md"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center">
                  <img src="/pumpfun.png" alt="PUMP.FUN" className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="hidden sm:inline text-sm font-mono">BUY $NUKED</span>
                <span className="sm:hidden text-xs font-mono">$NUKED</span>
              </a>

              {/* Dexscreener */}
              <a
                href={`https://dexscreener.com/solana/${import.meta.env.VITE_GAME_MINT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600/90 hover:to-pink-600/90 text-white font-bold py-3 px-4 rounded-lg border-2 border-purple-500/50 hover:border-purple-400 transition-all duration-200 hover:scale-105 shadow-lg shadow-purple-600/30 backdrop-blur-md"
              >
                <TrendingUp size={20} className="sm:w-6 sm:h-6" />
                <span className="hidden sm:inline text-sm font-mono">DEX CHART</span>
                <span className="sm:hidden text-xs font-mono">CHART</span>
              </a>
            </div>
          </div>

          {/* Feature Carousel */}
          <div className="mb-8 sm:mb-12">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-red-500/30 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                {features[currentSlide].icon}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                {features[currentSlide].title}
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                {features[currentSlide].description}
              </p>
              
              {/* Slide Indicators */}
              <div className="flex justify-center mt-6 space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-orange-500 w-6' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* $NUKED Burned Tokens Display */}
          <div className="mb-8 sm:mb-12 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-red-600/20 via-orange-500/15 to-red-600/20 backdrop-blur-md rounded-xl border border-red-500/30 p-4 sm:p-6 shadow-lg shadow-red-500/10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Flame className="text-orange-400 animate-pulse" size={24} />
                <h3 className="text-white font-bold text-lg sm:text-xl font-mono">
                  $NUKED TOKENS BURNED
                </h3>
                <Flame className="text-orange-400 animate-pulse" size={24} />
              </div>
              
              {loadingBurnData ? (
                <div className="flex items-center justify-center py-4">
                  <Activity className="animate-spin text-orange-400 mr-2" size={20} />
                  <span className="text-orange-300 font-mono">Loading burn data...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Burned */}
                  <div className="text-center bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                    <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-1 font-mono">
                      {formatNumber(burnedTokensData.totalBurned)}
                    </div>
                    <div className="text-red-300 text-sm font-semibold">Tokens Burned</div>
                    <div className="text-red-200/70 text-xs mt-1">Permanently Destroyed</div>
                  </div>

                  {/* Burn Percentage */}
                  <div className="text-center bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-1 font-mono">
                      {burnedTokensData.burnPercentage.toFixed(2)}%
                    </div>
                    <div className="text-orange-300 text-sm font-semibold">Supply Burned</div>
                    <div className="text-orange-200/70 text-xs mt-1">Deflationary Pressure</div>
                  </div>

                  {/* Current Supply */}
                  <div className="text-center bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-1 font-mono">
                      {formatNumber(burnedTokensData.currentSupply)}
                    </div>
                    <div className="text-yellow-300 text-sm font-semibold">Current Supply</div>
                    <div className="text-yellow-200/70 text-xs mt-1">Circulating Tokens</div>
                  </div>
                </div>
              )}

              {/* Burn Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-orange-300 text-sm font-semibold">Burn Progress</span>
                  <span className="text-orange-400 text-sm font-mono">
                    {burnedTokensData.burnPercentage.toFixed(3)}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-orange-500/30">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${Math.min(burnedTokensData.burnPercentage, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <p className="text-orange-200/80 text-xs">
                    Every weapon purchase burns tokens permanently • True deflationary mechanics
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 sm:mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center justify-center mb-2 text-orange-400">
                  {stat.icon}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 sm:space-y-6">
            {!connected ? (
              <div className="space-y-4">
                <div className="text-gray-300 mb-4">
                  <AlertTriangle className="inline mr-2" size={20} />
                  Connect your wallet to join the battlefield
                </div>
                <WalletMultiButton className="!bg-gradient-to-r !from-orange-600 !to-red-600 hover:!from-orange-700 hover:!to-red-700 !rounded-xl !font-bold !py-4 !px-8 !text-lg !transition-all !duration-200 hover:!scale-105 !shadow-lg !shadow-orange-600/30" />
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center space-x-3 text-orange-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400"></div>
                <span className="text-lg font-semibold">Loading battlefield status...</span>
              </div>
            ) : player ? (
              <div className="space-y-4">
                <div className="text-green-400 text-lg font-semibold">
                  🎖️ Welcome back, Commander {player.username}!
                </div>
                <div className="text-gray-400 text-sm">
                  Your personal arsenal awaits. Ready for combat?
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => onPageChange('arsenal')}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-orange-600/30 flex items-center gap-2 justify-center"
                  >
                    <Target size={20} />
                    Load Arsenal
                  </button>
                  <button
                    onClick={() => onPageChange('pvp')}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-red-600/30 flex items-center gap-2 justify-center"
                  >
                    <Swords size={20} />
                    Enter Battle Arena
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleEnterBattlefield}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-red-600/30 flex items-center gap-3 mx-auto"
                >
                  <Swords size={24} />
                  Enter War
                </button>
                <div className="text-gray-400 text-sm">
                  Choose your nation and begin your military campaign
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <a
              href="https://pump.fun/6X3eMTcxAiNtNK9vAUQ5G49Se7S7qfRDP9KSZouBpump"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
            >
              <ExternalLink size={16} />
              <span>$NUKED Token</span>
            </a>
          </div>
        </div>
      </section>

      {/* Country Selection Modal */}
      {showCountrySelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-2 border-red-500/50 shadow-2xl shadow-red-500/20 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-red-500/30 bg-gradient-to-r from-red-900/20 to-orange-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="text-red-400" size={28} />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Choose Your Nation</h2>
                    <p className="text-gray-300">Select your homeland and establish your command</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCountrySelector(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Country Selector */}
            <div className="p-6">
              <CountrySelector
                selectedCountry={selectedCountry}
                onSelect={handleCountrySelect}
              />
            </div>
          </div>
        </div>
      )}

      {/* Country Confirmation Popup */}
      {showConfirmationPopup && selectedCountryData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-2 border-green-500/50 shadow-2xl shadow-green-500/20 max-w-md w-full relative z-[201]">
            {/* Header */}
            <div className="p-6 border-b border-green-500/30 bg-gradient-to-r from-green-900/20 to-blue-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="text-green-400" size={24} />
                  <h2 className="text-xl font-bold text-white">Confirm Selection</h2>
                </div>
                <button
                  onClick={() => {
                    setShowConfirmationPopup(false);
                    setSelectedCountry('');
                    setUsername('');
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Selected Country Display */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <img 
                    src={`https://flagcdn.com/48x36/${selectedCountryData.code.toString().toLowerCase()}.png`} 
                    alt={`${selectedCountryData.name} flag`}
                    className="w-12 h-9 object-cover rounded-sm shadow-lg"
                  />
                  <div>
                    <h3 className="text-white font-bold text-lg">{selectedCountryData.name}</h3>
                    <p className="text-gray-400 text-sm">Military Strength: {selectedCountryData.military_strength}/100</p>
                    {selectedCountryData.nuclear_capability && (
                      <p className="text-orange-400 text-sm font-semibold">☢️ Nuclear Armed</p>
                    )}
                  </div>
                </div>
                <p className="text-green-400 font-semibold">✓ Selected as your homeland</p>
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Commander Callsign
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your military callsign..."
                  className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                  maxLength={20}
                  autoFocus
                />
                <div className="text-xs text-gray-400 mt-1">
                  3-20 characters, will be visible to all commanders
                </div>
              </div>

              {/* Deploy Button */}
              <button
                onClick={handleCreatePlayer}
                disabled={isCreatingPlayer || username.trim().length < 3}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 hover:scale-105 disabled:scale-100 shadow-lg shadow-green-600/30 flex items-center justify-center gap-3"
              >
                {isCreatingPlayer ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Establishing Command...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Deploy to Battlefield
                  </>
                )}
              </button>

              {/* Back Button */}
              <button
                onClick={() => {
                  setShowConfirmationPopup(false);
                  setShowCountrySelector(true);
                }}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                ← Choose Different Country
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};