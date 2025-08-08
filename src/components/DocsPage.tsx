import React, { useState } from 'react';
import { 
  Book, 
  Target, 
  Trophy, 
  Users, 
  Coins, 
  Shield, 
  Sword, 
  Crown, 
  Zap, 
  Globe, 
  ChevronRight,
  ChevronDown,
  Rocket,
  Flame,
  Star,
  Award,
  TrendingUp,
  Activity,
  DollarSign,
  Lock,
  Unlock,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { BackgroundEffects } from './BackgroundEffects';

interface DocsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const DocsSection: React.FC<DocsSectionProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-gray-600/30 mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        {isOpen ? <ChevronDown className="text-gray-400" size={20} /> : <ChevronRight className="text-gray-400" size={20} />}
      </button>
      
      {isOpen && (
        <div className="p-4 pt-0 border-t border-gray-600/30">
          {children}
        </div>
      )}
    </div>
  );
};

const InfoBox: React.FC<{ type: 'info' | 'warning' | 'success' | 'error'; children: React.ReactNode }> = ({ type, children }) => {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    success: 'bg-green-500/10 border-green-500/30 text-green-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300'
  };

  const icons = {
    info: <Info size={16} />,
    warning: <AlertTriangle size={16} />,
    success: <CheckCircle size={16} />,
    error: <XCircle size={16} />
  };

  return (
    <div className={`p-3 rounded-lg border ${styles[type]} mb-4`}>
      <div className="flex items-start gap-2">
        {icons[type]}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
};

