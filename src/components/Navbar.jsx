import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useWatchLater } from '../hooks/useWatchLater'
import { useAuth } from '../context/AuthContext'
import { formatWatchTime } from '../api/supabase'
import LogoIcon from './LogoIcon'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { saved } = useWatchLater()
  const { user, profile, openAuthModal, signOut } = useAuth()

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <LogoIcon size={28} />
          <span>Poverty<span className="brand-highlight">Movies</span></span>
        </Link>

        <ul className="navbar-nav">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/movies">Movies</NavLink></li>
          <li><NavLink to="/tv">TV Shows</NavLink></li>
          <li>
            <NavLink to="/watch-later" className="watch-later-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '5px', verticalAlign: 'middle' }}>
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              Watch Later
              {saved.length > 0 && (
                <span className="nav-badge">{saved.length}</span>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink to="/leaderboard" className="leaderboard-nav-link">
              <span style={{ marginRight: '5px' }}></span>
              Leaderboard
            </NavLink>
          </li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="navbar-search-btn" onClick={() => navigate('/search')} title="Search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="search-text-hide">Search</span>
          </button>

          {/* User Auth Section */}
          {user ? (
            <div className="user-dropdown-wrapper" ref={dropdownRef}>
              <button
                className="user-profile-btn"
                onClick={() => setUserDropdownOpen(o => !o)}
                title="Account Menu"
              >
                <span className="nav-user-avatar">{profile?.avatar_url || '🍿'}</span>
                <span className="nav-user-name">@{profile?.username || user.username}</span>
                <span className="nav-user-time">{formatWatchTime(profile?.watch_time_seconds || 0)}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-user-header">
                    <div className="dropdown-user-avatar">{profile?.avatar_url || '🍿'}</div>
                    <div className="dropdown-user-info">
                      <span className="dropdown-username">@{profile?.username || user.username}</span>
                      <span className="dropdown-watchtime">
                        ⏱️ {formatWatchTime(profile?.watch_time_seconds || 0)} watched
                      </span>
                    </div>
                  </div>
                  <hr className="dropdown-divider" />
                  <Link
                    to="/watch-later"
                    className="dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    🔖 Watch Later List ({saved.length})
                  </Link>
                  <Link
                    to="/leaderboard"
                    className="dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    🏆 Watch Time Leaderboard
                  </Link>
                  <hr className="dropdown-divider" />
                  <button
                    className="dropdown-item dropdown-logout-btn"
                    onClick={() => {
                      setUserDropdownOpen(false)
                      signOut()
                    }}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-nav-buttons">
              <button
                className="btn btn-sm btn-ghost nav-signin-btn"
                onClick={() => openAuthModal('signin')}
              >
                Sign In
              </button>
              <button
                className="btn btn-sm btn-primary nav-signup-btn"
                onClick={() => openAuthModal('signup')}
              >
                Create Username
              </button>
            </div>
          )}

          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`navbar-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
        <NavLink to="/movies" onClick={() => setMenuOpen(false)}>Movies</NavLink>
        <NavLink to="/tv" onClick={() => setMenuOpen(false)}>TV Shows</NavLink>
        <NavLink to="/watch-later" onClick={() => setMenuOpen(false)}>
          Watch Later {saved.length > 0 && `(${saved.length})`}
        </NavLink>
        <NavLink to="/leaderboard" onClick={() => setMenuOpen(false)}>🏆 Leaderboard</NavLink>
        <NavLink to="/search" onClick={() => setMenuOpen(false)}>Search</NavLink>
        <hr style={{ borderColor: 'var(--border)', margin: '8px 0' }} />
        {user ? (
          <div className="mobile-auth-section">
            <div className="mobile-user-row">
              <span>{profile?.avatar_url || '🍿'} @{profile?.username || user.username}</span>
              <span className="nav-user-time">{formatWatchTime(profile?.watch_time_seconds || 0)}</span>
            </div>
            <button
              className="btn btn-outline btn-sm mobile-signout-btn"
              onClick={() => {
                setMenuOpen(false)
                signOut()
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="mobile-auth-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                setMenuOpen(false)
                openAuthModal('signup')
              }}
            >
              Create Username
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                setMenuOpen(false)
                openAuthModal('signin')
              }}
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

