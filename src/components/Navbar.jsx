import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Detect scroll to add background blur
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close search when route changes
  useEffect(() => {
    setSearchOpen(false)
    setQuery('')
  }, [location.pathname])

  const openSearch = () => {
    setSearchOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoRed}>P</span>overty
          <span className={styles.logoRed}>Movies</span>
        </Link>

        {/* Nav links */}
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>Home</Link>
        </nav>

        {/* Search */}
        <div className={styles.searchWrap}>
          {searchOpen ? (
            <form onSubmit={handleSubmit} className={styles.searchForm}>
              <input
                ref={inputRef}
                className={styles.searchInput}
                type="text"
                placeholder="Search movies, shows…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => {
                  if (!query) setSearchOpen(false)
                }}
              />
              <button type="submit" className={styles.searchBtn} aria-label="Search">
                <SearchIcon />
              </button>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => { setSearchOpen(false); setQuery('') }}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </form>
          ) : (
            <button className={styles.searchIconBtn} onClick={openSearch} aria-label="Open search">
              <SearchIcon />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
