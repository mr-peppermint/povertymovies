import { useState, useEffect } from 'react'
import { getPopular, getTopRated, getGenres, getByGenre } from '../api/tmdb'
import MovieGrid from '../components/MovieGrid'

export default function Movies() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState('popular')   // 'popular' | 'top_rated' | genre id (number)
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch genre list once
  useEffect(() => {
    getGenres('movie')
      .then(d => setGenres(d.genres || []))
      .catch(() => {})
  }, [])

  // Fetch movies whenever filter or page changes
  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        let data
        if (filter === 'popular') {
          data = await getPopular('movie', page)
        } else if (filter === 'top_rated') {
          data = await getTopRated('movie', page)
        } else {
          data = await getByGenre('movie', filter, page)
        }
        setItems(data.results || [])
        setTotalPages(Math.min(data.total_pages || 1, 500))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page, filter])

  function setFilterAndReset(value) {
    setFilter(value)
    setPage(1)
  }

  function changePage(next) {
    setPage(p => Math.max(1, Math.min(totalPages, p + next)))
  }

  const activeGenreName = genres.find(g => g.id === filter)?.name

  return (
    <div className="container">
      <div className="page-header">
        <h1>Movies</h1>
        <p>{activeGenreName ? `Browsing: ${activeGenreName}` : 'Browse our collection of movies'}</p>
      </div>

      {/* Sort filters */}
      <div className="filter-bar" style={{ marginBottom: '10px' }}>
        <button
          className={`filter-btn ${filter === 'popular' ? 'active' : ''}`}
          onClick={() => setFilterAndReset('popular')}
        >
          Popular
        </button>
        <button
          className={`filter-btn ${filter === 'top_rated' ? 'active' : ''}`}
          onClick={() => setFilterAndReset('top_rated')}
        >
          Top Rated
        </button>
      </div>

      {/* Genre strip */}
      {genres.length > 0 && (
        <div className="genre-strip">
          {genres.map(g => (
            <button
              key={g.id}
              className={`genre-pill ${filter === g.id ? 'active' : ''}`}
              onClick={() => setFilterAndReset(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="error-box">
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <MovieGrid items={items} type="movie" />
      )}

      {!loading && !error && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button className="page-btn" onClick={() => changePage(-1)} disabled={page === 1}>‹</button>
          <span className="page-btn active">{page}</span>
          <button className="page-btn" onClick={() => changePage(1)} disabled={page === totalPages}>›</button>
          <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
        </div>
      )}
    </div>
  )
}
