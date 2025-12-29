// Database types matching Supabase schema

export type TradeType = 'Long' | 'Short';
export type TradeStatus = 'Open' | 'Closed';
export type Strategy = 'Scalp' | 'Swing' | 'Day trade';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  asset_pair: string;
  trade_type: TradeType;
  entry_price: number;
  exit_price: number | null;
  position_size: number | null;
  pnl_percentage: number | null;
  strategy: Strategy;
  notes: string | null;
  status: TradeStatus;
  trade_date: string;
  created_at: string;
  updated_at: string;
}

export interface TradeWithStats extends Trade {
  username: string;
  avatar_url: string | null;
  average_rating: number;
  total_ratings: number;
}

export interface Rating {
  id: string;
  trade_id: string;
  rater_id: string;
  rating: number; // 1-5
  created_at: string;
}

export interface UserStats {
  user_id: string;
  total_trades: number;
  total_ratings: number;
  average_rating: number;
  total_closed_trades: number;
  average_pnl: number;
}

export interface UserRanking {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_trades: number;
  total_ratings: number;
  average_rating: number;
  rank_score: number;
  closed_trades: number;
  average_pnl: number;
}

// Form types for creating/updating trades
export interface CreateTradeInput {
  asset_pair: string;
  trade_type: TradeType;
  entry_price: number;
  exit_price?: number | null;
  position_size?: number | null;
  strategy: Strategy;
  notes?: string | null;
  trade_date: string;
  status?: TradeStatus;
}

export interface UpdateTradeInput extends Partial<CreateTradeInput> {
  id: string;
}

// Form types for creating ratings
export interface CreateRatingInput {
  trade_id: string;
  rating: number; // 1-5
}

