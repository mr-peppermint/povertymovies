// Replace with your TMDB API key from https://www.themoviedb.org/settings/api
const API_KEY = import.meta.env.VITE_TMDB_KEY || 'YOUR_TMDB_API_KEY'
const BASE_URL = 'https://api.themoviedb.org/3'

export const IMG_BASE = 'https://image.tmdb.org/t/p'
export const IMG_W500 = `${IMG_BASE}/w500`
export const IMG_ORIGINAL = `${IMG_BASE}/original`

async function fetchTMDB(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('api_key', API_KEY)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  return res.json()
}

// Trending movies or TV (day/week)
export const getTrending = (type = 'movie', window = 'week', page = 1) =>
  fetchTMDB(`/trending/${type}/${window}`, { page })

// Popular movies or TV
export const getPopular = (type = 'movie', page = 1) =>
  fetchTMDB(`/${type}/popular`, { page })

// Top rated movies or TV
export const getTopRated = (type = 'movie', page = 1) =>
  fetchTMDB(`/${type}/top_rated`, { page })

// Multi-search (movies + TV + people)
export const searchMulti = (query, page = 1) =>
  fetchTMDB('/search/multi', { query, page, include_adult: false })

// Full details for a movie or TV show
export const getDetails = (type, id) =>
  fetchTMDB(`/${type}/${id}`, { append_to_response: 'credits,videos' })

// Season details (episode list)
export const getSeasonDetails = (showId, season) =>
  fetchTMDB(`/tv/${showId}/season/${season}`)

// Genre list for movies or TV
export const getGenres = (type = 'movie') =>
  fetchTMDB(`/genre/${type}/list`)

// Discover by genre ID
export const getByGenre = (type = 'movie', genreId, page = 1) =>
  fetchTMDB(`/discover/${type}`, { with_genres: genreId, sort_by: 'popularity.desc', page })

// VidSrc embed URLs
export const getVidSrcMovie = (tmdbId) =>
  `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`

export const getVidSrcTV = (tmdbId, season, episode) =>
  `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`
