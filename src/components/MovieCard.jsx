import { useNavigate } from 'react-router-dom'
import { IMG_W500 } from '../api/tmdb'

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon points="5,3 19,12 5,21" />
  </svg>
)

export default function MovieCard({ item, type }) {
  const navigate = useNavigate()
  const isMovie = type === 'movie' || item.media_type === 'movie'
  const mediaType = item.media_type || type || 'movie'

  const title = item.title || item.name || 'Unknown'
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '—'
  const posterUrl = item.poster_path ? `${IMG_W500}${item.poster_path}` : null

  function handleClick() {
    const route = mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`
    navigate(route)
  }

  return (
    <article className="movie-card" onClick={handleClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      {type === 'trending' && (
        <div className="movie-card-badge">{isMovie ? 'Movie' : 'TV'}</div>
      )}

      <div className="movie-card-poster">
        {posterUrl ? (
          <img src={posterUrl} alt={title} loading="lazy" />
        ) : (
          <div className="movie-card-no-poster">No Poster</div>
        )}
        <div className="movie-card-overlay">
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div className="movie-card-play">
              <PlayIcon />
            </div>
          </div>
        </div>
      </div>

      <div className="movie-card-info">
        <div className="movie-card-title" title={title}>{title}</div>
        <div className="movie-card-meta">
          <span>{year || '—'}</span>
          <span className="movie-card-rating">★ {rating}</span>
        </div>
      </div>
    </article>
  )
}
