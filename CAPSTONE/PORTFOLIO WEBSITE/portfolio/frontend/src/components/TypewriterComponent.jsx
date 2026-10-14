import React, { useState, useEffect } from 'react'

const PHRASES = ['Cybersecurity Student', 'Full-Stack Developer', 'Problem Solver']

export default function TypewriterComponent() {
  const [displayed, setDisplayed] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const phrase = PHRASES[phraseIdx]
    let timeout
    if (isTyping) {
      if (displayed.length < phrase.length) {
        timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), Math.random() * 100 + 50)
      } else {
        timeout = setTimeout(() => setIsTyping(false), Math.random() * 1000 + 1000)
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(d => d.slice(0, -1)), 40)
      } else {
        setPhraseIdx(i => (i + 1) % PHRASES.length)
        setIsTyping(true)
      }
    }
    return () => clearTimeout(timeout)
  }, [displayed, phraseIdx, isTyping])

  return (
    <span className="text-gold font-semibold">
      {displayed}<span className="animate-pulse">|</span>
    </span>
  )
}
