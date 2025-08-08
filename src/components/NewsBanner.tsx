import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Calendar, Zap } from 'lucide-react';

interface NewsItem {
  id: string;
  date: string;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
  icon?: React.ReactNode;
}

const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'simplified-game',
    date: 'Jul 10',
    title: 'Nuked World Simplified - Back to Core Warfare',
    description: 'Game simplified to focus on pure strategic combat. Classic rocket vs defense gameplay with commander ranks and PvP battles.',
    icon: <Zap className="text-yellow-400" size={16} />
  },
  {
    id: 'pvp-arena',
    date: 'Jun 29',
    title: 'PvP Arena Now Live',
    description: 'Challenge other commanders in turn-based tactical battles. Winner takes all the prize pool and gains massive reputation!',
    icon: <Zap className="text-yellow-400" size={16} />
  }
];

export const NewsBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    // Check if user has dismissed the news banner
    const dismissed = localStorage.getItem('newsBannerDismissed');
    const lastDismissedVersion = localStorage.getItem('newsBannerVersion');
    const currentVersion = '1.4'; // Updated version for simplified game

    if (!dismissed || lastDismissedVersion !== currentVersion) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!isVisible || NEWS_ITEMS.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % NEWS_ITEMS.length);
    }, 10000); // Change news every 10 seconds

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('newsBannerDismissed', 'true');
    localStorage.setItem('newsBannerVersion', '1.4'); // Updated version
  };

  if (!isVisible) return null;

  const currentNews = NEWS_ITEMS[currentNewsIndex];

  return (
    <div className="relative bg-gradient-to-r from-green-600/20 via-green-500/15 to-green-600/20 backdrop-blur-sm border-b border-green-500/30 shadow-lg shadow-green-500/10">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* News Content */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            {/* News Icon */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                {currentNews.icon || <Calendar className="text-green-400" size={16} />}
              </div>
            </div>

            {/* News Text */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-300 text-xs font-mono hidden sm:inline">
                    {currentNews.date}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm sm:text-base truncate">
                    {currentNews.title}
                  </h3>
                  <p className="text-green-100 text-xs sm:text-sm opacity-90 line-clamp-1 sm:line-clamp-none">
                    {currentNews.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Link */}
            {currentNews.link && (
              <div className="flex-shrink-0 hidden sm:block">
                <a
                  href={currentNews.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600/30 hover:bg-green-600/40 text-green-300 hover:text-green-200 font-semibold py-2 px-4 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all duration-200 text-sm"
                >
                  <span>{currentNews.linkText}</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>

          {/* Mobile Action Link */}
          {currentNews.link && (
            <div className="flex-shrink-0 sm:hidden ml-2">
              <a
                href={currentNews.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-green-600/30 hover:bg-green-600/40 text-green-300 hover:text-green-200 font-semibold py-1.5 px-3 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all duration-200 text-xs"
              >
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-2 sm:ml-4 p-1.5 sm:p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all duration-200 group"
            title="Dismiss news"
          >
            <X size={16} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* News Indicators */}
        {NEWS_ITEMS.length > 1 && (
          <div className="flex justify-center pb-2">
            <div className="flex gap-1">
              {NEWS_ITEMS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentNewsIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentNewsIndex 
                      ? 'bg-green-400 w-4' 
                      : 'bg-green-600/50 hover:bg-green-500/70'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Animated border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-50"></div>
    </div>
  );
};