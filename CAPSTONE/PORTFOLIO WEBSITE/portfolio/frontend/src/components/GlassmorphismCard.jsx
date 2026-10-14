import React from 'react'

export default function GlassmorphismCard({ children, className = '' }) {
  return (
    <div className={`backdrop-blur-[12px] bg-white/[.15] dark:bg-white/[.08] border border-white/[.20] dark:border-white/[.12] rounded-xl shadow-lg transition-transform duration-300 ease-out hover:-translate-y-[6px] ${className}`}>
      {children}
    </div>
  )
}
