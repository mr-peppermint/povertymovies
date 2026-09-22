import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPopular, getTopRated, getNowPlaying } from '../api/tmdb'
import MediaGrid from '../components/MediaGrid'
import styles from './Browse.module.css'

const TABS = [
  { key: 'popular',    label: 'Popular' },
  { key: 'top_rated',  label: 'Top Rated' },
  { key: 'now',        label: 'Now Playing' },
]

export default function Browse({ mediaType }) {
  const [tab, setTab] = useState('popular')
  const [page, setPage] = useState(1)

  const isMovie = mediaType === 'movie'
  const title = isMovie ? 'Movies' : 'TV Shows'
  const nowLabel = isMovie ? 'Now Playing' : 'Airing Today'

  const tabs = TABS.map((t) =>
    t.key === 'now' ? { ...t, label: nowLabel } : t
  )

  const fetcher =
    tab === 'popular'   ? () => getPopular(mediaType, page)
    : tab === 'top_rated' ? () => getTopRated(mediaType, page)
    : () => getNowPlaying(mediaType, page)

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['browse', mediaType, tab, page],
    queryFn: fetcher,
    keepPreviousData: true,
  })

  const items = (data?.results || []).map((item) => ({
    ...item,
    media_type: mediaType,
  }))

  const totalPages = data?.total_pages || 1

  const handleTab = (key) => {
    setTab(key)
    setPage(1)
  }

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            {isMovie ? (
              <><FilmIcon /> <span className="red">Movies</span></>
            ) : (
              <><TvIcon /> <span className="red">TV Shows</span></>
            )}
          </h1>

          {/* Tabs */}
          <div className={styles.tabs}>
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`${styles.tab} ${tab === t.key ? styles.activeTab : ''}`}
                onClick={() => handleTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="spinner" />
        ) : isError ? (
          <div className="error-state">
            <h3>Failed to load</h3>
            <p>Try refreshing the page.</p>
          </div>
        ) : (
          <>
            <div className={isFetching ? styles.fading : ''}>
              <MediaGrid items={items} />
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>
                Page <span className="red">{page}</span> of {Math.min(totalPages, 500)}
              </span>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || page >= 500}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function FilmIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
      <line x1="7" y1="2" x2="7" y2="22"/>
      <line x1="17" y1="2" x2="17" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="2" y1="7" x2="7" y2="7"/>
      <line x1="2" y1="17" x2="7" y2="17"/>
      <line x1="17" y1="17" x2="22" y2="17"/>
      <line x1="17" y1="7" x2="22" y2="7"/>
    </svg>
  )
}

function TvIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
      <polyline points="17 2 12 7 7 2"/>
    </svg>
  )
}
