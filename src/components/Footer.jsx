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
            This site is only for EDUCATION purposes =) and for people in poverty.
            Video content is embedded from api sources. More stats are not for you just watch movie and series why u even reding this.
          </p>
          <p style={{ marginTop: '6px' }}>© {new Date().getFullYear()} PovertyMovies · By yours Dixit =3 </p>
        </div>
      </div>
    </footer>
  )
}
