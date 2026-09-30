import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper to convert plain username to internal email for Supabase Auth
export function usernameToEmail(username) {
  const sanitized = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '')
  return `${sanitized}@povertymovies.app`
}

// Preset avatars users can pick from
export const AVATAR_OPTIONS = [
  { id: 'popcorn', label: '🍿 Popcorn', icon: '🍿' },
  { id: 'clapper', label: '🎬 Clapper', icon: '🎬' },
  { id: 'film', label: '🎞️ Film Reel', icon: '🎞️' },
  { id: 'ninja', label: '🥷 Ninja', icon: '🥷' },
  { id: 'alien', label: '👽 Alien', icon: '👽' },
  { id: 'robot', label: '🤖 Robot', icon: '🤖' },
  { id: 'wizard', label: '🧙 Wizard', icon: '🧙' },
  { id: 'star', label: '⭐ Super Star', icon: '⭐' },
  { id: 'fire', label: '🔥 Cinephile', icon: '🔥' },
  { id: 'crown', label: '👑 Movie King', icon: '👑' },
]

export function formatWatchTime(seconds) {
  if (!seconds || seconds <= 0) return '0m'
  const totalMinutes = Math.floor(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

export function formatWatchTimeDetailed(seconds) {
  if (!seconds || seconds <= 0) return '0 hours 0 minutes'
  const totalMinutes = Math.floor(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  if (hours > 0) {
    return `${hours} hr${hours === 1 ? '' : 's'} ${mins} min${mins === 1 ? '' : 's'}`
  }
  return `${mins} minute${mins === 1 ? '' : 's'}`
}
