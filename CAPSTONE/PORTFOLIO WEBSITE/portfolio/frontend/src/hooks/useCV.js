import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useCV() {
  const [cvError, setCvError] = useState(null)

  async function downloadCV() {
    setCvError(null)
    try {
      // Open the download endpoint directly in a new tab.
      // The backend either redirects to R2 or streams the local file —
      // both work correctly when the browser navigates directly.
      window.open(`${API_URL}/api/v1/cv/download`, '_blank')
    } catch {
      setCvError('Could not download CV. Please try again.')
    }
  }

  return { downloadCV, cvError, clearCvError: () => setCvError(null) }
}
