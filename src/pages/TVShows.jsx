import { useState, useEffect } from 'react'
import { getPopular, getTopRated } from '../api/tmdb'
import MovieGrid from '../components/MovieGrid'

export default function TVShows() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState('popular')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const fn = filter === 'popular' ? getPopular : getTopRated
        const data = await fn('tv', page)
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

  function changePage(next) {
    setPage(p => Math.max(1, Math.min(totalPages, p + next)))
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>TV Shows</h1>
        <p>Browse series and shows</p>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn ${filter === 'popular' ? 'active' : ''}`}
          onClick={() => { setFilter('popular'); setPage(1) }}
        >
          Popular
        </button>
        <button
          className={`filter-btn ${filter === 'top_rated' ? 'active' : ''}`}
          onClick={() => { setFilter('top_rated'); setPage(1) }}
        >
          Top Rated
        </button>
      </div>

      {error && (
        <div className="error-box">
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <MovieGrid items={items} type="tv" />
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
