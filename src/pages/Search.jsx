import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchMulti } from '../api/tmdb'
import MediaGrid from '../components/MediaGrid'
import styles from './Search.module.css'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [inputVal, setInputVal] = useState(initialQuery)
  const debounceRef = useRef(null)

  // Sync query param → input on load
  useEffect(() => {
    setInputVal(searchParams.get('q') || '')
  }, [searchParams])

  // Debounce: update URL after 400ms idle
  const handleChange = (e) => {
    const val = e.target.value
    setInputVal(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (val.trim()) setSearchParams({ q: val.trim() })
    }, 400)
  }

  const query = searchParams.get('q') || ''

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchMulti(query),
    enabled: query.length > 1,
  })

  const results = (data?.results || []).filter(
    (r) => r.media_type === 'movie' || r.media_type === 'tv'
  )

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Search bar */}
        <div className={styles.searchBar}>
          <SearchIcon />
          <input
            className={styles.input}
            type="text"
            value={inputVal}
            onChange={handleChange}
            placeholder="Search movies and TV shows…"
            autoFocus
          />
          {inputVal && (
            <button
              className={styles.clear}
              onClick={() => { setInputVal(''); setSearchParams({}) }}
              aria-label="Clear"
            >
              ×
            </button>
          )}
        </div>

        {/* Results */}
        <div className={styles.results}>
          {!query && (
            <p className={styles.hint}>Start typing to search…</p>
          )}

          {query && isLoading && <div className="spinner" />}

          {query && isError && (
            <div className="error-state">
              <h3>Search failed</h3>
              <p>Something went wrong. Try again.</p>
            </div>
          )}

          {query && !isLoading && !isError && (
            <>
              <p className={styles.resultCount}>
                {results.length > 0
                  ? <><span className="red">{results.length}</span> results for "{query}"</>
                  : <>No results for "{query}"</>}
              </p>
              <MediaGrid items={results} emptyMessage="No movies or shows found." />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
