import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import LogoIcon from '../components/LogoIcon'

export default function ErrorPage({ 
  code: propCode, 
  message = 'Some error occurred',
  onClose
}) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Extract error code from prop, query parameter, or default to 404
  const errorCode = propCode || searchParams.get('code') || '404'

  function handleGoHome() {
    if (onClose) onClose()
    navigate('/')
  }

  function handleReload() {
    if (onClose) onClose()
    window.location.reload()
  }

  function handleGoBack() {
    if (onClose) onClose()
    navigate(-1)
  }

  return (
    <div className="error-fullscreen-subpage">
      {/* Background Projector Light Beam & Ambient Spotlight */}
      <div className="fullscreen-projector-glow" />
      <div className="fullscreen-radial-vignette" />

      {/* Background Rotating Film Reels (Subtle graphic textures) */}
      <div className="bg-film-reel bg-reel-left">
        <svg viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="rgba(229,9,20,0.12)" strokeWidth="4" />
          <circle cx="100" cy="100" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle cx="100" cy="100" r="16" fill="rgba(229,9,20,0.2)" />
          <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <line x1="36" y1="36" x2="164" y2="164" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <line x1="164" y1="36" x2="36" y2="164" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        </svg>
      </div>

      <div className="bg-film-reel bg-reel-right">
        <svg viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="rgba(229,9,20,0.12)" strokeWidth="4" />
          <circle cx="100" cy="100" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle cx="100" cy="100" r="16" fill="rgba(229,9,20,0.2)" />
          <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <line x1="36" y1="36" x2="164" y2="164" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <line x1="164" y1="36" x2="36" y2="164" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        </svg>
      </div>

      {/* Left 35mm Film Sprocket Column */}
      <div className="film-sprocket-track track-left">
        {[...Array(24)].map((_, i) => (
          <div key={`left-${i}`} className="sprocket-hole" />
        ))}
      </div>

      {/* Right 35mm Film Sprocket Column */}
      <div className="film-sprocket-track track-right">
        {[...Array(24)].map((_, i) => (
          <div key={`right-${i}`} className="sprocket-hole" />
        ))}
      </div>

      {/* Top Brand Nav */}
      <div className="error-screen-topbar">
        <Link to="/" onClick={onClose} className="error-brand-link">
          <LogoIcon size={30} />
          <span>Poverty<span className="brand-highlight">Movies</span></span>
        </Link>
      </div>

      {/* Central Screen Content */}
      <div className="error-screen-content">
        {/* Animated Cinema Graphic */}
        <div className="error-graphic-wrapper">
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="error-cinema-graphic"
          >
            {/* Outer halo */}
            <circle cx="50" cy="50" r="44" stroke="#e50914" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6" />
            <circle cx="50" cy="50" r="38" fill="#140405" stroke="#2a2a2a" strokeWidth="1.5" />

            {/* Clapperboard Body */}
            <rect x="26" y="36" width="48" height="34" rx="4" fill="#121212" stroke="#e50914" strokeWidth="1.5" />
            
            {/* Clapper Hinge Top Bar */}
            <rect x="24" y="24" width="52" height="12" rx="2" fill="#1a1a1a" stroke="#e50914" strokeWidth="1.5" />
            <line x1="33" y1="24" x2="39" y2="36" stroke="#e50914" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="47" y1="24" x2="53" y2="36" stroke="#e50914" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="61" y1="24" x2="67" y2="36" stroke="#e50914" strokeWidth="2.5" strokeLinecap="round" />

            {/* Broken Film Cut / Hazard Exclamation */}
            <path d="M44 46L56 58" stroke="#ff3843" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M56 46L44 58" stroke="#ff3843" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Large Glowing Error Code Display */}
        <div className="error-code-container">
          <span className="error-giant-code">{errorCode}</span>
          <div className="error-code-pill">
            <span className="error-live-indicator" />
            <span>ERROR CODE: {errorCode}</span>
          </div>
        </div>

        {/* Simple, Non-verbose Message */}
        <h1 className="error-headline">{message}</h1>
        <p className="error-tagline">
          The requested media reel could not be played or loaded.
        </p>

        {/* Navigation Action Buttons */}
        <div className="error-fullscreen-actions">
          <button 
            type="button" 
            className="btn btn-primary error-screen-btn primary"
            onClick={handleGoHome}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Back to Home</span>
          </button>

          <button 
            type="button" 
            className="btn btn-outline error-screen-btn"
            onClick={handleReload}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>Try Again</span>
          </button>

          <button 
            type="button" 
            className="btn btn-outline error-screen-btn"
            onClick={handleGoBack}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  )
}
