import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">Poverty<span>Movies</span></div>
            <p className="footer-tagline">Lights out, popcorn up.</p>
          </div>

          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/movies">Movies</Link>
            <Link to="/tv">TV Shows</Link>
            <Link to="/search">Search</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            This site uses the TMDB API but is not endorsed or certified by TMDB.
            Video content is embedded from third-party sources for educational and personal use only.
          </p>
          <p style={{ marginTop: '6px' }}>© {new Date().getFullYear()} PovertyMovies · povertymovies.dpdns.org</p>
        </div>
      </div>
    </footer>
  )
}