export const DocsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
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

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Book className="text-blue-500" size={48} />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-mono">
              GAME DOCUMENTATION
            </h1>
          </div>
          <p className="text-xl text-gray-300 font-mono max-w-4xl mx-auto">
            Complete guide to Nuked World - The ultimate blockchain strategy game where commanders battle for supremacy
          </p>
        </div>

        {/* Game Overview */}
        <DocsSection title="Game Overview" icon={<Globe className="text-green-400" size={24} />} defaultOpen={true}>
          <div className="space-y-4">
            <p className="text-gray-300 leading-relaxed">
              <strong className="text-white">Nuked World</strong> is a blockchain-based strategy game built on Solana where players take control of nations and engage in tactical warfare. 
              The game combines real-time strategy elements with turn-based combat, all powered by the $NUKED token economy.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
                  <Target size={18} />
                  Core Mechanics
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Choose from 26 real-world nations</li>
                  <li>• Build military arsenals with rockets and defense systems</li>
                  <li>• Engage in turn-based battles</li>
                  <li>• Earn reputation and climb military ranks</li>
                  <li>• Compete for $NUKED token prizes</li>
                </ul>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                  <Coins size={18} />
                  Token Economy
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• $NUKED tokens are burned for equipment purchases</li>
                  <li>• Entry fees create prize pools for battles</li>
                  <li>• Winners receive 95% of prize pools</li>
                  <li>• 5% dev fee supports game events</li>
                  <li>• Deflationary mechanics reduce total supply</li>
                </ul>
              </div>
            </div>
          </div>
        </DocsSection>

        {/* Getting Started */}
        <DocsSection title="Getting Started" icon={<Rocket className="text-orange-400" size={24} />}>
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">1️⃣</div>
                  <h3 className="font-bold text-orange-400 mb-2">Connect Wallet</h3>
                  <p className="text-sm text-gray-300">Connect your Solana wallet (Phantom recommended) to start playing</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">2️⃣</div>
                  <h3 className="font-bold text-green-400 mb-2">Select Nation</h3>
                  <p className="text-sm text-gray-300">Choose your country from 26 available nations, each with unique stats</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">3️⃣</div>
                  <h3 className="font-bold text-purple-400 mb-2">Build Arsenal</h3>
                  <p className="text-sm text-gray-300">Purchase rockets and defense systems to prepare for battle</p>
                </div>
              </div>
            </div>

            <InfoBox type="info">
              <strong>New Player Tip:</strong> Start by purchasing a few rockets and at least one defense system before entering battles. 
              Defense systems are crucial for survival in competitive matches.
            </InfoBox>
          </div>
        </DocsSection>

        {/* Equipment System */}
        <DocsSection title="Equipment & Arsenal" icon={<Shield className="text-blue-400" size={24} />}>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Offensive Equipment */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                  <Sword size={18} />
                  Offensive Equipment
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <h4 className="font-semibold text-white mb-2">🚀 Rockets</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• <strong>Cost:</strong> 100 $NUKED per rocket</li>
                      <li>• <strong>Usage:</strong> Consumed when attacking</li>
                      <li>• <strong>Weapons:</strong> Enable different attack types</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Available Weapons:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center bg-slate-700/20 rounded p-2">
                        <span className="text-red-400">Missile Strike</span>
                        <span className="text-gray-300">25 DMG • 1 🚀</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-700/20 rounded p-2">
                        <span className="text-orange-400">Artillery Barrage</span>
                        <span className="text-gray-300">35 DMG • 2 🚀</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-700/20 rounded p-2">
                        <span className="text-purple-400">Nuclear Strike</span>
                        <span className="text-gray-300">50 DMG • 3 🚀</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Defensive Equipment */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <Shield size={18} />
                  Defensive Equipment
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <h4 className="font-semibold text-white mb-2">🛡️ Defense Systems</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• <strong>Cost:</strong> 1,000 $NUKED per system</li>
                      <li>• <strong>Deployment:</strong> Use during your turn in battle</li>
                      <li>• <strong>Charges:</strong> Each system provides 5 defense charges</li>
                      <li>• <strong>Effectiveness:</strong> 80% chance to intercept attacks</li>
                      <li>• <strong>Damage Reduction:</strong> 30% when successful</li>
                    </ul>
                  </div>
                  
                  <InfoBox type="success">
                    <strong>Defense Strategy:</strong> Deploy defense systems early in battle to protect against incoming attacks. 
                    Each successful intercept consumes one charge but significantly reduces damage.
                  </InfoBox>
                </div>
              </div>
            </div>

            <InfoBox type="warning">
              <strong>Token Burning:</strong> All equipment purchases burn $NUKED tokens permanently, creating deflationary pressure 
              and reducing the total token supply. This makes remaining tokens more valuable over time.
            </InfoBox>
          </div>
        </DocsSection>

        {/* PvP Battle System */}
        <DocsSection title="Battle System" icon={<Sword className="text-red-400" size={24} />}>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-red-400 mb-3">Battle Overview</h3>
              <p className="text-gray-300 mb-4">
                Battles are turn-based tactical encounters where 2-8 players compete for prize pools. 
                Each player starts with 100 health points, and the last commander standing wins the entire prize pool.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Battle Creation */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2">
                  <Trophy size={18} />
                  Creating Battles
                </h3>
                
                <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entry Fee:</span>
                    <span className="text-white">500-10,000 $NUKED</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Players:</span>
                    <span className="text-white">2-8 commanders</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Turn Time:</span>
                    <span className="text-white">1-30 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prize Distribution:</span>
                    <span className="text-white">95% winner, 5% dev</span>
                  </div>
                </div>
              </div>

              {/* Battle Flow */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                  <Activity size={18} />
                  Battle Flow
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 bg-slate-700/20 rounded p-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <span className="text-gray-300">Players join and pay entry fees</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-700/20 rounded p-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <span className="text-gray-300">Battle starts when full or manually</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-700/20 rounded p-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <span className="text-gray-300">Turn-based combat begins</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-700/20 rounded p-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <span className="text-gray-300">Last player standing wins</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-700/20 rounded p-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold">5</div>
                    <span className="text-gray-300">Prize pool distributed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Turn Actions */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                <Zap size={18} />
                Available Turn Actions
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-red-400 mb-2">🎯 Attack</h4>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Select target player</li>
                    <li>• Choose weapon type</li>
                    <li>• Deal damage based on weapon</li>
                    <li>• 15% critical hit chance</li>
                    <li>• Consumes rockets</li>
                  </ul>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-400 mb-2">🛡️ Deploy Defense</h4>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Consumes 1 defense system</li>
                    <li>• Adds 5 active charges</li>
                    <li>• 80% intercept chance</li>
                    <li>• 30% damage reduction</li>
                    <li>• Automatic protection</li>
                  </ul>
                </div>
                
                <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-400 mb-2">⏭️ Pass Turn</h4>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Skip your turn</li>
                    <li>• No resource consumption</li>
                    <li>• Strategic waiting</li>
                    <li>• Auto-pass on timeout</li>
                    <li>• Advances to next player</li>
                  </ul>
                </div>
              </div>
            </div>

            <InfoBox type="info">
              <strong>Battle Strategy:</strong> Balance offensive and defensive actions. Deploy defense systems early to protect against attacks, 
              but don't forget to maintain offensive pressure. The last player with health remaining wins the entire prize pool.
            </InfoBox>
          </div>
        </DocsSection>

        {/* Rank System */}
        <DocsSection title="Military Ranks & Reputation" icon={<Crown className="text-yellow-400" size={24} />}>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-yellow-400 mb-3">Ranking System Overview</h3>
              <p className="text-gray-300">
                Players advance through military ranks based on their performance, reputation, and battle victories. 
                Higher ranks provide combat bonuses and increased reputation multipliers.
              </p>
            </div>

            {/* Rank Calculation */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                <TrendingUp size={18} />
                Rank Calculation Formula
              </h3>
              
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <code className="text-green-400 text-lg font-mono">
                  Rank Level = 1 + (Total Wins × 2) + (Reputation ÷ 50)
                </code>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-green-400 mb-2">Base Level</h4>
                  <p className="text-gray-300">Every player starts at level 1</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-400 mb-2">Victory Bonus</h4>
                  <p className="text-gray-300">+2 levels per battle victory</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-purple-400 mb-2">Reputation Bonus</h4>
                  <p className="text-gray-300">+1 level per 50 reputation points</p>
                </div>
              </div>
            </div>

            {/* Military Ranks */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2">
                <Award size={18} />
                Military Rank Progression
              </h3>
              
              <div className="grid gap-3">
                {[
                  { name: 'Recruit', levels: '1-5', icon: '🎖️', tier: 'Rookie', bonuses: 'No bonuses', color: 'text-gray-400' },
                  { name: 'Private', levels: '6-10', icon: '🥉', tier: 'Rookie', bonuses: '+2% DMG/DEF, 1.1x REP', color: 'text-yellow-600' },
                  { name: 'Corporal', levels: '11-20', icon: '🎯', tier: 'Standard', bonuses: '+5% DMG/DEF, 1.2x REP', color: 'text-green-400' },
                  { name: 'Sergeant', levels: '21-35', icon: '🥈', tier: 'Standard', bonuses: '+8% DMG/DEF, 1.3x REP', color: 'text-gray-300' },
                  { name: 'Lieutenant', levels: '36-50', icon: '🥇', tier: 'Veteran', bonuses: '+12% DMG/DEF, 1.4x REP', color: 'text-yellow-400' },
                  { name: 'Captain', levels: '51-75', icon: '⭐', tier: 'Veteran', bonuses: '+15% DMG/DEF, 1.5x REP', color: 'text-purple-400' },
                  { name: 'Major', levels: '76-100', icon: '🌟', tier: 'Elite', bonuses: '+20% DMG/DEF, 1.6x REP', color: 'text-blue-400' },
                  { name: 'Colonel', levels: '101-150', icon: '🎖️', tier: 'Elite', bonuses: '+25% DMG/DEF, 1.8x REP', color: 'text-orange-400' },
                  { name: 'General', levels: '151-200', icon: '👑', tier: 'Legendary', bonuses: '+30% DMG/DEF, 2.0x REP', color: 'text-pink-400' },
                  { name: 'Supreme Commander', levels: '201+', icon: '👑', tier: 'Legendary', bonuses: '+40% DMG/DEF, 2.5x REP', color: 'text-purple-500' }
                ].map((rank, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-700/20 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{rank.icon}</span>
                      <div>
                        <span className={`font-bold ${rank.color}`}>{rank.name}</span>
                        <span className="text-gray-400 ml-2">({rank.levels})</span>
                        <div className="text-xs text-gray-500">{rank.tier} Tier</div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-300">
                      {rank.bonuses}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reputation System */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                <Star size={18} />
                Reputation System
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-3">Reputation Gains</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between bg-green-500/10 rounded p-2">
                      <span className="text-gray-300">Battle Victory (2 players)</span>
                      <span className="text-green-400">+100 base</span>
                    </div>
                    <div className="flex justify-between bg-green-500/10 rounded p-2">
                      <span className="text-gray-300">Battle Victory (4 players)</span>
                      <span className="text-green-400">+150 base</span>
                    </div>
                    <div className="flex justify-between bg-green-500/10 rounded p-2">
                      <span className="text-gray-300">Battle Victory (8 players)</span>
                      <span className="text-green-400">+250 base</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-3">Reputation Losses</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between bg-red-500/10 rounded p-2">
                      <span className="text-gray-300">Battle Defeat (2 players)</span>
                      <span className="text-red-400">-50 base</span>
                    </div>
                    <div className="flex justify-between bg-red-500/10 rounded p-2">
                      <span className="text-gray-300">Battle Defeat (4 players)</span>
                      <span className="text-red-400">-40 base</span>
                    </div>
                    <div className="flex justify-between bg-red-500/10 rounded p-2">
                      <span className="text-gray-300">Battle Defeat (8 players)</span>
                      <span className="text-red-400">-30 base</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <InfoBox type="info">
                <strong>Rank Multiplier:</strong> All reputation gains and losses are multiplied by your current rank's reputation multiplier. 
                Higher ranks earn reputation faster but also lose more when defeated.
              </InfoBox>
            </div>
          </div>
        </DocsSection>

        {/* Token Economics */}
        <DocsSection title="Token Economics" icon={<DollarSign className="text-green-400" size={24} />}>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-green-400 mb-3">$NUKED Token Overview</h3>
              <p className="text-gray-300">
                $NUKED is the native utility token powering the Nuked World ecosystem. The token features deflationary mechanics 
                through equipment purchases and strategic prize pool distribution.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Token Utility */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2">
                  <Coins size={18} />
                  Token Utility
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <h4 className="font-semibold text-red-400 mb-2">🔥 Equipment Purchases (BURN)</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Rockets: 100 $NUKED each</li>
                      <li>• Defense Systems: 1,000 $NUKED each</li>
                      <li>• Tokens are permanently burned</li>
                      <li>• Reduces total supply</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <h4 className="font-semibold text-blue-400 mb-2">💰 Battle Entry Fees</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Transferred to reward pool wallet</li>
                      <li>• Creates prize pools for battles</li>
                      <li>• 95% goes to winner</li>
                      <li>• 5% supports development</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Economic Flow */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                  <TrendingUp size={18} />
                  Economic Flow
                </h3>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-300">Players purchase $NUKED tokens</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-300">Equipment purchases burn tokens</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-300">Battle fees create prize pools</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-300">Winners receive 95% of pools</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-300">5% supports game development</span>
                    </div>
                  </div>
                </div>
                
                <InfoBox type="success">
                  <strong>Deflationary Design:</strong> Equipment purchases permanently remove tokens from circulation, 
                  creating scarcity and potential value appreciation for remaining tokens.
                </InfoBox>
              </div>
            </div>

            {/* Wallet Information */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <Lock size={18} />
                Wallet & Security Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-400 mb-2">🏦 Reward Pool Wallet</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    All battle entry fees are transferred to the secure reward pool wallet managed by the development team.
                  </p>
                  <code className="text-xs text-green-400 break-all">
                    XVAFERQfMFcXRbhwPTyMfg3eC91YcVru14Y5KJYG32V
                  </code>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-green-400 mb-2">🔒 Security Features</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• All transactions on Solana blockchain</li>
                    <li>• Transparent prize pool management</li>
                    <li>• Automatic winner payouts</li>
                    <li>• Immutable battle records</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DocsSection>

        {/* Game Strategy */}
        <DocsSection title="Strategy Guide" icon={<Target className="text-red-400" size={24} />}>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Beginner Strategy */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                  <Star size={18} />
                  Beginner Strategy
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <h4 className="font-semibold text-white mb-2">🎯 Equipment Priority</h4>
                    <ol className="text-gray-300 space-y-1 list-decimal list-inside">
                      <li>Buy 3-5 rockets for basic attacks</li>
                      <li>Purchase 1-2 defense systems</li>
                      <li>Join smaller battles (2-4 players)</li>
                      <li>Focus on learning combat mechanics</li>
                    </ol>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <h4 className="font-semibold text-white mb-2">⚔️ Battle Tactics</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Deploy defense early in battle</li>
                      <li>• Use Missile Strikes to conserve rockets</li>
                      <li>• Target weakened opponents</li>
                      <li>• Don't waste turns passing unnecessarily</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Advanced Strategy */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                  <Crown size={18} />
                  Advanced Strategy
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <h4 className="font-semibold text-white mb-2">🧠 Psychological Warfare</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Target aggressive players first</li>
                      <li>• Form temporary alliances</li>
                      <li>• Use chat to mislead opponents</li>
                      <li>• Time your attacks strategically</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <h4 className="font-semibold text-white mb-2">💎 Resource Management</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Save Nuclear Strikes for final opponents</li>
                      <li>• Deploy multiple defense systems</li>
                      <li>• Calculate risk vs reward for each attack</li>
                      <li>• Monitor opponent equipment levels</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Country Selection */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                <Globe size={18} />
                Country Selection Guide
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-red-400 mb-2">🔥 High Military Power</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• USA (95) - Nuclear capable</li>
                    <li>• Russia (90) - Nuclear capable</li>
                    <li>• China (88) - Nuclear capable</li>
                    <li>• UK (85) - Nuclear capable</li>
                  </ul>
                  <p className="text-xs text-gray-400 mt-2">Best for aggressive playstyles</p>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-400 mb-2">⚖️ Balanced Nations</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Germany (80) - Strong economy</li>
                    <li>• Japan (78) - Advanced tech</li>
                    <li>• South Korea (76) - Defensive</li>
                    <li>• Iran (73) - Regional power</li>
                  </ul>
                  <p className="text-xs text-gray-400 mt-2">Good for strategic players</p>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-green-400 mb-2">🎯 Underdog Picks</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• New Zealand (60) - Isolated</li>
                    <li>• Denmark (62) - Small but mighty</li>
                    <li>• Uganda (55) - Surprise factor</li>
                    <li>• Greenland (45) - Ultimate underdog</li>
                  </ul>
                  <p className="text-xs text-gray-400 mt-2">High risk, high reward</p>
                </div>
              </div>
              
              <InfoBox type="info">
                <strong>Country Stats:</strong> While military strength affects the visual representation, 
                all players have equal combat capabilities in battles. Choose based on personal preference and strategy.
              </InfoBox>
            </div>
          </div>
        </DocsSection>

        {/* Technical Information */}
        <DocsSection title="Technical Information" icon={<Activity className="text-purple-400" size={24} />}>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Blockchain Details */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <Activity size={18} />
                  Blockchain Integration
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Blockchain:</span>
                    <span className="text-white">Solana</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Token Standard:</span>
                    <span className="text-white">SPL Token</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Wallet Support:</span>
                    <span className="text-white">Phantom, Solflare</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network:</span>
                    <span className="text-white">Mainnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transaction Fees:</span>
                    <span className="text-white">~$0.001 SOL</span>
                  </div>
                </div>
              </div>

              {/* Game Architecture */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <Globe size={18} />
                  Game Architecture
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Frontend:</span>
                    <span className="text-white">React + TypeScript</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Database:</span>
                    <span className="text-white">Supabase PostgreSQL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Real-time:</span>
                    <span className="text-white">WebSocket subscriptions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Maps:</span>
                    <span className="text-white">Leaflet.js</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hosting:</span>
                    <span className="text-white">Vercel/Netlify</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Contract Info */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                <Lock size={18} />
                Smart Contract & Security
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-3">Token Contract Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="bg-slate-800/50 rounded p-2">
                      <span className="text-gray-400">Token Mint:</span>
                      <code className="text-green-400 text-xs block mt-1 break-all">
                        {import.meta.env.VITE_GAME_MINT || 'Token mint address from environment'}
                      </code>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <span className="text-gray-400">Decimals:</span>
                      <span className="text-white ml-2">6</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-3">Security Features</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• All transactions verified on-chain</li>
                    <li>• No smart contract vulnerabilities</li>
                    <li>• Transparent token burning</li>
                    <li>• Immutable battle records</li>
                    <li>• Decentralized token ownership</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* API & Integration */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                <Zap size={18} />
                Performance & Optimization
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-green-400 mb-2">⚡ Real-time Updates</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Live battle synchronization</li>
                    <li>• Instant turn notifications</li>
                    <li>• Real-time health updates</li>
                    <li>• Automatic reconnection</li>
                  </ul>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-400 mb-2">🎮 Game Performance</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Optimized map rendering</li>
                    <li>• Efficient state management</li>
                    <li>• Minimal blockchain calls</li>
                    <li>• Responsive design</li>
                  </ul>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-purple-400 mb-2">📱 Mobile Support</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Touch-optimized controls</li>
                    <li>• Responsive battle interface</li>
                    <li>• Mobile wallet integration</li>
                    <li>• Offline-first design</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DocsSection>

        {/* FAQ */}
        <DocsSection title="Frequently Asked Questions" icon={<Info className="text-blue-400" size={24} />}>
          <div className="space-y-4">
            {[
              {
                q: "How do I get $NUKED tokens?",
                a: "You can purchase $NUKED tokens on decentralized exchanges like Jupiter or Raydium. The token is built on Solana and follows the SPL token standard."
              },
              {
                q: "What happens if I lose a battle?",
                a: "You lose your entry fee but gain experience and potentially some reputation (depending on battle size). Your equipment remains intact for future battles."
              },
              {
                q: "Can I change my country after selection?",
                a: "Currently, country selection is permanent per wallet. You would need to use a different wallet to select a different country."
              },
              {
                q: "How are battle winners determined?",
                a: "The last player with health remaining wins the entire prize pool. If multiple players remain when time expires, the player with the highest health wins."
              },
              {
                q: "What happens to burned tokens?",
                a: "Tokens spent on equipment are permanently burned (removed from circulation), creating deflationary pressure and potentially increasing the value of remaining tokens."
              },
              {
                q: "Can I spectate battles?",
                a: "Currently, spectating is not implemented, but it's planned for future updates. You can view battle history and results in the Arena."
              },
              {
                q: "How do defense systems work?",
                a: "Defense systems provide automatic protection. When deployed, they give you 5 charges with an 80% chance to intercept incoming attacks and reduce damage by 30%."
              },
              {
                q: "What's the maximum number of players in a battle?",
                a: "Battles can have 2-8 players. Larger battles have bigger prize pools but are more competitive and chaotic."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="text-blue-400">Q:</span>
                  {faq.q}
                </h3>
                <p className="text-gray-300 text-sm pl-6">
                  <span className="text-green-400">A:</span> {faq.a}
                </p>
              </div>
            ))}
          </div>
        </DocsSection>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-600/30">
          <p className="text-gray-400 text-sm">
            Nuked World - The Only World War That Pumps 🚀
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Better to nuke pixels than people. Get $NUKED or get conquered.
          </p>
        </div>
      </div>
    </div>
  );
};