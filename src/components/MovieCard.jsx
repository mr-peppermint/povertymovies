import { useNavigate } from 'react-router-dom'
import { IMG_W500 } from '../api/tmdb'
import { useWatchLater } from '../hooks/useWatchLater'

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon points="5,3 19,12 5,21" />
  </svg>
)

const BookmarkIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth="2.2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
)

export default function MovieCard({ item, type }) {
  const navigate = useNavigate()
  const { toggle, isSaved } = useWatchLater()
  const isMovie = type === 'movie' || item.media_type === 'movie'
  const mediaType = item.media_type || type || 'movie'

  const title = item.title || item.name || 'Unknown'
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)
  const rating = item.vote_average ? parseFloat(item.vote_average) : null
  const ratingStr = rating ? rating.toFixed(1) : null
  const posterUrl = item.poster_path ? `${IMG_W500}${item.poster_path}` : null
  const saved = isSaved(item.id)

  // Color coding: green ≥7, yellow ≥5, red <5
  const ratingColor = !rating ? 'var(--text-muted)'
    : rating >= 7 ? '#4caf50'
    : rating >= 5 ? '#f5c518'
    : '#e50914'

  function handleClick() {
    navigate(mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`)
  }

  function handleSave(e) {
    e.stopPropagation()
    toggle({ ...item, media_type: mediaType })
  }

  return (
    <article
      className="movie-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      <div className="movie-card-poster">
        {posterUrl
          ? <img src={posterUrl} alt={title} loading="lazy" />
          : <div className="movie-card-no-poster">No Poster</div>
        }

        {/* ── TOP-LEFT: Rating pill ── */}
        {ratingStr && (
          <div className="card-rating-pill" style={{ color: ratingColor }}>
            ★ {ratingStr}
          </div>
        )}

        {/* ── TOP-RIGHT: Watch Later / Save icon ── */}
        <button
          className={`card-wl-btn ${saved ? 'card-wl-saved' : ''}`}
          onClick={handleSave}
          title={saved ? 'Remove from Watch Later' : 'Save to Watch Later'}
          aria-label={saved ? 'Remove from Watch Later' : 'Save to Watch Later'}
        >
          <BookmarkIcon filled={saved} />
        </button>

        {/* ── BOTTOM: type badge for search/trending ── */}
        {type === 'trending' && (
          <div className="movie-card-badge">{isMovie ? 'Movie' : 'TV'}</div>
        )}

        {/* ── CENTER HOVER: play button ── */}
        <div className="movie-card-overlay">
          <div className="movie-card-play">
            <PlayIcon />
          </div>
        </div>
      </div>

      <div className="movie-card-info">
        <div className="movie-card-title" title={title}>{title}</div>
        <div className="movie-card-meta">
          <span>{year || '—'}</span>
          {ratingStr && (
            <span className="movie-card-rating" style={{ color: ratingColor }}>
              ★ {ratingStr}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
