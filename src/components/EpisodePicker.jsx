import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSeasonDetails } from '../api/tmdb'
import styles from './EpisodePicker.module.css'

export default function EpisodePicker({ tvId, totalSeasons, onSelect, currentSeason, currentEpisode }) {
  const [season, setSeason] = useState(currentSeason || 1)

  const { data, isLoading } = useQuery({
    queryKey: ['season', tvId, season],
    queryFn: () => getSeasonDetails(tvId, season),
    enabled: !!tvId,
  })

  // Notify parent when season changes — pick episode 1
  useEffect(() => {
    if (data?.episodes?.length) {
      onSelect(season, 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season, data])

  const seasons = Array.from({ length: totalSeasons || 1 }, (_, i) => i + 1)
  const episodes = data?.episodes || []

  return (
    <div className={styles.picker}>
      {/* Season selector */}
      <div className={styles.seasonRow}>
        <span className={styles.label}>Season</span>
        <div className={styles.seasonTabs}>
          {seasons.map((s) => (
            <button
              key={s}
              className={`${styles.seasonTab} ${season === s ? styles.active : ''}`}
              onClick={() => setSeason(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Episode grid */}
      <div className={styles.episodeGrid}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.episodeSkeleton} />
            ))
          : episodes.map((ep) => (
              <button
                key={ep.episode_number}
                className={`${styles.episodeBtn} ${
                  currentSeason === season && currentEpisode === ep.episode_number
                    ? styles.activeEp
                    : ''
                }`}
                onClick={() => onSelect(season, ep.episode_number)}
                title={ep.name}
              >
                <span className={styles.epNum}>E{ep.episode_number}</span>
                <span className={styles.epName}>{ep.name}</span>
              </button>
            ))}
      </div>
    </div>
  )
}
