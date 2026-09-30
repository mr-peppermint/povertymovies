import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { AVATAR_OPTIONS } from '../api/supabase'

export default function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    createUsername,
    loginWithUsername,
    isConfigured,
  } = useAuth()

  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].icon)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [authModalOpen])

  if (!authModalOpen) return null

  const isSignUp = authModalMode === 'signup'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const cleanUser = username.trim()
    if (!cleanUser) {
      setError('Please enter a username.')
      return
    }

    if (cleanUser.length < 3) {
      setError('Username must be at least 3 characters long.')
      return
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUser)) {
      setError('Username can only contain letters, numbers, underscores (_), and hyphens (-).')
      return
    }

    setLoading(true)

    try {
      if (isSignUp) {
        await createUsername({
          username: cleanUser,
          avatarUrl: selectedAvatar,
        })
      } else {
        await loginWithUsername(cleanUser)
      }
      setUsername('')
      setError('')
    } catch (err) {
      setError(err.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  function switchMode(newMode) {
    setError('')
    openAuthModal(newMode)
  }

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-content auth-modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={closeAuthModal} aria-label="Close window">
          ✕
        </button>

        <div className="auth-header">
          <div className="auth-badge-icon">{isSignUp ? '🍿' : '👋'}</div>
          <h2>{isSignUp ? 'Choose a Username' : 'Welcome Back'}</h2>
          <p className="auth-subtitle">
            {isSignUp
              ? 'Pick any username & avatar to start streaming and climb the Leaderboard. No password required!'
              : 'Enter your username to continue tracking your watch time and rankings.'}
          </p>
        </div>

        {!isConfigured && (
          <div className="auth-notice-banner">
            <span className="notice-badge">Local Mode</span>
            <p>
              Testing locally. Your profile & watch time will save in your browser.
            </p>
          </div>
        )}

        {error && (
          <div className="auth-error-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="auth-username">
              {isSignUp ? 'Your Desired Username' : 'Your Username'}
            </label>
            <div className="input-with-icon">
              <span className="input-prefix">@</span>
              <input
                id="auth-username"
                type="text"
                placeholder="e.g. CinemaMaster"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
                maxLength={24}
              />
            </div>
          </div>

          {isSignUp && (
            <div className="form-group">
              <label>Pick Your Avatar</label>
              <div className="avatar-picker">
                {AVATAR_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`avatar-option-btn ${selectedAvatar === opt.icon ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(opt.icon)}
                    title={opt.label}
                  >
                    <span>{opt.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="auth-spinner" />
            ) : isSignUp ? (
              'Start Watching & Join Leaderboard 🚀'
            ) : (
              'Continue to Stream ▶'
            )}
          </button>
        </form>

        <div className="auth-footer-toggle">
          {isSignUp ? (
            <p>
              Already have a username?{' '}
              <button type="button" className="auth-link-btn" onClick={() => switchMode('signin')}>
                Log in here
              </button>
            </p>
          ) : (
            <p>
              New here?{' '}
              <button type="button" className="auth-link-btn" onClick={() => switchMode('signup')}>
                Create a username
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
