import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDetails, BACKDROP_W1280, IMG_W500, formatYear, formatRuntime, formatRating } from '../api/tmdb'
import VideoPlayer from '../components/VideoPlayer'
import MovieCard from '../components/MovieCard'
import styles from './Detail.module.css'

export default function MovieDetail() {
  const { id } = useParams()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => getDetails('movie', id),
    enabled: !!id,
  })

  if (isLoading) return <div className="spinner" style={{ paddingTop: 120 }} />
  if (isError || !data) return (
    <div className="error-state">
      <h3>Something went wrong</h3>
      <p>Could not load movie details.</p>
      <Link to="/" style={{ color: 'var(--red)', marginTop: 8 }}>← Back home</Link>
    </div>
  )

  const genres = data.genres?.map((g) => g.name) || []
  const cast = data.credits?.cast?.slice(0, 12) || []
  const similar = data.similar?.results?.slice(0, 10).map((m) => ({ ...m, media_type: 'movie' })) || []

  return (
    <div className={styles.page}>
      {/* Backdrop */}
      {data.backdrop_path && (
        <div
          className={styles.backdrop}
          style={{ backgroundImage: `url(${BACKDROP_W1280}${data.backdrop_path})` }}
        />
      )}
      <div className={styles.backdropGrad} />

      <div className={`container ${styles.content}`}>
        {/* ── Header ───────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.poster}>
            {data.poster_path ? (
              <img src={`${IMG_W500}${data.poster_path}`} alt={data.title} />
            ) : (
              <div className={styles.noPoster}>{data.title?.[0]}</div>
            )}
          </div>
          <div className={styles.meta}>
            <span className="tag tag-red">Movie</span>
            <h1 className={styles.title}>{data.title}</h1>
            {data.tagline && <p className={styles.tagline}>"{data.tagline}"</p>}

            <div className={styles.stats}>
              <span>⭐ {formatRating(data.vote_average)}</span>
              <span className={styles.dot} />
              <span>{formatYear(data.release_date)}</span>
              {data.runtime && (
                <>
                  <span className={styles.dot} />
                  <span>{formatRuntime(data.runtime)}</span>
                </>
              )}
            </div>

            <div className={styles.genres}>
              {genres.map((g) => (
                <span key={g} className="tag tag-outline">{g}</span>
              ))}
            </div>

            <p className={styles.overview}>{data.overview}</p>
          </div>
        </div>

        {/* ── Player ───────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><span className="red">▶</span> Watch</h2>
          <VideoPlayer mediaType="movie" tmdbId={id} />
        </section>

        {/* ── Cast ─────────────────────────────────── */}
        {cast.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cast</h2>
            <div className={styles.castGrid}>
              {cast.map((person) => (
                <div key={person.id} className={styles.castCard}>
                  {person.profile_path ? (
                    <img
                      src={`${IMG_W500}${person.profile_path}`}
                      alt={person.name}
                      className={styles.castImg}
                    />
                  ) : (
                    <div className={styles.castPlaceholder}>{person.name?.[0]}</div>
                  )}
                  <p className={styles.castName}>{person.name}</p>
                  <p className={styles.castRole}>{person.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Similar ──────────────────────────────── */}
        {similar.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>More Like This</h2>
            <div className={styles.similarGrid}>
              {similar.map((m) => <MovieCard key={m.id} item={m} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
