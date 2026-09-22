import { useWatchLater } from '../hooks/useWatchLater'
import MovieGrid from '../components/MovieGrid'

export default function WatchLater() {
  const { saved, clear } = useWatchLater()

  return (
    <div className="container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1>Watch Later</h1>
            <p>{saved.length} title{saved.length !== 1 ? 's' : ''} saved</p>
          </div>
          {saved.length > 0 && (
            <button
              className="btn btn-outline"
              onClick={() => {
                if (window.confirm('Clear your entire Watch Later list?')) clear()
              }}
            >
              <span>✕ Clear All</span>
            </button>
          )}
        </div>
      </div>

      {saved.length === 0 ? (
        <div className="search-empty" style={{ paddingTop: '80px' }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', opacity: 0.3, display: 'block' }}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Nothing saved yet</p>
          <p style={{ fontSize: '0.85rem' }}>Tap the bookmark icon on any movie or show to save it here.</p>
        </div>
      ) : (
        <MovieGrid items={saved} type="trending" />
      )}
    </div>
  )
}
