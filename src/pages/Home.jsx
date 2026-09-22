import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTrending } from '../api/tmdb'
import MovieGrid from '../components/MovieGrid'
import Spotlight from '../components/Spotlight'

export default function Home() {
  const [spotlightItems, setSpotlightItems] = useState([])
  const [trendingMovies, setTrendingMovies] = useState([])
  const [trendingTV, setTrendingTV] = useState([])
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

        // Spotlight: top 6 movies with backdrops and overviews
        const spotlight = movies
          .filter(m => m.backdrop_path && m.overview)
          .slice(0, 6)

        setSpotlightItems(spotlight)
        setTrendingMovies(movies.slice(0, 12))
        setTrendingTV(tv.slice(0, 12))
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
      {/* Spotlight Carousel */}
      {loading ? (
        <div className="spotlight spotlight-loading">
          <div className="spinner" />
        </div>
      ) : (
        <Spotlight items={spotlightItems} />
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
