import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase, isSupabaseConfigured, formatWatchTime, formatWatchTimeDetailed } from '../api/supabase'
import { useAuth } from '../context/AuthContext'

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

function getWatchTier(seconds) {
  const hours = seconds / 3600
  if (hours >= 100) return { title: 'Tuff Legend', color: '#ffb703', badge: '👑' }
  if (hours >= 50) return { title: 'Binge Master', color: '#e50914', badge: '🔥' }
  if (hours >= 20) return { title: 'Film Buff', color: '#a855f7', badge: '🎬' }
  if (hours >= 10) return { title: 'Cinema Lover', color: '#f97316', badge: '🎥' }
  if (hours >= 5) return { title: 'Casual Watcher', color: '#3b82f6', badge: '🍿' }
  if (hours >= 1) return { title: 'Movie Enthusiast', color: '#f97316', badge: '🎥' }
  return { title: 'Rookie Streamer', color: '#10b981', badge: '🌱' }
}

export default function Leaderboard() {
  const { profile, openAuthModal, isConfigured } = useAuth()
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchLeaderboard = useCallback(async () => {
    setIsRefreshing(true)
    if (!isConfigured || !supabase) {
      try {
        const stored = JSON.parse(localStorage.getItem(LOCAL_LEADERBOARD_KEY) || 'null')
        const list = stored && Array.isArray(stored) ? stored : DEFAULT_DEMO_LEADERBOARD
        
        // Ensure current user is in list with latest watch time
        if (profile) {
          const idx = list.findIndex(u => u.username.toLowerCase() === profile.username.toLowerCase())
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...profile }
          } else {
            list.push(profile)
          }
        }

        list.sort((a, b) => (b.watch_time_seconds || 0) - (a.watch_time_seconds || 0))
        setLeaders(list)
      } catch (err) {
        console.error(err)
        setLeaders(DEFAULT_DEMO_LEADERBOARD)
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, watch_time_seconds, created_at')
        .order('watch_time_seconds', { ascending: false })
        .limit(100)

      if (error) {
        console.warn('Supabase fetch error, fallback to profiles query:', error.message)
      } else if (data) {
        setLeaders(data)
      }
    } catch (err) {
      console.error('Leaderboard error:', err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [isConfigured, profile])

  useEffect(() => {
    fetchLeaderboard()

    if (isConfigured && supabase) {
      // Realtime subscription to profiles updates
      const channel = supabase
        .channel('public:profiles_leaderboard')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          fetchLeaderboard()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchLeaderboard, isConfigured])

  // If local profile watch_time updates, reflect in leaders list
  useEffect(() => {
    if (!profile) return
    setLeaders(prev => {
      const exists = prev.some(u => (u.id && u.id === profile.id) || (u.username.toLowerCase() === profile.username.toLowerCase()))
      let updated
      if (exists) {
        updated = prev.map(u => {
          if ((u.id && u.id === profile.id) || (u.username.toLowerCase() === profile.username.toLowerCase())) {
            return { ...u, watch_time_seconds: profile.watch_time_seconds }
          }
          return u
        })
      } else {
        updated = [...prev, profile]
      }
      return updated.sort((a, b) => (b.watch_time_seconds || 0) - (a.watch_time_seconds || 0))
    })
  }, [profile?.watch_time_seconds, profile])

  // Filter leaders by search query
  const filteredLeaders = useMemo(() => {
    if (!searchQuery.trim()) return leaders
    const q = searchQuery.toLowerCase().trim()
    return leaders.filter(l => l.username?.toLowerCase().includes(q))
  }, [leaders, searchQuery])

  // Calculate current user rank
  const userRankIndex = useMemo(() => {
    if (!profile || !leaders.length) return -1
    return leaders.findIndex(
      l => (l.id && l.id === profile.id) || (l.username.toLowerCase() === profile.username.toLowerCase())
    )
  }, [leaders, profile])

  const topThree = useMemo(() => {
    return leaders.slice(0, 3)
  }, [leaders])

  const nextRankUser = useMemo(() => {
    if (userRankIndex <= 0) return null
    return leaders[userRankIndex - 1]
  }, [leaders, userRankIndex])

  const secondsToNextRank = useMemo(() => {
    if (!nextRankUser || !profile) return 0
    return Math.max(0, (nextRankUser.watch_time_seconds || 0) - (profile.watch_time_seconds || 0) + 1)
  }, [nextRankUser, profile])

  return (
    <div className="leaderboard-page">
      <div className="container">
        {/* Header Banner */}
        <div className="leaderboard-header">
          <div className="leaderboard-title-group">
            <span className="leaderboard-badge">Hall of Fame</span>
            <h1 className="leaderboard-heading">Watch Time Leaderboard</h1>
            <p className="leaderboard-subheading">
              Stream your favorite movies and shows to earn watch time, level up your cinephile tier, and claim the #1 spot!
            </p>
          </div>

          <div className="leaderboard-actions-bar">
            <div className="leaderboard-search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search username..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            <button
              className="btn btn-outline refresh-btn"
              onClick={fetchLeaderboard}
              disabled={isRefreshing}
              title="Refresh Leaderboard"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={isRefreshing ? 'spin-anim' : ''}
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Supabase Notice if not configured */}
        {!isConfigured && (
          <div className="demo-banner">
            <div className="demo-banner-content">
              <strong>💡 Supabase Integration Ready:</strong>
              <span>
                Add your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file to enable live multi-user cloud syncing.
              </span>
            </div>
          </div>
        )}

        {/* Current User Status / Call To Action Card */}
        <div className="user-status-card">
          {profile ? (
            <div className="user-status-logged-in">
              <div className="user-status-avatar">{profile.avatar_url || '🍿'}</div>
              <div className="user-status-details">
                <div className="user-status-name-row">
                  <span className="user-status-name">@{profile.username}</span>
                  {userRankIndex !== -1 && (
                    <span className="user-rank-pill">
                      Rank #{userRankIndex + 1}
                    </span>
                  )}
                  {(() => {
                    const tier = getWatchTier(profile.watch_time_seconds || 0)
                    return (
                      <span className="user-tier-pill" style={{ borderColor: tier.color, color: tier.color }}>
                        {tier.badge} {tier.title}
                      </span>
                    )
                  })()}
                </div>
                <p className="user-status-time">
                  Total Watch Time: <strong>{formatWatchTimeDetailed(profile.watch_time_seconds || 0)}</strong>
                </p>
              </div>

              {nextRankUser && secondsToNextRank > 0 && (
                <div className="user-status-progress-box">
                  <span className="progress-label">
                    Watch <strong>{formatWatchTime(secondsToNextRank)}</strong> more to overtake <strong>@{nextRankUser.username}</strong> (#{userRankIndex})
                  </span>
                  <div className="mini-progress-bar">
                    <div
                      className="mini-progress-fill"
                      style={{
                        width: `${Math.min(100, Math.round(((profile.watch_time_seconds || 0) / (nextRankUser.watch_time_seconds || 1)) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="user-status-unauthenticated">
              <div className="unauth-text">
                <h3>Track Your Watch Time & Join the Rankings</h3>
                <p>Sign in with a username to compete with other movie lovers.</p>
              </div>
              <div className="unauth-actions">
                <button className="btn btn-primary" onClick={() => openAuthModal('signup')}>
                  Create Username
                </button>
                <button className="btn btn-outline" onClick={() => openAuthModal('signin')}>
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TOP 3 PODIUM (Visible when no search active and at least 3 leaders exist) */}
        {!searchQuery && topThree.length >= 3 && (
          <div className="podium-container">
            {/* 2nd Place */}
            <div className="podium-card podium-silver">
              <div className="podium-rank-badge">🥈 #2</div>
              <div className="podium-avatar">{topThree[1].avatar_url || '🍿'}</div>
              <h3 className="podium-username">@{topThree[1].username}</h3>
              <span className="podium-time">{formatWatchTime(topThree[1].watch_time_seconds)}</span>
              <span className="podium-tier">{getWatchTier(topThree[1].watch_time_seconds).title}</span>
              <div className="podium-pedestal silver-pedestal">2</div>
            </div>

            {/* 1st Place */}
            <div className="podium-card podium-gold">
              <div className="gold-crown-icon">👑</div>
              <div className="podium-rank-badge">🥇 #1 Champion</div>
              <div className="podium-avatar gold-glow">{topThree[0].avatar_url || '👑'}</div>
              <h3 className="podium-username gold-text">@{topThree[0].username}</h3>
              <span className="podium-time gold-time">{formatWatchTime(topThree[0].watch_time_seconds)}</span>
              <span className="podium-tier">{getWatchTier(topThree[0].watch_time_seconds).title}</span>
              <div className="podium-pedestal gold-pedestal">1</div>
            </div>

            {/* 3rd Place */}
            <div className="podium-card podium-bronze">
              <div className="podium-rank-badge">🥉 #3</div>
              <div className="podium-avatar">{topThree[2].avatar_url || '🍿'}</div>
              <h3 className="podium-username">@{topThree[2].username}</h3>
              <span className="podium-time">{formatWatchTime(topThree[2].watch_time_seconds)}</span>
              <span className="podium-tier">{getWatchTier(topThree[2].watch_time_seconds).title}</span>
              <div className="podium-pedestal bronze-pedestal">3</div>
            </div>
          </div>
        )}

        {/* FULL RANKINGS LIST */}
        <div className="leaderboard-table-section">
          <div className="leaderboard-table-header-row">
            <span className="col-rank">Rank</span>
            <span className="col-user">Streamer</span>
            <span className="col-tier">Tier</span>
            <span className="col-time">Watch Time</span>
          </div>

          {loading ? (
            <div className="spinner-wrap" style={{ minHeight: '200px' }}>
              <div className="spinner" />
            </div>
          ) : filteredLeaders.length === 0 ? (
            <div className="leaderboard-empty">
              <p>No streamers found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="leaderboard-rows">
              {filteredLeaders.map((streamer, index) => {
                const rank = index + 1
                const isCurrentUser = profile && (
                  (streamer.id && streamer.id === profile.id) ||
                  (streamer.username.toLowerCase() === profile.username.toLowerCase())
                )
                const tier = getWatchTier(streamer.watch_time_seconds || 0)

                return (
                  <div
                    key={streamer.id || streamer.username}
                    className={`leaderboard-row ${isCurrentUser ? 'current-user-row' : ''} ${
                      rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : ''
                    }`}
                  >
                    <div className="col-rank">
                      <span className="rank-number">
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                      </span>
                    </div>

                    <div className="col-user">
                      <div className="streamer-avatar">{streamer.avatar_url || '🍿'}</div>
                      <div className="streamer-info">
                        <span className="streamer-username">
                          @{streamer.username}
                          {isCurrentUser && <span className="you-pill">YOU</span>}
                        </span>
                      </div>
                    </div>

                    <div className="col-tier">
                      <span className="tier-tag" style={{ color: tier.color, borderColor: `${tier.color}40`, backgroundColor: `${tier.color}15` }}>
                        {tier.badge} {tier.title}
                      </span>
                    </div>

                    <div className="col-time">
                      <span className="time-badge">
                        {formatWatchTime(streamer.watch_time_seconds || 0)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
