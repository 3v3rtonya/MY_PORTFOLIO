import React from 'react'

export default function FilterControl({ tags, activeTag, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button onClick={() => onSelect(null)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${activeTag === null ? 'bg-burgundy text-white' : 'bg-white/20 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-burgundy/20'}`}>
        All
      </button>
      {tags.map(tag => (
        <button key={tag} onClick={() => onSelect(tag)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${activeTag === tag ? 'bg-burgundy text-white' : 'bg-white/20 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-burgundy/20'}`}>
          {tag}
        </button>
      ))}
    </div>
  )
}
