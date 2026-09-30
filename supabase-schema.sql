-- =====================================================================
-- POVERTYMOVIES: PASSWORDLESS SUPABASE DATABASE SETUP SCRIPT
-- Copy and run this script in the Supabase Dashboard -> SQL Editor
-- =====================================================================

-- 1. Reset profiles table to ensure clean passwordless schema
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT '🍿',
  watch_time_seconds BIGINT DEFAULT 0 CHECK (watch_time_seconds >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for fast leaderboard ranking and username lookup
CREATE INDEX IF NOT EXISTS idx_profiles_watch_time 
ON public.profiles (watch_time_seconds DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON public.profiles (LOWER(username));

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (Allow public read, insert, and update for seamless passwordless profiles)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create a profile" ON public.profiles;
CREATE POLICY "Anyone can create a profile" 
ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;
CREATE POLICY "Anyone can update profiles" 
ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);

-- 5. Stored Procedure (RPC) to atomically increment watch time by user ID or username
CREATE OR REPLACE FUNCTION public.increment_watch_time(user_id_param TEXT, seconds_to_add INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF seconds_to_add <= 0 OR seconds_to_add > 600 THEN
    RAISE EXCEPTION 'Invalid watch time increment';
  END IF;

  UPDATE public.profiles
  SET 
    watch_time_seconds = COALESCE(watch_time_seconds, 0) + seconds_to_add,
    updated_at = NOW()
  WHERE id = user_id_param OR LOWER(username) = LOWER(user_id_param);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_watch_time(TEXT, INT) TO anon, authenticated, public;

-- 6. Enable Realtime updates (Safe check so it won't error if already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;

