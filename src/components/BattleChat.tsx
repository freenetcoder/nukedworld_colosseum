import React, { useState, useRef, useEffect } from 'react';
import { GamePlayer, PvPBattleTurn } from '../types/game';
import { 
  MessageCircle, 
  Send, 
  Sword, 
  Shield, 
  SkipForward, 
  Crown,
  Target,
  Zap,
  Clock,
  Activity
} from 'lucide-react';

interface BattleChatProps {
  battleId: string;
  turns: PvPBattleTurn[];
  currentPlayer: GamePlayer | null;
}

export const BattleChat: React.FC<BattleChatProps> = ({
  battleId,
  turns,
  currentPlayer
}) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [turns, chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentPlayer) return;

    // Add message to local state (in real implementation, this would go to database)
    const newMessage = {
      id: Date.now().toString(),
      player_id: currentPlayer.id,
      username: currentPlayer.username,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      type: 'chat'
    };

    setChatMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'attack': return <Sword className="text-red-400" size={14} />;
      case 'defend': return <Shield className="text-blue-400" size={14} />;
      case 'pass': return <SkipForward className="text-gray-400" size={14} />;
      case 'special_ability': return <Zap className="text-purple-400" size={14} />;
      default: return <Target className="text-orange-400" size={14} />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTurnMessage = (turn: PvPBattleTurn) => {
    switch (turn.action_type) {
      case 'attack':
        return `attacked with ${turn.weapon_used} dealing ${Math.round(turn.damage_dealt)} damage`;
      case 'defend':
        return 'took a defensive stance';
      case 'pass':
        return 'passed their turn';
      case 'special_ability':
        return 'used a special ability';
      default:
        return 'performed an action';
    }
  };

  // Combine turns and chat messages, sorted by timestamp
  const allMessages = [
    ...turns.map(turn => ({
      ...turn,
      type: 'turn',
      timestamp: turn.turn_start_time
    })),
    ...chatMessages
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="h-full flex flex-col bg-black/50 min-h-0 max-h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 sm:space-y-2 min-h-0 max-h-full">
        {allMessages.length === 0 ? (
          <div className="text-center text-gray-400 py-4 sm:py-8">
            <Activity size={24} className="sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs sm:text-sm">Battle actions will appear here</p>
          </div>
        ) : (
          allMessages.slice(-50).map((item, index) => ( // Limit to last 50 messages for performance
            <div key={`${item.type}-${item.id || index}`} className="space-y-0.5 sm:space-y-1">
              {item.type === 'turn' ? (
                // Turn action message
                <div className="bg-slate-800/50 rounded p-1.5 sm:p-2 border-l-2 border-orange-500/50">
                  <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                    {getActionIcon(item.action_type)}
                    <span className="text-white font-semibold text-xs truncate max-w-20 sm:max-w-none">{item.username}</span>
                    <span className="text-gray-400 text-xs hidden sm:inline">Turn #{item.turn_number}</span>
                    <span className="text-gray-500 text-xs ml-auto">{formatTime(item.timestamp)}</span>
                  </div>
                  <p className="text-gray-300 text-xs leading-tight">
                    {formatTurnMessage(item as PvPBattleTurn)}
                  </p>
                  {item.damage_dealt > 0 && (
                    <div className="mt-0.5 sm:mt-1 text-red-400 text-xs font-semibold">
                      💥 {Math.round(item.damage_dealt)} damage dealt
                    </div>
                  )}
                </div>
              ) : (
                // Chat message
                <div className="bg-slate-700/50 rounded p-1.5 sm:p-2">
                  <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                    <Crown className="text-yellow-400" size={10} />
                    <span className="text-white font-semibold text-xs truncate max-w-20 sm:max-w-none">{item.username}</span>
                    <span className="text-gray-500 text-xs ml-auto">{formatTime(item.timestamp)}</span>
                  </div>
                  <p className="text-gray-300 text-xs leading-tight break-words">{item.message}</p>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-2 mb-2 sm:p-3 border-t border-gray-700/50 bg-black/30 flex-shrink-0 safe-area-inset-bottom">
        <form onSubmit={handleSendMessage} className="flex gap-1 sm:gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-2 py-1 sm:py-1.5 bg-slate-800/80 border border-gray-600/50 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none text-xs touch-manipulation"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-1 sm:p-1.5 rounded transition-colors flex-shrink-0 touch-manipulation"
          >
            <Send size={10} className="sm:w-3 sm:h-3" />
          </button>
        </form>
        <div className="text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
          Press Enter to send • Max 200 characters
        </div>
      </div>
    </div>
  );
};