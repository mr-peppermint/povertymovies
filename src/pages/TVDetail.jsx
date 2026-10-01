import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { getDetails, getSeasonDetails, getVidSrcTV, IMG_ORIGINAL, IMG_W500 } from '../api/tmdb'
import VideoPlayer from '../components/VideoPlayer'
import CastList from '../components/CastList'
import { useWatchLater } from '../hooks/useWatchLater'
import ErrorPage from './ErrorPage'
import SimilarRecommendations from '../components/SimilarRecommendations'

export default function TVDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const autoPlay = searchParams.get('play') === 'true'

  const [show, setShow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedSeason, setSelectedSeason] = useState(1)
  const [episodes, setEpisodes] = useState([])
  const [selectedEp, setSelectedEp] = useState(1)
  const [epLoading, setEpLoading] = useState(false)
  const [showPlayer, setShowPlayer] = useState(autoPlay)
  const { toggle, isSaved } = useWatchLater()
  const playerRef = useRef(null)

  useEffect(() => {
    setShowPlayer(autoPlay)
    setLoading(true)
    setError(null)

    getDetails('tv', id)
      .then(data => {
        setShow(data)
        const firstSeason = data.seasons?.find(s => s.season_number > 0)?.season_number || 1
        setSelectedSeason(firstSeason)
        setSelectedEp(1)
        if (autoPlay) {
          setTimeout(() => {
            playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 300)
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))

    if (!autoPlay) {
      window.scrollTo({ top: 0 })
    }
  }, [id, autoPlay])

  useEffect(() => {
    if (!id) return
    setEpLoading(true)
    getSeasonDetails(id, selectedSeason)
      .then(data => setEpisodes(data.episodes || []))
      .catch(() => setEpisodes([]))
      .finally(() => setEpLoading(false))
  }, [id, selectedSeason])

  function handlePlayEpisode(epNum) {
    setSelectedEp(epNum)
    setShowPlayer(true)
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }

  if (loading) return <div className="spinner-wrap" style={{ minHeight: '60vh' }}><div className="spinner" /></div>
  if (error) {
    const is404 = String(error).includes('404')
    return (
      <ErrorPage 
        code={is404 ? '404' : '500'}
        message="Some error occurred"
      />
    )
  }
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
                <span className="detail-rating-score">
                  ★ <strong>{rating}</strong>
                  <span className="detail-rating-max">/10</span>
                  {show.vote_count > 0 && (
                    <span className="detail-vote-count">({show.vote_count.toLocaleString()} votes)</span>
                  )}
                </span>
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
                  <button className="btn btn-primary" onClick={() => handlePlayEpisode(selectedEp)}>
                    <span>▶ Watch S{selectedSeason}E{selectedEp}</span>
                  </button>
                ) : (
                  <button className="btn btn-ghost" onClick={() => setShowPlayer(false)}>
                    <span>✕ Close Player</span>
                  </button>
                )}
                <button
                  className={`btn ${isSaved(show.id) ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => toggle({ ...show, media_type: 'tv' })}
                >
                  <span>{isSaved(show.id) ? '🔖 Saved' : '+ Watch Later'}</span>
                </button>
                <Link to="/tv" className="btn btn-ghost">
                  <span>← Back</span>
                </Link>
              </div>

              {/* Cast List under briefing & actions */}
              <CastList cast={show.credits?.cast} />
            </div>
          </div>

          {/* Player */}
          {showPlayer && (
            <div ref={playerRef} style={{ scrollMarginTop: '80px' }}>
              <VideoPlayer
                tmdbId={show.id}
                type="tv"
                season={selectedSeason}
                episode={selectedEp}
                src={getVidSrcTV(show.id, selectedSeason, selectedEp)}
                title={`${show.name} S${selectedSeason}E${selectedEp}`}
              />
            </div>
          )}

          {/* Episode Picker & Previews */}
          {seasons.length > 0 && (
            <div className="episode-picker">
              <div className="section-header" style={{ marginBottom: '16px' }}>
                <h2 className="section-title">Episodes</h2>
              </div>

              {/* Season tabs */}
              <div className="season-tabs">
                {seasons.map(s => (
                  <button
                    key={s.id}
                    className={`filter-btn ${selectedSeason === s.season_number ? 'active' : ''}`}
                    onClick={() => setSelectedSeason(s.season_number)}
                  >
                    Season {s.season_number}
                  </button>
                ))}
              </div>

              {/* Episodes List with Previews, Names & Briefings */}
              {epLoading ? (
                <div className="spinner-wrap" style={{ minHeight: '120px' }}>
                  <div className="spinner" />
                </div>
              ) : (
                <div className="episodes-list">
                  {episodes.map(ep => {
                    const stillUrl = ep.still_path ? `${IMG_W500}${ep.still_path}` : null
                    const isSelected = selectedEp === ep.episode_number
                    const epRating = ep.vote_average ? ep.vote_average.toFixed(1) : null

                    return (
                      <div
                        key={ep.id || ep.episode_number}
                        className={`episode-card ${isSelected ? 'active' : ''}`}
                        onClick={() => handlePlayEpisode(ep.episode_number)}
                      >
                        {/* Episode Preview Thumbnail */}
                        <div className="episode-thumbnail">
                          {stillUrl ? (
                            <img src={stillUrl} alt={ep.name} loading="lazy" />
                          ) : (
                            <div className="episode-thumbnail-placeholder">
                              <span>S{selectedSeason} E{ep.episode_number}</span>
                            </div>
                          )}
                          <div className="episode-play-overlay">
                            <div className="episode-play-btn">
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff">
                                <polygon points="5,3 19,12 5,21" />
                              </svg>
                            </div>
                          </div>
                          {epRating && (
                            <div className="episode-rating-pill">
                              ★ {epRating}
                            </div>
                          )}
                        </div>

                        {/* Episode Details */}
                        <div className="episode-details">
                          <div className="episode-header">
                            <h4 className="episode-name">
                              <span className="episode-num">{ep.episode_number}.</span> {ep.name || `Episode ${ep.episode_number}`}
                            </h4>
                            <div className="episode-meta">
                              {ep.runtime && <span>{ep.runtime}m</span>}
                              {ep.air_date && <span>{ep.air_date}</span>}
                            </div>
                          </div>

                          {/* Episode Briefing / Overview */}
                          <p className="episode-overview">
                            {ep.overview || 'No description available for this episode.'}
                          </p>

                          <button
                            className={`btn ${isSelected && showPlayer ? 'btn-primary' : 'btn-outline'} episode-action-btn`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePlayEpisode(ep.episode_number)
                            }}
                          >
                            <span>{isSelected && showPlayer ? '▶ Playing Now' : '▶ Play Episode'}</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  {episodes.length === 0 && (
                    <div className="error-box" style={{ padding: '30px' }}>
                      <p>No episodes found for this season.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Similar / Recommended TV Shows */}
          <SimilarRecommendations
            type="tv"
            id={show.id}
            genres={show.genres}
          />
        </div>
      </div>
    </div>
  )
}
