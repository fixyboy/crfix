-- Create a materialized view or function for user statistics
-- This will be used for rankings and profile displays

-- Create a function to get user stats
CREATE OR REPLACE FUNCTION public.get_user_stats(user_profile_id UUID)
RETURNS TABLE (
  user_id UUID,
  total_trades BIGINT,
  total_ratings BIGINT,
  average_rating NUMERIC,
  total_closed_trades BIGINT,
  average_pnl NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS user_id,
    COUNT(DISTINCT t.id) AS total_trades,
    COUNT(DISTINCT r.id) AS total_ratings,
    COALESCE(AVG(r.rating)::NUMERIC(10, 2), 0) AS average_rating,
    COUNT(DISTINCT CASE WHEN t.status = 'Closed' THEN t.id END) AS total_closed_trades,
    COALESCE(AVG(CASE WHEN t.status = 'Closed' THEN t.pnl_percentage END)::NUMERIC(10, 4), 0) AS average_pnl
  FROM public.profiles p
  LEFT JOIN public.trades t ON t.user_id = p.id
  LEFT JOIN public.ratings r ON r.trade_id = t.id
  WHERE p.id = user_profile_id
  GROUP BY p.id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create a view for user rankings
-- This calculates a weighted score for ranking
CREATE OR REPLACE VIEW public.user_rankings AS
SELECT
  p.id AS user_id,
  p.username,
  p.avatar_url,
  COUNT(DISTINCT t.id) AS total_trades,
  COUNT(DISTINCT r.id) AS total_ratings,
  COALESCE(AVG(r.rating)::NUMERIC(10, 2), 0) AS average_rating,
  -- Weighted score: average_rating * log(total_ratings + 1) to prevent new users from ranking too high
  COALESCE(
    (AVG(r.rating)::NUMERIC * LN(COUNT(DISTINCT r.id) + 1)::NUMERIC),
    0
  ) AS rank_score,
  COUNT(DISTINCT CASE WHEN t.status = 'Closed' THEN t.id END) AS closed_trades,
  COALESCE(AVG(CASE WHEN t.status = 'Closed' THEN t.pnl_percentage END)::NUMERIC(10, 4), 0) AS average_pnl
FROM public.profiles p
LEFT JOIN public.trades t ON t.user_id = p.id
LEFT JOIN public.ratings r ON r.trade_id = t.id
GROUP BY p.id, p.username, p.avatar_url
HAVING COUNT(DISTINCT t.id) > 0  -- Only show users who have at least one trade
ORDER BY rank_score DESC, total_ratings DESC;

-- Grant access to the view
GRANT SELECT ON public.user_rankings TO anon, authenticated;

-- Create a function to get trade with average rating
CREATE OR REPLACE FUNCTION public.get_trade_with_stats(trade_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  asset_pair TEXT,
  trade_type TEXT,
  entry_price NUMERIC,
  exit_price NUMERIC,
  position_size NUMERIC,
  pnl_percentage NUMERIC,
  strategy TEXT,
  notes TEXT,
  status TEXT,
  trade_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  average_rating NUMERIC,
  total_ratings BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.user_id,
    p.username,
    p.avatar_url,
    t.asset_pair,
    t.trade_type,
    t.entry_price,
    t.exit_price,
    t.position_size,
    t.pnl_percentage,
    t.strategy,
    t.notes,
    t.status,
    t.trade_date,
    t.created_at,
    COALESCE(AVG(r.rating)::NUMERIC(10, 2), 0) AS average_rating,
    COUNT(r.id) AS total_ratings
  FROM public.trades t
  JOIN public.profiles p ON p.id = t.user_id
  LEFT JOIN public.ratings r ON r.trade_id = t.id
  WHERE t.id = trade_uuid
  GROUP BY t.id, t.user_id, p.username, p.avatar_url, t.asset_pair, t.trade_type,
           t.entry_price, t.exit_price, t.position_size, t.pnl_percentage,
           t.strategy, t.notes, t.status, t.trade_date, t.created_at;
END;
$$ LANGUAGE plpgsql STABLE;

