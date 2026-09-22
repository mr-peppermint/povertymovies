import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDetails, getVidSrcMovie, IMG_ORIGINAL, IMG_W500 } from '../api/tmdb'
import VideoPlayer from '../components/VideoPlayer'

export default function MovieDetail() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPlayer, setShowPlayer] = useState(false)

  useEffect(() => {
    setShowPlayer(false)
    setLoading(true)
    setError(null)

    getDetails('movie', id)
      .then(data => setMovie(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))

    window.scrollTo({ top: 0 })
  }, [id])

  if (loading) return <div className="spinner-wrap" style={{ minHeight: '60vh' }}><div className="spinner" /></div>
  if (error) return (
    <div className="container">
      <div className="error-box" style={{ marginTop: '60px' }}>
        <h2>Couldn't load movie</h2>
        <p>{error}</p>
        <Link to="/movies" className="btn btn-outline" style={{ marginTop: '16px', display: 'inline-flex' }}>
          <span>← Back to Movies</span>
        </Link>
      </div>
    </div>
  )
  if (!movie) return null

  const backdrop = movie.backdrop_path ? `${IMG_ORIGINAL}${movie.backdrop_path}` : null
  const poster = movie.poster_path ? `${IMG_W500}${movie.poster_path}` : null
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '—'
  const year = (movie.release_date || '').slice(0, 4)
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null

  return (
    <div>
      {/* Backdrop */}
      <div className="detail-backdrop">
        {backdrop && <img src={backdrop} alt={movie.title} />}
        <div className="detail-backdrop-overlay" />
      </div>

      <div className="container">
        <div className="detail-content">
          <div className="detail-inner">
            {/* Poster */}
            <div className="detail-poster">
              {poster ? (
                <img src={poster} alt={movie.title} />
              ) : (
                <div className="detail-poster-placeholder">No Poster</div>
              )}
            </div>

            {/* Info */}
            <div className="detail-info">
              {movie.genres?.length > 0 && (
                <div className="detail-genres">
                  {movie.genres.map(g => (
                    <span key={g.id} className="genre-tag">{g.name}</span>
                  ))}
                </div>
              )}

              <h1 className="detail-title">{movie.title}</h1>

              <div className="detail-meta">
                <span className="rating">★ {rating}</span>
                {year && <span>{year}</span>}
                {runtime && <span>{runtime}</span>}
                {movie.status && <span>{movie.status}</span>}
              </div>

              {movie.overview && (
                <p className="detail-overview">{movie.overview}</p>
              )}

              <div className="detail-actions">
                {!showPlayer ? (
                  <button className="btn btn-primary" onClick={() => setShowPlayer(true)}>
                    <span>▶ Watch Now</span>
                  </button>
                ) : (
                  <button className="btn btn-ghost" onClick={() => setShowPlayer(false)}>
                    <span>✕ Close Player</span>
                  </button>
                )}
                <Link to="/movies" className="btn btn-outline">
                  <span>← Back</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Player */}
          {showPlayer && (
            <VideoPlayer
              src={getVidSrcMovie(movie.id)}
              title={movie.title}
            />
          )}
        </div>
      </div>
    </div>
  )
}
