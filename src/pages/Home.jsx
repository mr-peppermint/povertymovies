import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTrending, IMG_ORIGINAL, IMG_W500 } from '../api/tmdb'
import MovieGrid from '../components/MovieGrid'

function HeroSection({ item }) {
  if (!item) return null

  const title = item.title || item.name
  const backdrop = item.backdrop_path ? `${IMG_ORIGINAL}${item.backdrop_path}` : null
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)
  const isMovie = item.media_type === 'movie'
  const watchLink = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`

  return (
    <div className="hero">
      {backdrop && <img className="hero-backdrop" src={backdrop} alt={title} />}
      <div className="hero-gradient" />
      <div className="container" style={{ width: '100%' }}>
        <div className="hero-content">
          <span className="hero-badge">{isMovie ? 'Movie' : 'TV Show'} · Trending</span>
          <h1 className="hero-title">{title}</h1>
          <div className="hero-meta">
            {rating && <span className="rating">★ {rating}</span>}
            {year && <span>{year}</span>}
            {item.original_language && (
              <span style={{ textTransform: 'uppercase' }}>{item.original_language}</span>
            )}
          </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState([])
  const [trendingTV, setTrendingTV] = useState([])
  const [heroItem, setHeroItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [moviesRes, tvRes] = await Promise.all([
          getTrending('movie', 'week'),
          getTrending('tv', 'week'),
        ])
        const movies = moviesRes.results || []
        const tv = tvRes.results || []
        setTrendingMovies(movies.slice(0, 12))
        setTrendingTV(tv.slice(0, 12))
        // Pick a hero with a backdrop
        const hero = [...movies].find(m => m.backdrop_path && m.overview)
        setHeroItem(hero || movies[0] || null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero */}
      {loading ? (
        <div className="hero" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      ) : (
        <HeroSection item={heroItem} />
      )}

      <div className="container">
        {error && (
          <div className="error-box" style={{ marginTop: '40px' }}>
            <h2>Couldn't load content</h2>
            <p>{error}</p>
            <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>
              Make sure your TMDB API key is set in the <code>.env</code> file.
            </p>
          </div>
        )}

        {/* Trending Movies */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Trending Movies</h2>
            <Link to="/movies" className="section-link">View all →</Link>
          </div>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <MovieGrid items={trendingMovies} type="movie" />
          )}
        </section>

        {/* Trending TV */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Trending TV Shows</h2>
            <Link to="/tv" className="section-link">View all →</Link>
          </div>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <MovieGrid items={trendingTV} type="tv" />
          )}
        </section>
      </div>
    </div>
  )
}
