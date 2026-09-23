import { useError } from '../context/ErrorContext'
import ErrorPage from '../pages/ErrorPage'

export default function ErrorModal() {
  const { errorState, hideError } = useError()

  if (!errorState || !errorState.isOpen) return null

  return (
    <ErrorPage 
      code={errorState.code || errorState.status || 'ERROR'} 
      message="Some error occurred"
      onClose={hideError}
    />
  )
}
