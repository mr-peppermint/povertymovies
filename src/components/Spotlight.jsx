import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { IMG_ORIGINAL, IMG_W500 } from '../api/tmdb'
import { useWatchLater } from '../hooks/useWatchLater'

const INTERVAL = 5000 // 5 seconds

function StarRating({ value, count }) {
  // value is 0-10, render 5 filled/half/empty stars
  const stars = []
  const scaled = value / 2 // 0-5
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
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState('next') // 'next' | 'prev'
  const timerRef = useRef(null)
  const { toggle, isSaved } = useWatchLater()

  const goTo = useCallback((idx, dir = 'next') => {
    if (animating || idx === activeIdx) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setActiveIdx(idx)
      setAnimating(false)
    }, 420)
  }, [animating, activeIdx])

  const next = useCallback(() => {
    goTo((activeIdx + 1) % items.length, 'next')
  }, [activeIdx, items.length, goTo])

  const prev = useCallback(() => {
    goTo((activeIdx - 1 + items.length) % items.length, 'prev')
  }, [activeIdx, items.length, goTo])

  // Auto-advance
  useEffect(() => {
    if (items.length < 2) return
    timerRef.current = setInterval(next, INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [next, items.length])

  // Pause on hover
  const pause = () => clearInterval(timerRef.current)
  const resume = () => {
    if (items.length < 2) return
    timerRef.current = setInterval(next, INTERVAL)
  }

  if (!items.length) return null

  const item = items[activeIdx]
  const title = item.title || item.name || ''
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)
  const rating = item.vote_average || 0
  const voteCount = item.vote_count || 0
  const isMovie = item.media_type === 'movie' || !!item.title
  const mediaType = item.media_type || (isMovie ? 'movie' : 'tv')
  const watchLink = mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`
  const backdrop = item.backdrop_path ? `${IMG_ORIGINAL}${item.backdrop_path}` : null
  const poster = item.poster_path ? `${IMG_W500}${item.poster_path}` : null
  const saved = isSaved(item.id)

  return (
    <div
      className={`spotlight spotlight-${direction} ${animating ? 'spotlight-animating' : ''}`}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {/* Background */}
      {backdrop && (
        <img
          key={`bg-${item.id}`}
          className="spotlight-bg"
          src={backdrop}
          alt=""
          aria-hidden
        />
      )}
      <div className="spotlight-overlay" />

      <div className="container spotlight-container">
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
            <Link to={watchLink} className="btn btn-outline">
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
              onClick={() => goTo(i, i > activeIdx ? 'next' : 'prev')}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Arrow buttons */}
      {items.length > 1 && (
        <>
          <button className="spotlight-arrow spotlight-arrow-prev" onClick={prev} aria-label="Previous">
            ‹
          </button>
          <button className="spotlight-arrow spotlight-arrow-next" onClick={next} aria-label="Next">
            ›
          </button>
        </>
      )}

      {/* Progress bar */}
      {items.length > 1 && (
        <div key={`progress-${activeIdx}`} className="spotlight-progress" />
      )}
    </div>
  )
}
