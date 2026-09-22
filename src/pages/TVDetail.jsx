import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDetails, getSeasonDetails, getVidSrcTV, IMG_ORIGINAL, IMG_W500 } from '../api/tmdb'
import VideoPlayer from '../components/VideoPlayer'

export default function TVDetail() {
  const { id } = useParams()
  const [show, setShow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedSeason, setSelectedSeason] = useState(1)
  const [episodes, setEpisodes] = useState([])
  const [selectedEp, setSelectedEp] = useState(1)
  const [epLoading, setEpLoading] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)

  useEffect(() => {
    setShowPlayer(false)
    setLoading(true)
    setError(null)

    getDetails('tv', id)
      .then(data => {
        setShow(data)
        const firstSeason = data.seasons?.find(s => s.season_number > 0)?.season_number || 1
        setSelectedSeason(firstSeason)
        setSelectedEp(1)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))

    window.scrollTo({ top: 0 })
  }, [id])

  useEffect(() => {
    if (!id) return
    setEpLoading(true)
    setSelectedEp(1)
    setShowPlayer(false)
    getSeasonDetails(id, selectedSeason)
      .then(data => setEpisodes(data.episodes || []))
      .catch(() => setEpisodes([]))
      .finally(() => setEpLoading(false))
  }, [id, selectedSeason])

  if (loading) return <div className="spinner-wrap" style={{ minHeight: '60vh' }}><div className="spinner" /></div>
  if (error) return (
    <div className="container">
      <div className="error-box" style={{ marginTop: '60px' }}>
        <h2>Couldn't load show</h2>
        <p>{error}</p>
        <Link to="/tv" className="btn btn-outline" style={{ marginTop: '16px', display: 'inline-flex' }}>
          <span>← Back to TV Shows</span>
        </Link>
      </div>
    </div>
  )
  if (!show) return null

  const backdrop = show.backdrop_path ? `${IMG_ORIGINAL}${show.backdrop_path}` : null
  const poster = show.poster_path ? `${IMG_W500}${show.poster_path}` : null
  const rating = show.vote_average ? show.vote_average.toFixed(1) : '—'
  const year = (show.first_air_date || '').slice(0, 4)
  const seasons = (show.seasons || []).filter(s => s.season_number > 0)

  return (
    <div>
      {/* Backdrop */}
      <div className="detail-backdrop">
        {backdrop && <img src={backdrop} alt={show.name} />}
        <div className="detail-backdrop-overlay" />
      </div>

      <div className="container">
        <div className="detail-content">
          <div className="detail-inner">
            {/* Poster */}
            <div className="detail-poster">
              {poster ? (
                <img src={poster} alt={show.name} />
              ) : (
                <div className="detail-poster-placeholder">No Poster</div>
              )}
            </div>

            {/* Info */}
            <div className="detail-info">
              {show.genres?.length > 0 && (
                <div className="detail-genres">
                  {show.genres.map(g => (
                    <span key={g.id} className="genre-tag">{g.name}</span>
                  ))}
                </div>
              )}

              <h1 className="detail-title">{show.name}</h1>

              <div className="detail-meta">
                <span className="rating">★ {rating}</span>
                {year && <span>{year}</span>}
                {show.number_of_seasons && (
                  <span>{show.number_of_seasons} Season{show.number_of_seasons > 1 ? 's' : ''}</span>
                )}
                {show.status && <span>{show.status}</span>}
              </div>

              {show.overview && (
                <p className="detail-overview">{show.overview}</p>
              )}

              <div className="detail-actions">
                {!showPlayer ? (
                  <button className="btn btn-primary" onClick={() => setShowPlayer(true)}>
                    <span>▶ Watch S{selectedSeason}E{selectedEp}</span>
                  </button>
                ) : (
                  <button className="btn btn-ghost" onClick={() => setShowPlayer(false)}>
                    <span>✕ Close Player</span>
                  </button>
                )}
                <Link to="/tv" className="btn btn-outline">
                  <span>← Back</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Player */}
          {showPlayer && (
            <VideoPlayer
              src={getVidSrcTV(show.id, selectedSeason, selectedEp)}
              title={`${show.name} S${selectedSeason}E${selectedEp}`}
            />
          )}

          {/* Episode Picker */}
          {seasons.length > 0 && (
            <div className="episode-picker">
              <h3>Select Season & Episode</h3>

              {/* Season tabs */}
              <div className="season-tabs">
                {seasons.map(s => (
                  <button
                    key={s.id}
                    className={`filter-btn ${selectedSeason === s.season_number ? 'active' : ''}`}
                    onClick={() => setSelectedSeason(s.season_number)}
                  >
                    S{s.season_number}
                  </button>
                ))}
              </div>

              {/* Episodes */}
              {epLoading ? (
                <div className="spinner-wrap" style={{ minHeight: '80px' }}>
                  <div className="spinner" />
                </div>
              ) : (
                <div className="episode-grid">
                  {episodes.map(ep => (
                    <button
                      key={ep.episode_number}
                      className={`ep-btn ${selectedEp === ep.episode_number ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedEp(ep.episode_number)
                        setShowPlayer(true)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      title={ep.name}
                    >
                      {ep.episode_number}
                    </button>
                  ))}
                  {episodes.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', gridColumn: '1/-1' }}>
                      No episodes found for this season.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
