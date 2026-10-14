import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import SidePanel from './SidePanel'
import NotificationBell from './NotificationBell'

const links = [
  { to: '/', label: 'Home' },
  { to: '/skills', label: 'Skills' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [panelOpen, setPanelOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-[12px] bg-white/[.15] dark:bg-dark-bg/80 border-b border-white/[.20] dark:border-white/[.08]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">

          <button onClick={() => setPanelOpen(true)} aria-label="Open menu"
            className="p-2 rounded-lg text-burgundy dark:text-gold hover:bg-burgundy/10 dark:hover:bg-gold/10 transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <span className="font-bold text-xl text-burgundy dark:text-gold tracking-wide mr-auto">Everton.dev</span>

          <div className="hidden md:flex items-center gap-7">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-200 ${isActive
                    ? 'text-burgundy dark:text-gold border-b-2 border-burgundy dark:border-gold pb-0.5'
                    : 'text-gray-600 dark:text-gray-300 hover:text-burgundy dark:hover:text-gold'}`
                }>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell />
          </div>
        </div>
      </nav>
      <SidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  )
}