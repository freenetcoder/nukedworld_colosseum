export interface Country {
  id: string;
  name: string;
  code: string;
  code_initial: string;
  flag: string;
  population: number;
  gdp: number;
  military_strength: number;
  nuclear_capability: boolean;
  x: number;
  y: number;
  display_order: number;
  created_at: string;
}

export interface GamePlayer {
  id: string;
  wallet_address: string;
  username: string;
  selected_country_id: string;
  nuked_balance: number;
  sol_balance: number;
  reputation: number;
  rank_level: number;
  total_wins: number;
  total_losses: number;
  total_matches: number;
  created_at: string;
  last_active: string;
}

export interface PlayerEquipment {
  id: string;
  player_id: string;
  rockets: number;
  rocket_damage_multiplier: number;
  defense_systems: number;
  defense_charges: number;
  defense_effectiveness: number;
  special_abilities: string[];
  updated_at: string;
}

export interface PlayerStats {
  id: string;
  player_id: string;
  total_damage_dealt: number;
  total_damage_taken: number;
  total_rockets_fired: number;
  total_attacks_blocked: number;
  total_tokens_spent: number;
  total_tokens_earned: number;
  longest_win_streak: number;
  current_win_streak: number;
  highest_rank_achieved: number;
  updated_at: string;
}

// PvP Battle Types
export interface PvPBattle {
  id: string;
  battle_name: string;
  creator_id: string;
  creator_username: string;
  battle_type: 'health_based';
  max_participants: number;
  current_participants: number;
  entry_fee: number;
  total_prize_pool: number;
  battle_status: 'waiting_for_players' | 'starting' | 'in_progress' | 'completed' | 'cancelled';
  turn_time_limit: number; // seconds
  current_turn_player_id?: string;
  turn_number: number;
  winner_id?: string;
  max_rank?: number;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  last_activity: string;
  battle_settings: {
    allow_spectators: boolean;
    enable_chat: boolean;
    auto_start: boolean;
  };
  participants?: PvPBattleParticipant[];
}

export interface PvPBattleParticipant {
  id: string;
  battle_id: string;
  player_id: string;
  username: string;
  country_id: string;
  country_name: string;
  join_order: number;
  current_health: number;
  max_health: number;
  total_damage_dealt: number;
  total_damage_taken: number;
  turns_taken: number;
  is_eliminated: boolean;
  elimination_turn?: number;
  entry_fee_paid: number;
  transaction_signature: string;
  joined_at: string;
  last_action_at?: string;
}

export interface PvPBattleTurn {
  id: string;
  battle_id: string;
  turn_number: number;
  player_id: string;
  username: string;
  action_type: 'attack' | 'defend' | 'pass' | 'special_ability';
  target_player_id?: string;
  target_country_id?: string;
  weapon_used: string;
  damage_dealt: number;
  special_effects: any;
  action_details: any;
  turn_start_time: string;
  turn_end_time: string;
  is_completed: boolean;
}

export interface PvPBattleHistory {
  id: string;
  battle_name: string;
  creator_username: string;
  battle_type: string;
  max_participants: number;
  total_prize_pool: number;
  winner_id?: string;
  max_rank?: number;
  winner_username?: string;
  winner_country?: string;
  battle_duration_minutes?: number;
  reputation_bonus?: number;
  ended_at: string;
}

export interface PvPBattleReward {
  id: string;
  battle_id: string;
  winner_id: string;
  winner_username: string;
  total_prize_pool: number;
  entry_fees_collected: number;
  dev_fee: number;
  winner_payout: number;
  reputation_bonus: number;
  payout_status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

// Extended interfaces with joined data
export interface GamePlayerWithCountry extends GamePlayer {
  country?: Country;
}

export interface PlayerWithEquipment extends GamePlayer {
  equipment?: PlayerEquipment;
  stats?: PlayerStats;
  country?: Country;
}

// PvP Combat calculation types
export interface PvPAttackResult {
  success: boolean;
  damage_dealt: number;
  damage_blocked: number;
  target_health_remaining: number;
  is_critical_hit: boolean;
  message: string;
  charges_used?: number;
  intercepted?: boolean;
}

// Rank system
export interface PlayerRank {
  id: string;
  name: string;
  minLevel: number;
  maxLevel: number;
  icon: string;
  color: string;
  description: string;
  badge: string;
  tier: 'legendary' | 'elite' | 'veteran' | 'standard' | 'rookie';
  bonuses: {
    damageBonus: number;
    defenseBonus: number;
    reputationMultiplier: number;
  };
}