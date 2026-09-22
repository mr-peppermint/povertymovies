import { useState, useEffect } from 'react'
import { getGenres, discoverTitles } from '../api/tmdb'
import MovieGrid from '../components/MovieGrid'

export default function Movies() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTags, setSelectedTags] = useState(['popular']) // can contain 'popular', 'top_rated', and any genre IDs
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch genre list once
  useEffect(() => {
    getGenres('movie')
      .then(d => setGenres(d.genres || []))
      .catch(() => {})
  }, [])

  // Fetch movies whenever selectedTags or page changes
  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const genreIds = selectedTags.filter(t => typeof t === 'number')
        const isPopular = selectedTags.includes('popular')
        const isTopRated = selectedTags.includes('top_rated')

        const data = await discoverTitles({
          type: 'movie',
          genreIds,
          isPopular,
          isTopRated,
          page
        })

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
  }, [page, selectedTags])

  function toggleTag(tagKey) {
    setSelectedTags(prev =>
      prev.includes(tagKey)
        ? prev.filter(k => k !== tagKey)
        : [...prev, tagKey]
    )
    setPage(1)
  }

  function clearAll() {
    setSelectedTags(['popular'])
    setPage(1)
  }

  // Generate subtitle from selected tags
  const activeNames = selectedTags.map(tag => {
    if (tag === 'popular') return 'Popular'
    if (tag === 'top_rated') return 'Top Rated'
    return genres.find(g => g.id === tag)?.name
  }).filter(Boolean)

  const subtitle = activeNames.length > 0
    ? `Browsing: ${activeNames.join(' + ')}`
    : 'Browse our collection of movies'

  return (
    <div className="container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1>Movies</h1>
            <p>{subtitle}</p>
          </div>
          {selectedTags.length > 0 && !(selectedTags.length === 1 && selectedTags[0] === 'popular') && (
            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={clearAll}>
              <span>✕ Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Merged Filter & Multi-Genre strip with zero exceptions */}
      <div className="genre-strip">
        <button
          className={`genre-pill ${selectedTags.includes('popular') ? 'active' : ''}`}
          onClick={() => toggleTag('popular')}
        >
          Popular
        </button>
        <button
          className={`genre-pill ${selectedTags.includes('top_rated') ? 'active' : ''}`}
          onClick={() => toggleTag('top_rated')}
        >
          Top Rated
        </button>

        {genres.map(g => (
          <button
            key={g.id}
            className={`genre-pill ${selectedTags.includes(g.id) ? 'active' : ''}`}
            onClick={() => toggleTag(g.id)}
          >
            {g.name}
          </button>
        ))}
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
        <MovieGrid items={items} type="movie" />
      )}

      {!loading && !error && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
          <span className="page-btn active">{page}</span>
          <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
        </div>
      )}
    </div>
  )
}
