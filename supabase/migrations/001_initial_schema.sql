-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create trades table
CREATE TABLE public.trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  asset_pair TEXT NOT NULL,
  trade_type TEXT NOT NULL CHECK (trade_type IN ('Long', 'Short')),
  entry_price NUMERIC(20, 8) NOT NULL,
  exit_price NUMERIC(20, 8),
  position_size NUMERIC(20, 8),
  pnl_percentage NUMERIC(10, 4),
  strategy TEXT NOT NULL CHECK (strategy IN ('Scalp', 'Swing', 'Day trade')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
  trade_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE NOT NULL,
  rater_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(trade_id, rater_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_created_at ON public.trades(created_at DESC);
CREATE INDEX idx_trades_asset_pair ON public.trades(asset_pair);
CREATE INDEX idx_trades_status ON public.trades(status);
CREATE INDEX idx_trades_trade_type ON public.trades(trade_type);
CREATE INDEX idx_trades_strategy ON public.trades(strategy);
CREATE INDEX idx_ratings_trade_id ON public.ratings(trade_id);
CREATE INDEX idx_ratings_rater_id ON public.ratings(rater_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to calculate PnL percentage
CREATE OR REPLACE FUNCTION public.calculate_pnl_percentage(
  entry_price NUMERIC,
  exit_price NUMERIC,
  trade_type TEXT
)
RETURNS NUMERIC AS $$
BEGIN
  IF exit_price IS NULL OR entry_price IS NULL THEN
    RETURN NULL;
  END IF;
  
  IF trade_type = 'Long' THEN
    RETURN ((exit_price - entry_price) / entry_price) * 100;
  ELSE -- Short
    RETURN ((entry_price - exit_price) / entry_price) * 100;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to update PnL when exit price is set
CREATE OR REPLACE FUNCTION public.update_trade_pnl()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.exit_price IS NOT NULL AND NEW.entry_price IS NOT NULL THEN
    NEW.pnl_percentage := public.calculate_pnl_percentage(
      NEW.entry_price,
      NEW.exit_price,
      NEW.trade_type
    );
  END IF;
  NEW.updated_at := TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate PnL
CREATE TRIGGER calculate_pnl_trigger
  BEFORE INSERT OR UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trade_pnl();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

