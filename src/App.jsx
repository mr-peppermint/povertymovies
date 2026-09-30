import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorProvider } from './context/ErrorContext'
import { AuthProvider } from './context/AuthContext'
import ErrorModal from './components/ErrorModal'
import ErrorBoundary from './components/ErrorBoundary'
import AuthModal from './components/AuthModal'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Movies from './pages/Movies'
import TVShows from './pages/TVShows'
import Search from './pages/Search'
import MovieDetail from './pages/MovieDetail'
import TVDetail from './pages/TVDetail'
import WatchLater from './pages/WatchLater'
import Leaderboard from './pages/Leaderboard'
import ErrorPage from './pages/ErrorPage'

export default function App() {
  return (
    <ErrorProvider>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <div className="app-wrapper">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/tv" element={<TVShows />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/watch-later" element={<WatchLater />} />
                  <Route path="/movie/:id" element={<MovieDetail />} />
                  <Route path="/tv/:id" element={<TVDetail />} />
                  <Route path="/error" element={<ErrorPage />} />
                  <Route path="*" element={<ErrorPage code="404" message="Some error occurred" />} />
                </Routes>
              </main>
              <Footer />
              <AuthModal />
              <ErrorModal />
            </div>
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </ErrorProvider>
  )
}

