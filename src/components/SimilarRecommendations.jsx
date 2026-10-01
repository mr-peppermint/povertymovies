import { useState, useEffect } from 'react'
import { getSimilarOrRecommended } from '../api/tmdb'
import MovieGrid from './MovieGrid'

export default function SimilarRecommendations({ type = 'movie', id, genres = [] }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const genreIds = genres.map(g => g.id)
  const genreNames = genres.map(g => g.name).slice(0, 3).join(', ')

  useEffect(() => {
    if (!id) return
    let isCancelled = false
    setLoading(true)

    getSimilarOrRecommended(type, id, genreIds)
      .then(results => {
        if (!isCancelled) {
          setItems(results || [])
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setItems([])
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [id, type, JSON.stringify(genreIds)])

  if (!loading && items.length === 0) return null

  return (
    <section className="detail-similar-section">
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="section-title">
            {type === 'tv' ? 'Similar TV Shows' : 'Similar Movies'}
          </h2>
          {genreNames && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              More recommended titles in <strong style={{ color: 'var(--text-secondary)' }}>{genreNames}</strong>
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap" style={{ minHeight: '180px' }}>
          <div className="spinner" />
        </div>
      ) : (
        <MovieGrid items={items} type={type} />
      )}
    </section>
  )
}
