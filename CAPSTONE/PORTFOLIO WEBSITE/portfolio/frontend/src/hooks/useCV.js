import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useCV() {
  const [cvError, setCvError] = useState(null)

  async function downloadCV() {
    setCvError(null)
    try {
      const res = await fetch(`${API_URL}/api/v1/cv/download`)
      if (res.status === 404) {
        setCvError('CV is not available at the moment.')
        return
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Everton_Anyiro_CV.pdf'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setCvError('Could not download CV. Please try again.')
    }
  }

  return { downloadCV, cvError, clearCvError: () => setCvError(null) }
}
