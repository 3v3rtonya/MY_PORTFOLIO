import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
import { SunIcon, MoonIcon } from './Icons'

export default function SidePanel({ isOpen, onClose }) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Secret admin access — triple-click the small dot in the footer
  const [clickCount, setClickCount] = React.useState(0)
  const timerRef = React.useRef(null)

  function handleSecretClick() {
    setClickCount(n => {
      const next = n + 1
      clearTimeout(timerRef.current)
      if (next >= 3) {
        navigate('/admin-xk92')
        onClose()
        return 0
      }
      timerRef.current = setTimeout(() => setClickCount(0), 1500)
      return next
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel — slides from LEFT */}
          <motion.div
            key="panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-72 z-[70] flex flex-col backdrop-blur-[20px] bg-white/[.92] dark:bg-dark-bg/95 border-r border-white/[.20] dark:border-white/[.10] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[.20] dark:border-white/[.10]">
              <span className="font-bold text-lg text-burgundy dark:text-gold tracking-wide">Everton.dev</span>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-lg hover:bg-gray-200/60 dark:hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body — Appearance only */}
            <div className="flex-1 px-6 py-6">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                Appearance
              </p>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[.50] dark:bg-white/[.05] border border-white/[.30] dark:border-white/[.08]">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </p>
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="p-2.5 rounded-lg bg-burgundy/10 hover:bg-burgundy/20 dark:bg-gold/10 dark:hover:bg-gold/20 transition-colors"
                >
                  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>
              </div>
            </div>

            {/* Footer — copyright left, secret trigger right (no label/hint) */}
            <div className="px-6 py-4 border-t border-white/[.20] dark:border-white/[.10] flex items-center justify-between">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                &copy; {new Date().getFullYear()} Everton Anyiro
              </p>
              <button
                onClick={handleSecretClick}
                className="w-2.5 h-2.5 rounded-full bg-gray-300/60 dark:bg-gray-600/60 hover:bg-gray-400/80 dark:hover:bg-gray-500/80 transition-colors"
                aria-label=""
                tabIndex={-1}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}