-- =====================================================================
-- POVERTYMOVIES: NON-DESTRUCTIVE SUPABASE MIGRATION SCRIPT
-- Safely keeps ALL existing users, watch times, and leaderboard data!
-- Copy and run this script in the Supabase Dashboard -> SQL Editor
-- =====================================================================

-- 1. Ensure profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT '🍿',
  watch_time_seconds BIGINT DEFAULT 0 CHECK (watch_time_seconds >= 0),
  active_session_id TEXT DEFAULT NULL,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add new columns safely if table already exists (keeps all previous data intact)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_session_id TEXT DEFAULT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Indexes for fast leaderboard ranking and username lookup
CREATE INDEX IF NOT EXISTS idx_profiles_watch_time 
ON public.profiles (watch_time_seconds DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON public.profiles (LOWER(username));

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Allow public read, insert, and update for seamless passwordless profiles)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create a profile" ON public.profiles;
CREATE POLICY "Anyone can create a profile" 
ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;
CREATE POLICY "Anyone can update profiles" 
ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);

-- 6. Stored Procedure (RPC) to atomically increment watch time by user ID or username
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
    last_active_at = NOW(),
    updated_at = NOW()
  WHERE id = user_id_param OR LOWER(username) = LOWER(user_id_param);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_watch_time(TEXT, INT) TO anon, authenticated, public;

-- 7. Enable Realtime updates (Safe check so it won't error if already added)
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
