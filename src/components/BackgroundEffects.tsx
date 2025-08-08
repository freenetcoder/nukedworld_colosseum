import React from 'react';

export const BackgroundEffects: React.FC = () => {
  return (
    <>
      {/* Simplified Background Gradient - reduced complexity */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-orange-900/10" />
      </div>



      {/* Minimal Floating Elements - reduced count */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-0 w-1 h-6 bg-gradient-to-t from-red-500/20 to-orange-500/20 rounded-full opacity-10 animate-bounce"
             style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/2 right-0 w-1 h-6 bg-gradient-to-t from-blue-500/20 to-cyan-500/20 rounded-full opacity-10 animate-bounce"
             style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>

      {/* Simplified Scanning Lines */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent animate-pulse"
             style={{ animationDelay: '3s' }} />
      </div>

      {/* Reduced Particle System - much fewer particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-orange-400/20 rounded-full opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${6 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 6}s`
            }}
          />
        ))}
      </div>

      {/* Optimized CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg); 
              opacity: 0.1;
            }
            50% { 
              transform: translateY(-20px) rotate(180deg); 
              opacity: 0.05;
            }
          }
        `
      }} />
    </>
  );
};