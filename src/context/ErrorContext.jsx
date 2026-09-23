import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ErrorContext = createContext(null)

export function ErrorProvider({ children }) {
  const [errorState, setErrorState] = useState(null)

  const showError = useCallback((errorData) => {
    const code = errorData?.status || errorData?.code || 'ERROR'
    setErrorState({
      isOpen: true,
      code: code,
      status: code,
      message: 'Some error occurred'
    })
  }, [])

  const hideError = useCallback(() => {
    setErrorState(null)
  }, [])

  useEffect(() => {
    function handleGlobalError(event) {
      if (event?.detail) {
        showError(event.detail)
      }
    }

    function handleOffline() {
      showError({
        code: 'OFFLINE',
        message: 'Some error occurred'
      })
    }

    window.addEventListener('app:error', handleGlobalError)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('app:error', handleGlobalError)
      window.removeEventListener('offline', handleOffline)
    }
  }, [showError])

  return (
    <ErrorContext.Provider value={{ errorState, showError, hideError }}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}

export function dispatchAppError(errorData) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:error', { detail: errorData }))
  }
}
