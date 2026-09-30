import { useState, useRef, useEffect } from 'react'
import { useWatchTracker } from '../hooks/useWatchTracker'
import { useAuth } from '../context/AuthContext'
import { formatWatchTime } from '../api/supabase'

const SERVERS = [
  { id: 'vidsrc_me', name: 'Server 1 (VidSrc)' },
  { id: 'vidsrc_to', name: 'Server 2 (VidSrc.to)' },
  { id: 'vidsrc_cc', name: 'Server 3 (VidSrc.cc)' },
  { id: 'vidsrc_xyz', name: 'Server 4 (VidSrc.xyz)' },
]

function getEmbedUrl(serverId, tmdbId, type, season, episode, fallbackSrc) {
  if (!tmdbId) return fallbackSrc

  if (type === 'tv') {
    switch (serverId) {
      case 'vidsrc_to':
        return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`
      case 'vidsrc_cc':
        return `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`
      case 'vidsrc_xyz':
        return `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`
      case 'vidsrc_me':
      default:
        return `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`
    }
  }

  // Movie
  switch (serverId) {
    case 'vidsrc_to':
      return `https://vidsrc.to/embed/movie/${tmdbId}`
    case 'vidsrc_cc':
      return `https://vidsrc.cc/v2/embed/movie/${tmdbId}`
    case 'vidsrc_xyz':
      return `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`
    case 'vidsrc_me':
    default:
      return `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`
  }
}

export default function VideoPlayer({
  src,
  tmdbId,
  type = 'movie',
  season = 1,
  episode = 1,
  title = 'Video Player'
}) {
  const [selectedServer, setSelectedServer] = useState('vidsrc_me')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const playerWrapperRef = useRef(null)

  const { user, profile, openAuthModal } = useAuth()
  const { sessionSeconds, isTracking, isTabActive } = useWatchTracker(true)

  const activeSrc = getEmbedUrl(selectedServer, tmdbId, type, season, episode, src)

  useEffect(() => {
    function handleFullscreenChange() {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      )
      setIsFullscreen(isFull)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  function toggleFullscreen() {
    const el = playerWrapperRef.current
    if (!el) return

    if (!isFullscreen) {
      if (el.requestFullscreen) {
        el.requestFullscreen()
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen()
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
    }
  }

  if (!activeSrc) return null

  return (
    <div className="player-section">
      <div className="player-header-bar">
        <div className="player-heading-wrap">
          <h2 className="player-title">▶ Watch Now</h2>
          {tmdbId && (
            <div className="server-tabs">
              {SERVERS.map(srv => (
                <button
                  key={srv.id}
                  className={`server-btn ${selectedServer === srv.id ? 'active' : ''}`}
                  onClick={() => setSelectedServer(srv.id)}
                >
                  {srv.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn btn-outline player-fullscreen-toggle"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Mode'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {isFullscreen ? (
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            ) : (
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            )}
          </svg>
          <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
        </button>
      </div>

      {/* Live Watch Time Tracker Status Bar */}
      <div className="player-tracker-banner">
        {user ? (
          <div className="tracker-live-info">
            <span className={`tracker-indicator-dot ${isTracking ? 'pulsing' : 'paused'}`} />
            <span className="tracker-text">
              {isTabActive ? (
                <>
                  Streaming as <strong>@{profile?.username || user.username}</strong> • Watch Time: <strong>+{formatWatchTime(sessionSeconds)}</strong> this session
                </>
              ) : (
                <>
                  Tracking paused (switch back to this tab to resume watch time)
                </>
              )}
            </span>
          </div>
        ) : (
          <div className="tracker-guest-info">
            <span className="guest-sparkle">⏱️</span>
            <span>Sign in with a username to track your watch time & rank on the Leaderboard!</span>
            <button className="btn btn-sm btn-primary" onClick={() => openAuthModal('signin')}>
              Sign In
            </button>
          </div>
        )}
      </div>

      <div className="player-wrapper" ref={playerWrapperRef}>
        <iframe
          key={`${selectedServer}-${season}-${episode}`}
          src={activeSrc}
          title={title}
          allowFullScreen={true}
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock"
          referrerPolicy="origin"
          scrolling="no"
        />
      </div>

      <p className="player-help-text">
        Having trouble? Switch servers above or try the Fullscreen button. If a stream fails, disable any aggressive pop-up blockers.
      </p>
    </div>
  )
}

