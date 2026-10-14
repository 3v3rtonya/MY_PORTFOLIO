import React from 'react'
import { GitHubIcon, ExternalLinkIcon } from './Icons'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function resolveImg(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${API_URL}${url}`
}

export default function ProjectCard({ project }) {
  const imageUrl = resolveImg(project.image_url)

  return (
    <div className="backdrop-blur-[12px] bg-white/[.15] dark:bg-white/[.08] border border-white/[.20] dark:border-white/[.12] shadow-lg rounded-2xl overflow-hidden flex flex-col">
      {/* Image */}
      <div className="w-full h-40 overflow-hidden bg-gradient-to-br from-burgundy/20 to-gold/10">
        {imageUrl ? (
          <img src={imageUrl} alt={project.title} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 flex flex-col items-center justify-center gap-2">
            <span className="text-5xl opacity-20">📁</span>
            <p className="text-xs text-gray-400 dark:text-gray-500">No image</p>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 px-4 py-3 gap-2">
        <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug line-clamp-1">
          {project.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 flex-1">
          {project.description}
        </p>

        {/* Tech stack tags */}
        <div className="flex flex-wrap gap-1.5">
          {project.tech_stack.slice(0, 5).map(t => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full bg-burgundy/10 text-burgundy dark:text-gold text-[10px] font-medium border border-burgundy/20"
            >
              {t}
            </span>
          ))}
          {project.tech_stack.length > 5 && (
            <span className="px-2 py-0.5 rounded-full bg-gray-200/50 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-[10px]">
              +{project.tech_stack.length - 5}
            </span>
          )}
        </div>

        {/* Links */}
        <div className="flex gap-3 pt-2 border-t border-white/20 dark:border-white/10">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-burgundy dark:hover:text-gold transition-colors"
            >
              <GitHubIcon /> GitHub
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-burgundy dark:hover:text-gold transition-colors"
            >
              <ExternalLinkIcon /> Live Demo
            </a>
          )}
          {!project.github_url && !project.live_url && (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">No links added</p>
          )}
        </div>
      </div>
    </div>
  )
}
