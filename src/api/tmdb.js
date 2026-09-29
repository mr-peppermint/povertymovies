import { dispatchAppError } from '../context/ErrorContext'

// https://www.themoviedb.org/settings/api
const API_KEY = import.meta.env.VITE_TMDB_KEY || 'YOUR_TMDB_API_KEY'
const BASE_URL = 'https://api.themoviedb.org/3'

export const IMG_BASE = 'https://image.tmdb.org/t/p'
export const IMG_W500 = `${IMG_BASE}/w500`
export const IMG_ORIGINAL = `${IMG_BASE}/original`

async function fetchTMDB(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('api_key', API_KEY)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  try {
    const res = await fetch(url.toString())
    if (!res.ok) {
      let rawText = ''
      try {
        rawText = await res.text()
      } catch {
        // ignore
      }

      let parsed = null
      try {
        parsed = JSON.parse(rawText)
      } catch {
        // ignore
      }

      const errorMsg = parsed?.status_message || `TMDB error: ${res.status}`
      
      dispatchAppError({
        type: res.status === 404 ? '404' : 'api',
        status: res.status,
        title: res.status === 401 
          ? 'TMDB API Key Unauthorized (401)' 
          : res.status === 404 
            ? 'Media Reel Not Found (404)' 
            : `API Request Failed (${res.status})`,
        message: res.status === 401
          ? 'API key failed to serve movie catalog streaming =('
          : errorMsg,
        endpoint: `${path}`,
        details: rawText || `HTTP Status ${res.status}`
      })

      throw new Error(errorMsg)
    }
    return res.json()
  } catch (err) {
    if (err.name === 'TypeError' || err.message?.includes?.('Failed to fetch')) {
      dispatchAppError({
        type: 'network',
        status: 'OFFLINE',
        title: 'Network Communication Error',
        message: 'Could not connect to media servers. Please check your internet connection and try again.',
        endpoint: path,
        details: err.message
      })
    }
    throw err
  }
}

// tpending 
export const getTrending = (type = 'movie', window = 'week', page = 1) =>
  fetchTMDB(`/trending/${type}/${window}`, { page })

// popular 
export const getPopular = (type = 'movie', page = 1) =>
  fetchTMDB(`/${type}/popular`, { page })

// top rated 
export const getTopRated = (type = 'movie', page = 1) =>
  fetchTMDB(`/${type}/top_rated`, { page })

// Multi-search (movies + TV + people)
export const searchMulti = (query, page = 1) =>
  fetchTMDB('/search/multi', { query, page, include_adult: false })

// Full details for a movie or TV show
export const getDetails = (type, id) =>
  fetchTMDB(`/${type}/${id}`, { append_to_response: 'credits,videos' })

// season details (episode list)
export const getSeasonDetails = (showId, season) =>
  fetchTMDB(`/tv/${showId}/season/${season}`)

// genre list for movies or TV
export const getGenres = (type = 'movie') =>
  fetchTMDB(`/genre/${type}/list`)

// multi-filters 
export const discoverTitles = ({
  type = 'movie',
  genreIds = [],
  isTopRated = false,
  isPopular = false,
  page = 1
}) => {
  const params = { page }

  if (genreIds.length > 0) {
    params.with_genres = genreIds.join(',')
  }

  if (isTopRated && !isPopular) {
    params.sort_by = 'vote_average.desc'
    params['vote_count.gte'] = 150
  } else if (isTopRated && isPopular) {
    params.sort_by = 'popularity.desc'
    params['vote_average.gte'] = 7.0
    params['vote_count.gte'] = 100
  } else {
    params.sort_by = 'popularity.desc'
  }

  return fetchTMDB(`/discover/${type}`, params)
}

// Discover by genre IDs (array or comma string)
export const getByGenre = (type = 'movie', genreIds, page = 1, sortBy = 'popularity.desc') => {
  const genreParam = Array.isArray(genreIds) ? genreIds.join(',') : genreIds
  const params = {
    with_genres: genreParam,
    sort_by: sortBy,
    page
  }
  if (sortBy === 'vote_average.desc') {
    params['vote_count.gte'] = 100
  }
  return fetchTMDB(`/discover/${type}`, params)
}

// VidSrc embed URLs
export const getVidSrcMovie = (tmdbId) =>
  `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`

export const getVidSrcTV = (tmdbId, season, episode) =>
  `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`
