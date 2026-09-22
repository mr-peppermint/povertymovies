import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          Poverty<span>Movies</span>
        </Link>

        <ul className="navbar-nav">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/movies">Movies</NavLink></li>
          <li><NavLink to="/tv">TV Shows</NavLink></li>
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
        <NavLink to="/search" onClick={() => setMenuOpen(false)}>Search</NavLink>
      </div>
    </nav>
  )
}
