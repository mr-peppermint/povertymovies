import MovieCard from './MovieCard'

export default function MovieGrid({ items = [], type = 'movie' }) {
  if (!items.length) {
    return (
      <div className="error-box">
        <p>No results found.</p>
      </div>
    )
  }

  return (
    <div className="movie-grid">
      {items.map(item => (
        <MovieCard key={`${item.id}-${item.media_type || type}`} item={item} type={type} />
      ))}
    </div>
  )
}
