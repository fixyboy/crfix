-- Create likes table
CREATE TABLE public.likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(trade_id, user_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_likes_trade_id ON public.likes(trade_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_comments_trade_id ON public.comments(trade_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

-- Create trigger for comments updated_at
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Prevent users from liking their own trades
CREATE OR REPLACE FUNCTION public.prevent_self_like()
RETURNS TRIGGER AS $$
DECLARE
  trade_owner UUID;
BEGIN
  SELECT user_id INTO trade_owner
  FROM public.trades
  WHERE id = NEW.trade_id;
  
  IF trade_owner = NEW.user_id THEN
    RAISE EXCEPTION 'Users cannot like their own trades';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_self_like_trigger
  BEFORE INSERT OR UPDATE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_like();

-- Prevent users from commenting on their own trades (optional - remove if you want to allow it)
-- CREATE OR REPLACE FUNCTION public.prevent_self_comment()
-- RETURNS TRIGGER AS $$
-- DECLARE
--   trade_owner UUID;
-- BEGIN
--   SELECT user_id INTO trade_owner
--   FROM public.trades
--   WHERE id = NEW.trade_id;
--   
--   IF trade_owner = NEW.user_id THEN
--     RAISE EXCEPTION 'Users cannot comment on their own trades';
--   END IF;
--   
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER prevent_self_comment_trigger
--   BEFORE INSERT OR UPDATE ON public.comments
--   FOR EACH ROW
--   EXECUTE FUNCTION public.prevent_self_comment();

