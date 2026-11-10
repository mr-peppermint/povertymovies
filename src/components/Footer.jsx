import { Link } from 'react-router-dom'
import LogoIcon from './LogoIcon'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">
              <LogoIcon size={24} />
              <span>Poverty<span className="brand-highlight">Movies</span></span>
            </div>
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
            Movie and TV metadata and images are provided by{' '}
            <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">TMDB</a>.
            {' '}This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
          <p style={{ marginTop: '6px' }}>© {new Date().getFullYear()} PovertyMovies · By yours Dixit =3 </p>
        </div>
      </div>
    </footer>
  )
}
