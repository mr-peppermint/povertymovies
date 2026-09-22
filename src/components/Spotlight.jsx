import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { IMG_ORIGINAL, IMG_W500 } from '../api/tmdb'
import { useWatchLater } from '../hooks/useWatchLater'

const INTERVAL = 5000 // exact 5 seconds

function StarRating({ value, count }) {
  const stars = []
  const scaled = value / 2
  for (let i = 1; i <= 5; i++) {
    if (scaled >= i) stars.push('full')
    else if (scaled >= i - 0.5) stars.push('half')
    else stars.push('empty')
  }
  return (
    <div className="spotlight-stars" title={`${value.toFixed(1)} / 10`}>
      {stars.map((type, i) => (
        <span key={i} className={`star star-${type}`}>
          {type === 'full' ? '★' : type === 'half' ? '⯨' : '☆'}
        </span>
      ))}
      <span className="star-score">{value.toFixed(1)}</span>
      {count > 0 && <span className="star-count">({count.toLocaleString()} votes)</span>}
    </div>
  )
}

export default function Spotlight({ items = [] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [slideKey, setSlideKey] = useState(0)
  const [direction, setDirection] = useState('next')
  const [isPaused, setIsPaused] = useState(false)
  const { toggle, isSaved } = useWatchLater()

  const nextSlide = useCallback(() => {
    if (items.length < 2) return
    setDirection('next')
    setActiveIdx(prev => (prev + 1) % items.length)
    setSlideKey(k => k + 1)
  }, [items.length])

  const prevSlide = useCallback(() => {
    if (items.length < 2) return
    setDirection('prev')
    setActiveIdx(prev => (prev - 1 + items.length) % items.length)
    setSlideKey(k => k + 1)
  }, [items.length])

  const goToSlide = useCallback((idx) => {
    if (idx === activeIdx || items.length < 2) return
    setDirection(idx > activeIdx ? 'next' : 'prev')
    setActiveIdx(idx)
    setSlideKey(k => k + 1)
  }, [activeIdx, items.length])

  // Exact 5 seconds per slide timer
  useEffect(() => {
    if (items.length < 2 || isPaused) return

    const timer = setTimeout(() => {
      nextSlide()
    }, INTERVAL)

    return () => clearTimeout(timer)
  }, [items.length, isPaused, slideKey, nextSlide])

  if (!items.length) return null

  const item = items[activeIdx]
  const title = item.title || item.name || ''
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)
  const rating = item.vote_average || 0
  const voteCount = item.vote_count || 0
  const isMovie = item.media_type === 'movie' || !!item.title
  const mediaType = item.media_type || (isMovie ? 'movie' : 'tv')
  const watchLink = mediaType === 'tv' ? `/tv/${item.id}?play=true` : `/movie/${item.id}?play=true`
  const infoLink = mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`
  const backdrop = item.backdrop_path ? `${IMG_ORIGINAL}${item.backdrop_path}` : null
  const poster = item.poster_path ? `${IMG_W500}${item.poster_path}` : null
  const saved = isSaved(item.id)

  return (
    <div
      className={`spotlight spotlight-${direction} ${isPaused ? 'is-paused' : ''}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background image */}
      {backdrop && (
        <img
          key={`bg-${item.id}-${slideKey}`}
          className="spotlight-bg"
          src={backdrop}
          alt=""
          aria-hidden
        />
      )}
      <div className="spotlight-overlay" />

      <div className="container spotlight-container" key={`content-${item.id}-${slideKey}`}>
        {/* Poster thumbnail */}
        {poster && (
          <div className="spotlight-poster">
            <img src={poster} alt={title} />
          </div>
        )}

        {/* Text content */}
        <div className="spotlight-content">
          <div className="spotlight-badges">
            <span className="hero-badge">{isMovie ? 'Movie' : 'TV Show'} · Trending</span>
            {year && <span className="spotlight-year">{year}</span>}
          </div>

          <h1 className="hero-title spotlight-title">{title}</h1>

          {rating > 0 && (
            <StarRating value={rating} count={voteCount} />
          )}

          {item.overview && (
            <p className="hero-overview">{item.overview}</p>
          )}

          <div className="hero-actions">
            <Link to={watchLink} className="btn btn-primary">
              <span>▶ Watch Now</span>
            </Link>
            <Link to={infoLink} className="btn btn-outline">
              <span>More Info</span>
            </Link>
            <button
              className={`btn btn-ghost spotlight-save-btn ${saved ? 'saved' : ''}`}
              onClick={() => toggle(item)}
              title={saved ? 'Remove from Watch Later' : 'Save to Watch Later'}
            >
              <span>{saved ? '🔖 Saved' : '+ Watch Later'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="spotlight-dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={`spotlight-dot ${i === activeIdx ? 'active' : ''}`}
              onClick={() => goToSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Arrow buttons */}
      {items.length > 1 && (
        <>
          <button className="spotlight-arrow spotlight-arrow-prev" onClick={prevSlide} aria-label="Previous">
            ‹
          </button>
          <button className="spotlight-arrow spotlight-arrow-next" onClick={nextSlide} aria-label="Next">
            ›
          </button>
        </>
      )}

      {/* Exact 5s Progress bar */}
      {items.length > 1 && (
        <div key={`progress-${slideKey}`} className="spotlight-progress" />
      )}
    </div>
  )
}
