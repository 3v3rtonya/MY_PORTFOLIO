import { useRef } from 'react'
import { useInView } from 'framer-motion'

export function useScrollReveal(threshold = 0.2) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: threshold })
  return { ref, isInView }
}
