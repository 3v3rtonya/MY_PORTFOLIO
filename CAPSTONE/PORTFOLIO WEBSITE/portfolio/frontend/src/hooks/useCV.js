import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useCV() {
  const [cvError, setCvError] = useState(null)

  async function downloadCV() {
    setCvError(null)
    try {
      const w = window.open(`${API_URL}/api/v1/cv/download`, '_blank')
      if (!w) {
        setCvError('Popup blocked — please allow popups for this site and try again.')
      }
    } catch {
      setCvError('Could not download CV. Please try again.')
    }
  }

  return { downloadCV, cvError, clearCvError: () => setCvError(null) }
}
