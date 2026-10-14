import React from 'react'

export default function CertificationBadge({ name }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-[12px] bg-gold/10 border border-gold/30 text-sm font-medium">
      <span className="text-gold font-bold text-xs tracking-widest">CISCO</span>
      <span className="text-gray-700 dark:text-gray-300">{name}</span>
    </div>
  )
}
