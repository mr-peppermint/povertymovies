import { Link } from 'react-router-dom'
import { IMG_W500, formatYear, formatRating } from '../api/tmdb'
import styles from './MovieCard.module.css'

export default function MovieCard({ item }) {
  if (!item) return null

  const isTV = item.media_type === 'tv' || item.first_air_date !== undefined
  const path = isTV ? `/tv/${item.id}` : `/movie/${item.id}`
  const title = item.title || item.name || 'Untitled'
  const year = formatYear(item.release_date || item.first_air_date)
  const rating = formatRating(item.vote_average)
  const posterUrl = item.poster_path
    ? `${IMG_W500}${item.poster_path}`
    : null

  return (
    <Link to={path} className={styles.card}>
      <div className={styles.poster}>
        {posterUrl ? (
          <img src={posterUrl} alt={title} loading="lazy" />
        ) : (
          <div className={styles.noPoster}>
            <span>{title[0]}</span>
          </div>
        )}
        <div className={styles.overlay}>
          <PlayIcon />
        </div>
        <span className={`tag tag-red ${styles.typeTag}`}>
          {isTV ? 'TV' : 'Movie'}
        </span>
        <span className={styles.ratingBadge}>⭐ {rating}</span>
      </div>
      <div className={styles.info}>
        <p className={styles.title}>{title}</p>
        <p className={styles.year}>{year}</p>
      </div>
    </Link>
  )
}

function PlayIcon() {
  return (
    <svg className={styles.playIcon} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  )
}
