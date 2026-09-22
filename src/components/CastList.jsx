import { IMG_W500 } from '../api/tmdb'

export default function CastList({ cast = [] }) {
  if (!cast || cast.length === 0) return null

  // Display top 15 cast members
  const displayCast = cast.slice(0, 15)

  return (
    <div className="cast-section">
      <h3 className="cast-heading">Top Cast</h3>
      <div className="cast-scroll">
        {displayCast.map(actor => {
          const profileUrl = actor.profile_path ? `${IMG_W500}${actor.profile_path}` : null
          return (
            <div key={actor.id || actor.credit_id} className="cast-card">
              <div className="cast-avatar">
                {profileUrl ? (
                  <img src={profileUrl} alt={actor.name} loading="lazy" />
                ) : (
                  <div className="cast-avatar-placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="cast-info">
                <p className="cast-name" title={actor.name}>{actor.name}</p>
                {actor.character && (
                  <p className="cast-character" title={actor.character}>{actor.character}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
