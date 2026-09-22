import axios from 'axios'

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

export const IMG_BASE = 'https://image.tmdb.org/t/p'
export const IMG_W500 = `${IMG_BASE}/w500`
export const IMG_ORIGINAL = `${IMG_BASE}/original`
export const BACKDROP_W1280 = `${IMG_BASE}/w1280`

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY, language: 'en-US' },
})

// ── Trending ──────────────────────────────────────────────────────────────
export const getTrending = async (mediaType = 'all', timeWindow = 'week') => {
  const { data } = await tmdb.get(`/trending/${mediaType}/${timeWindow}`)
  return data.results
}

// ── Details ───────────────────────────────────────────────────────────────
export const getDetails = async (mediaType, id) => {
  const { data } = await tmdb.get(`/${mediaType}/${id}`, {
    params: { append_to_response: 'credits,videos,similar' },
  })
  return data
}

// ── Season details (episode list) ─────────────────────────────────────────
export const getSeasonDetails = async (tvId, seasonNumber) => {
  const { data } = await tmdb.get(`/tv/${tvId}/season/${seasonNumber}`)
  return data
}

// ── Search ────────────────────────────────────────────────────────────────
export const searchMulti = async (query, page = 1) => {
  const { data } = await tmdb.get('/search/multi', {
    params: { query, page, include_adult: false },
  })
  return data
}

// ── Browse: popular ────────────────────────────────────────────────────────
export const getPopular = async (mediaType = 'movie', page = 1) => {
  const { data } = await tmdb.get(`/${mediaType}/popular`, {
    params: { page },
  })
  return data
}

// ── Browse: top rated ─────────────────────────────────────────────────────
export const getTopRated = async (mediaType = 'movie', page = 1) => {
  const { data } = await tmdb.get(`/${mediaType}/top_rated`, {
    params: { page },
  })
  return data
}

// ── Now playing / Airing today ────────────────────────────────────────────
export const getNowPlaying = async (mediaType = 'movie', page = 1) => {
  const endpoint = mediaType === 'tv' ? '/tv/airing_today' : '/movie/now_playing'
  const { data } = await tmdb.get(endpoint, { params: { page } })
  return data
}

// ── Genre lists ───────────────────────────────────────────────────────────
export const getGenres = async (mediaType = 'movie') => {
  const { data } = await tmdb.get(`/genre/${mediaType}/list`)
  return data.genres
}

// ── Helpers ───────────────────────────────────────────────────────────────
export const formatRuntime = (minutes) => {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export const formatYear = (dateStr) =>
  dateStr ? new Date(dateStr).getFullYear() : '—'

export const formatRating = (vote) =>
  vote ? vote.toFixed(1) : '—'
