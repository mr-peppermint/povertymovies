import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTrending, BACKDROP_W1280, IMG_W500, formatYear, formatRating } from '../api/tmdb'
import MediaGrid from '../components/MediaGrid'
import styles from './Home.module.css'

export default function Home() {
  const { data: trending, isLoading: loadingTrending } = useQuery({
    queryKey: ['trending', 'all'],
    queryFn: () => getTrending('all', 'week'),
  })

  const { data: trendingMovies, isLoading: loadingMovies } = useQuery({
    queryKey: ['trending', 'movie'],
    queryFn: () => getTrending('movie', 'week'),
  })

  const { data: trendingTV, isLoading: loadingTV } = useQuery({
    queryKey: ['trending', 'tv'],
    queryFn: () => getTrending('tv', 'week'),
  })

  // Pick random hero from top 5
  const [hero, setHero] = useState(null)
  useEffect(() => {
    if (trending?.length) {
      const pick = trending.slice(0, 5)[Math.floor(Math.random() * 5)]
      setHero(pick)
    }
  }, [trending])

  const isTV = hero?.media_type === 'tv' || hero?.first_air_date !== undefined
  const heroPath = hero ? (isTV ? `/tv/${hero.id}` : `/movie/${hero.id}`) : '#'

  return (
    <div className={styles.page}>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className={styles.hero}>
        {hero?.backdrop_path && (
          <div
            className={styles.heroBg}
            style={{ backgroundImage: `url(${BACKDROP_W1280}${hero.backdrop_path})` }}
          />
        )}
        <div className={styles.heroGrad} />
        <div className={`container ${styles.heroContent}`}>
          {hero ? (
            <>
              <span className={`tag tag-red ${styles.heroTag}`}>
                {isTV ? 'TV Series' : 'Movie'}
              </span>
              <h1 className={styles.heroTitle}>
                {hero.title || hero.name}
              </h1>
              <p className={styles.heroMeta}>
                <span className={styles.rating}>⭐ {formatRating(hero.vote_average)}</span>
                <span className={styles.dot} />
                <span>{formatYear(hero.release_date || hero.first_air_date)}</span>
              </p>
              <p className={styles.heroOverview}>
                {hero.overview?.slice(0, 200)}{hero.overview?.length > 200 ? '…' : ''}
              </p>
              <Link to={heroPath} className={styles.watchBtn}>
                <PlayIcon /> Watch Now
              </Link>
            </>
          ) : (
            <div className={styles.heroSkeleton} />
          )}
        </div>
      </section>

      {/* ── Trending Movies ───────────────────────────────── */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>
            <span className="red">Trending</span> Movies
          </h2>
          {loadingMovies ? (
            <div className="spinner" />
          ) : (
            <MediaGrid
              items={(trendingMovies || []).map((m) => ({ ...m, media_type: 'movie' }))}
            />
          )}
        </div>
      </section>

      {/* ── Trending TV ───────────────────────────────────── */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>
            <span className="red">Trending</span> TV Shows
          </h2>
          {loadingTV ? (
            <div className="spinner" />
          ) : (
            <MediaGrid
              items={(trendingTV || []).map((t) => ({ ...t, media_type: 'tv' }))}
            />
          )}
        </div>
      </section>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  )
}
