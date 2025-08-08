import React, { useState, useEffect } from 'react';
import { NuclearLogo } from './NuclearLogo';

export const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  const loadingMessages = [
    "🚀 Initializing systems...",
    "🛡️ Loading defenses...",
    "🌍 Scanning battlefield...",
    "⚡ Establishing connection...",
    "💥 Preparing for combat..."
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 3;
      });
    }, 50);

    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % loadingMessages.length);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center z-50">
      {/* Simplified Background - no complex animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="mb-8">
          <div className="relative inline-block">
            <NuclearLogo size={80} animated={false} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
          NUKED WORLD
        </h1>
        <div className="text-orange-400 font-mono text-sm mb-8">
          MILITARY COMMAND SYSTEM
        </div>

        {/* Loading Message */}
        <div className="mb-6 h-6">
          <div className="text-white font-mono text-sm">
            {loadingMessages[currentMessage]}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-3 mb-4 overflow-hidden border border-red-500/30">
          <div 
            className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="text-orange-400 font-mono text-xs">
          {progress}% COMPLETE
        </div>
      </div>
    </div>
  );
};