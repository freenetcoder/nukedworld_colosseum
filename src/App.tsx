import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Toaster } from 'react-hot-toast';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { ArsenalPage } from './components/ArsenalPage';
import { PvPBattlePage } from './components/PvPBattlePage';
import { DocsPage } from './components/DocsPage';
import { AdminPage } from './components/AdminPage';
import { useGameData } from './hooks/useGameData';
import { LoadingScreen } from './components/LoadingScreen';
import { BackgroundEffects } from './components/BackgroundEffects';

function App() {
  const { connected } = useWallet();
  const { 
    player, 
    equipment,
    loading, 
    tokenBalance, 
    solBalance,
    updatePlayerRockets,
    updatePlayerDefenseSystems,
    refreshPlayerData
  } = useGameData();
  const [currentPage, setCurrentPage] = useState('home');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Listen for player registration events
  useEffect(() => {
    const handlePlayerRegistered = async () => {
      await refreshPlayerData();
      
      // Additional refresh to ensure data is loaded
      setTimeout(async () => {
        await refreshPlayerData();
      }, 1500);
    };

    window.addEventListener('playerRegistered', handlePlayerRegistered);
    return () => window.removeEventListener('playerRegistered', handlePlayerRegistered);
  }, [refreshPlayerData]);

  if (isInitialLoad) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-x-hidden">
      {/* Background Effects */}
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

      {/* Navigation */}
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        player={player}
        equipment={equipment}
        tokenBalance={tokenBalance}
        solBalance={solBalance}
      />

      {/* Main Content */}
      <main className="relative z-10">
        {currentPage === 'home' && (
          <HomePage 
            player={player} 
            loading={loading}
            onPageChange={setCurrentPage}
          />
        )}
        {currentPage === 'arsenal' && (
          <ArsenalPage 
            player={player}
            equipment={equipment}
            loading={loading}
            tokenBalance={tokenBalance}
            onPageChange={setCurrentPage}
          />
        )}
        {currentPage === 'pvp' && (
          <PvPBattlePage 
            player={player}
            loading={loading}
          />
        )}
        {currentPage === 'docs' && (
          <DocsPage />
        )}
        {currentPage === 'admin' && (
          <AdminPage />
        )}
      </main>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: '#ffffff',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            fontFamily: 'monospace',
            fontSize: '14px'
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
            style: {
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }
          },
        }}
      />
    </div>
  );
}

export default App;