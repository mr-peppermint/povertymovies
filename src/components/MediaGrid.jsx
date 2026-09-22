import MovieCard from './MovieCard'
import styles from './MediaGrid.module.css'

export default function MediaGrid({ items = [], emptyMessage = 'Nothing here yet.' }) {
  if (!items.length) {
    return (
      <div className={styles.empty}>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <MovieCard key={`${item.media_type || 'x'}-${item.id}`} item={item} />
      ))}
    </div>
  )
}
