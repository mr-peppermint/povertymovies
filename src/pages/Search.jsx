import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchMulti } from '../api/tmdb'
import MovieGrid from '../components/MovieGrid'

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (initialQuery) runSearch(initialQuery, 1)
    inputRef.current?.focus()
  }, [])

  async function runSearch(q, p = 1) {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await searchMulti(q.trim(), p)
      const filtered = (data.results || []).filter(
        r => r.media_type !== 'person' && r.poster_path
      )
      setResults(filtered)
      setTotalPages(Math.min(data.total_pages || 1, 500))
      setPage(p)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearchParams({ q: query.trim() })
    runSearch(query.trim(), 1)
  }

  function changePage(next) {
    const newPage = Math.max(1, Math.min(totalPages, page + next))
    runSearch(query, newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container">
      <div className="search-bar-wrapper">
        <form onSubmit={handleSubmit} className="search-bar">
          <SearchIcon />
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Search movies and TV shows..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit" className="search-submit">Search</button>
        </form>
      </div>

      {error && (
        <div className="error-box">
          <h2>Search failed</h2>
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="spinner-wrap"><div className="spinner" /></div>
      )}

      {!loading && searched && results.length === 0 && !error && (
        <div className="search-empty">
          <SearchIcon />
          <p>No results for <strong>"{query}"</strong></p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="section-header" style={{ marginBottom: '20px' }}>
            <h2 className="section-title">Results for "{query}"</h2>
          </div>
          <MovieGrid items={results} type="trending" />

          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={() => changePage(-1)} disabled={page === 1}>‹ Prev</button>
              <span className="page-btn active">{page} / {totalPages}</span>
              <button className="page-btn" onClick={() => changePage(1)} disabled={page === totalPages}>Next ›</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
