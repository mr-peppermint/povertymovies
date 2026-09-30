import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '../api/supabase'

const AuthContext = createContext(null)

const LOCAL_STORAGE_PROFILE_KEY = 'pm_user_profile'
const LOCAL_LEADERBOARD_KEY = 'pm_demo_leaderboard'

const DEFAULT_DEMO_LEADERBOARD = [
  { id: 'u1', username: 'CineMaster99', avatar_url: '👑', watch_time_seconds: 524000, created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'u2', username: 'MovieBuff_Dan', avatar_url: '🍿', watch_time_seconds: 412000, created_at: new Date(Date.now() - 25 * 86400000).toISOString() },
  { id: 'u3', username: 'SciFi_Sarah', avatar_url: '👽', watch_time_seconds: 368000, created_at: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: 'u4', username: 'RetroViewer', avatar_url: '🎞️', watch_time_seconds: 284000, created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: 'u5', username: 'PopcornAddict', avatar_url: '🔥', watch_time_seconds: 215000, created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'u6', username: 'MidnightWatcher', avatar_url: '🥷', watch_time_seconds: 162000, created_at: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: 'u7', username: 'AnimeFanatic', avatar_url: '🤖', watch_time_seconds: 98000, created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'u8', username: 'FilmWizard', avatar_url: '🧙', watch_time_seconds: 45000, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
]

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('signup') // 'signup' | 'signin'

  const profileRef = useRef(null)
  profileRef.current = profile

  // Refresh profile from Supabase on mount
  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !profileRef.current?.username) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', profileRef.current.username)
        .maybeSingle()

      if (!error && data) {
        setProfile(data)
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(data))
      }
    } catch (err) {
      console.warn('Error refreshing profile:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshProfile()
  }, [refreshProfile])

  // Create New Username (Passwordless)
  const createUsername = async ({ username, avatarUrl = '🍿' }) => {
    const cleanUsername = username.trim()
    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error('Username must be at least 3 characters long.')
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      throw new Error('Username can only contain letters, numbers, underscores, and dashes.')
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      const newProfile = {
        id: 'user_' + Date.now(),
        username: cleanUsername,
        avatar_url: avatarUrl,
        watch_time_seconds: 0,
        created_at: new Date().toISOString()
      }
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(newProfile))
      setProfile(newProfile)

      // Add to local demo leaderboard
      try {
        const storedBoard = JSON.parse(localStorage.getItem(LOCAL_LEADERBOARD_KEY) || 'null') || DEFAULT_DEMO_LEADERBOARD
        const exists = storedBoard.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase())
        if (!exists) {
          const updatedBoard = [newProfile, ...storedBoard]
          localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(updatedBoard))
        }
      } catch (e) {
        console.error(e)
      }

      setAuthModalOpen(false)
      return newProfile
    }

    // Check if username already exists in Supabase
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', cleanUsername)
        .maybeSingle()

      if (existing) {
        throw new Error(`Username "${cleanUsername}" is already taken. Click "Already have a username" below to log in!`)
      }
    } catch (err) {
      if (err.message && err.message.includes('already taken')) {
        throw err
      }
      console.warn('Profiles check:', err)
    }

    const newProfile = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      username: cleanUsername,
      avatar_url: avatarUrl,
      watch_time_seconds: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single()

    if (error) {
      // If table doesn't exist yet, give friendly advice
      if (error.code === '42P01') {
        throw new Error('Database table not created yet! Please run the SQL script in your Supabase SQL Editor.')
      }
      throw new Error(error.message || 'Failed to create username.')
    }

    const savedProfile = data || newProfile
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(savedProfile))
    setProfile(savedProfile)
    setAuthModalOpen(false)
    return savedProfile
  }

  // Log In With Existing Username (Passwordless)
  const loginWithUsername = async (username) => {
    const cleanUsername = username.trim()
    if (!cleanUsername) {
      throw new Error('Please enter your username.')
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      const saved = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.username.toLowerCase() === cleanUsername.toLowerCase()) {
          setProfile(parsed)
          setAuthModalOpen(false)
          return parsed
        }
      }

      const demoUser = {
        id: 'user_' + cleanUsername.toLowerCase(),
        username: cleanUsername,
        avatar_url: '🍿',
        watch_time_seconds: 0,
        created_at: new Date().toISOString()
      }
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(demoUser))
      setProfile(demoUser)
      setAuthModalOpen(false)
      return demoUser
    }

    // Lookup profile in Supabase
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', cleanUsername)
      .maybeSingle()

    if (error) {
      throw new Error(error.message || 'Error searching for username.')
    }

    if (!data) {
      throw new Error(`Username "${cleanUsername}" was not found. Please click "Create New Username" to get started!`)
    }

    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(data))
    setProfile(data)
    setAuthModalOpen(false)
    return data
  }

  // Sign Out
  const signOut = () => {
    localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY)
    setProfile(null)
  }

  // Add Watch Time (Increment)
  const addWatchTime = useCallback(async (secondsToAdd) => {
    if (!secondsToAdd || secondsToAdd <= 0 || !profileRef.current) return

    const currentProfile = profileRef.current
    const updatedSeconds = (currentProfile.watch_time_seconds || 0) + secondsToAdd
    const updatedProfile = { ...currentProfile, watch_time_seconds: updatedSeconds }

    // Optimistic state and local storage update
    setProfile(updatedProfile)
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updatedProfile))

    if (!isSupabaseConfigured || !supabase) {
      // Update demo leaderboard
      try {
        const storedBoard = JSON.parse(localStorage.getItem(LOCAL_LEADERBOARD_KEY) || 'null') || DEFAULT_DEMO_LEADERBOARD
        const idx = storedBoard.findIndex(u => u.username.toLowerCase() === updatedProfile.username.toLowerCase())
        if (idx >= 0) {
          storedBoard[idx].watch_time_seconds = updatedSeconds
        } else {
          storedBoard.push(updatedProfile)
        }
        localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(storedBoard))
      } catch (e) {
        console.error(e)
      }
      return
    }

    // Sync to Supabase
    try {
      const { error: rpcError } = await supabase.rpc('increment_watch_time', {
        user_id_param: currentProfile.id || currentProfile.username,
        seconds_to_add: secondsToAdd
      })

      if (rpcError) {
        // Fallback direct update
        await supabase
          .from('profiles')
          .update({
            watch_time_seconds: updatedSeconds,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentProfile.id)
      }
    } catch (err) {
      console.warn('Failed to sync watch time to Supabase:', err)
    }
  }, [])

  const openAuthModal = (mode = 'signup') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setAuthModalOpen(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user: profile,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        createUsername,
        loginWithUsername,
        signOut,
        addWatchTime,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
