-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Anyone can read profiles (public access)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (though trigger handles this)
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- TRADES POLICIES
-- ============================================

-- Anyone can read trades (public access)
CREATE POLICY "Trades are viewable by everyone"
  ON public.trades
  FOR SELECT
  USING (true);

-- Users can create trades for themselves
CREATE POLICY "Users can create their own trades"
  ON public.trades
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own trades
CREATE POLICY "Users can update their own trades"
  ON public.trades
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own trades
CREATE POLICY "Users can delete their own trades"
  ON public.trades
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RATINGS POLICIES
-- ============================================

-- Anyone can read ratings (public access)
CREATE POLICY "Ratings are viewable by everyone"
  ON public.ratings
  FOR SELECT
  USING (true);

-- Users can create ratings (but not for their own trades - enforced by app logic)
CREATE POLICY "Users can create ratings"
  ON public.ratings
  FOR INSERT
  WITH CHECK (auth.uid() = rater_id);

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
  ON public.ratings
  FOR UPDATE
  USING (auth.uid() = rater_id)
  WITH CHECK (auth.uid() = rater_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings"
  ON public.ratings
  FOR DELETE
  USING (auth.uid() = rater_id);

-- ============================================
-- ADDITIONAL CONSTRAINT: Prevent users from rating their own trades
-- ============================================

CREATE OR REPLACE FUNCTION public.prevent_self_rating()
RETURNS TRIGGER AS $$
DECLARE
  trade_owner UUID;
BEGIN
  SELECT user_id INTO trade_owner
  FROM public.trades
  WHERE id = NEW.trade_id;
  
  IF trade_owner = NEW.rater_id THEN
    RAISE EXCEPTION 'Users cannot rate their own trades';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_self_rating_trigger
  BEFORE INSERT OR UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_rating();

