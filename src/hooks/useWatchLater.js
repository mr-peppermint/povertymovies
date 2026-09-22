// Watch Later — persisted in localStorage
// Returns: { saved, toggle, isSaved, clear }

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'pm_watch_later'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function save(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

// Global state shared across all hook instances via a simple pub/sub
const listeners = new Set()
let _saved = load()

function notifyAll() {
  listeners.forEach(fn => fn([..._saved]))
}

export function useWatchLater() {
  const [saved, setSaved] = useState([..._saved])

  useEffect(() => {
    listeners.add(setSaved)
    return () => listeners.delete(setSaved)
  }, [])

  const isSaved = useCallback(
    (id) => saved.some(item => item.id === id),
    [saved]
  )

  const toggle = useCallback((item) => {
    const exists = _saved.some(s => s.id === item.id)
    if (exists) {
      _saved = _saved.filter(s => s.id !== item.id)
    } else {
      _saved = [
        {
          id: item.id,
          title: item.title || item.name,
          poster_path: item.poster_path,
          vote_average: item.vote_average,
          release_date: item.release_date || item.first_air_date,
          media_type: item.media_type || (item.title ? 'movie' : 'tv'),
          overview: item.overview,
        },
        ..._saved,
      ]
    }
    save(_saved)
    notifyAll()
  }, [])

  const clear = useCallback(() => {
    _saved = []
    save(_saved)
    notifyAll()
  }, [])

  return { saved, toggle, isSaved, clear }
}
