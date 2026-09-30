import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

export function useWatchTracker(isActive = true) {
  const { user, addWatchTime } = useAuth()
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [isTabActive, setIsTabActive] = useState(!document.hidden)
  const pendingSecondsRef = useRef(0)
  const addWatchTimeRef = useRef(addWatchTime)
  addWatchTimeRef.current = addWatchTime

  // Listen for tab visibility changes
  useEffect(() => {
    function handleVisibilityChange() {
      setIsTabActive(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Timer interval for watching
  useEffect(() => {
    if (!isActive || !user || !isTabActive) return

    const interval = setInterval(() => {
      setSessionSeconds(prev => prev + 1)
      pendingSecondsRef.current += 1

      // Sync to Supabase in batches every 15 seconds
      if (pendingSecondsRef.current >= 15) {
        const toSync = pendingSecondsRef.current
        pendingSecondsRef.current = 0
        addWatchTimeRef.current(toSync)
      }
    }, 1000)

    return () => {
      clearInterval(interval)
      // Flush any remaining accumulated seconds when unmounting or stopping
      if (pendingSecondsRef.current > 0) {
        const toSync = pendingSecondsRef.current
        pendingSecondsRef.current = 0
        addWatchTimeRef.current(toSync)
      }
    }
  }, [isActive, user, isTabActive])

  return {
    sessionSeconds,
    isTracking: isActive && !!user && isTabActive,
    isTabActive,
    isLoggedIn: !!user,
  }
}
