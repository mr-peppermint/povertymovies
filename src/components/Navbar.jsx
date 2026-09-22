import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useWatchLater } from '../hooks/useWatchLater'
import LogoIcon from './LogoIcon'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { saved } = useWatchLater()

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
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="navbar-search-btn" onClick={() => navigate('/search')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search
          </button>

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
        <NavLink to="/search" onClick={() => setMenuOpen(false)}>Search</NavLink>
      </div>
    </nav>
  )
}
