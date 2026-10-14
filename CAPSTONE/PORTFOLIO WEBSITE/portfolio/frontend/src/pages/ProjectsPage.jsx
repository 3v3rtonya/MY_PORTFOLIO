import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransitionWrapper from '../components/PageTransitionWrapper'
import ProjectCard from '../components/ProjectCard'
import FilterControl from '../components/FilterControl'
import { fetchProjects, fetchMediaByCategory } from '../api/client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function resolveImg(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${API_URL}${url}`
}

// ── VideoCard ─────────────────────────────────────────────────────────────────
function VideoCard({ item }) {
  const hasUrl      = item.drive_url && item.drive_url.trim() !== ''
  const hasAbstract = item.abstract  && item.abstract.trim()  !== ''
  const thumbSrc    = resolveImg(item.thumbnail)
  const [showAbstract, setShowAbstract] = useState(false)

  function getEmbedUrl(url) {
    if (!url) return null
    const match = url.match(/\/file\/d\/([^/]+)/)
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`
    return url
  }

  const embedUrl = getEmbedUrl(item.drive_url)

  return (
    <div className="backdrop-blur-[12px] bg-white/[.15] dark:bg-white/[.08] border border-white/[.20] dark:border-white/[.12] rounded-2xl overflow-hidden shadow-lg flex flex-col">
      {/* Video / placeholder */}
      <div className="relative w-full bg-gray-900 rounded-t-2xl overflow-hidden" style={{ paddingTop: '56.25%' }}>
        {hasUrl ? (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay"
            allowFullScreen
            title={item.title}
          />
        ) : thumbSrc ? (
          <img src={thumbSrc} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-burgundy/20 to-gold/10">
            <div className="w-16 h-16 rounded-full bg-burgundy/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-burgundy/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <p className="text-gray-400 text-xs text-center px-4">Video not yet uploaded</p>
            <p className="text-gray-500 text-[10px]">Upload via Admin Dashboard</p>
          </div>
        )}
      </div>

      <div className="px-4 pt-3 pb-4 flex flex-col gap-2">
        <p className="font-semibold text-gray-800 dark:text-white text-sm">{item.title}</p>

        {hasAbstract && (
          <button
            onClick={() => setShowAbstract(v => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-burgundy dark:text-gold hover:opacity-80 active:scale-95 transition-all w-fit"
            aria-expanded={showAbstract}
          >
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showAbstract ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {showAbstract ? 'Hide Abstract' : 'Click for more'}
          </button>
        )}

        <AnimatePresence>
          {showAbstract && hasAbstract && (
            <motion.div key="abstract" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="mt-1 p-3 rounded-xl bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10">
                <p className="text-xs font-semibold text-burgundy dark:text-gold mb-1 uppercase tracking-wide">Abstract</p>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{item.abstract}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!hasAbstract && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">No abstract — add via Admin Dashboard</p>
        )}
      </div>
    </div>
  )
}

// ── CVCard ────────────────────────────────────────────────────────────────────
function CVCard({ item }) {
  const hasUrl   = item.drive_url && item.drive_url.trim() !== ''
  const thumbSrc = resolveImg(item.thumbnail)

  return (
    <div className="backdrop-blur-[12px] bg-white/[.15] dark:bg-white/[.08] border border-white/[.20] dark:border-white/[.12] rounded-2xl overflow-hidden shadow-lg flex flex-col">
      {/* Thumbnail strip */}
      <div className="w-full h-28 bg-gradient-to-br from-burgundy/10 to-gold/10 overflow-hidden flex-shrink-0">
        {thumbSrc
          ? <img src={thumbSrc} alt={item.title} className="w-full h-full object-cover" />
          : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-10 h-10 text-burgundy/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
          )
        }
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <p className="font-semibold text-gray-800 dark:text-white text-sm">{item.title}</p>
        {!hasUrl && <p className="text-xs text-gray-400 dark:text-gray-500">Link not yet added</p>}
        {hasUrl ? (
          <a
            href={item.drive_url}
            target="_blank"
            rel="noreferrer"
            className="mt-auto w-full py-2.5 rounded-xl bg-burgundy text-white text-sm font-semibold hover:bg-burgundy/90 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            CLICK FOR MORE
          </a>
        ) : (
          <button disabled className="mt-auto w-full py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-sm font-semibold cursor-not-allowed">
            CLICK FOR MORE
          </button>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const [activeTag, setActiveTag] = useState(null)

  const { data: projects = [], isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 0,
    refetchInterval: 10000,
    retry: 2,
    retryDelay: 1000,
  })

  const { data: videos = [] } = useQuery({
    queryKey: ['media-capstone'],
    queryFn: () => fetchMediaByCategory('capstone_video'),
    staleTime: 30000,
    retry: 1,
  })

  const { data: cvDocs = [] } = useQuery({
    queryKey: ['media-cv'],
    queryFn: () => fetchMediaByCategory('cv_document'),
    staleTime: 30000,
    retry: 1,
  })

  const allTags = useMemo(() => {
    const s = new Set()
    projects.forEach(p => (p.tech_stack || []).forEach(t => s.add(t)))
    return [...s].sort()
  }, [projects])

  const filtered = activeTag
    ? projects.filter(p => (p.tech_stack || []).includes(activeTag))
    : projects

  return (
    <PageTransitionWrapper>
      <div className="min-h-screen pt-24 pb-20 px-6 max-w-6xl mx-auto">

        {/* My Projects */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            My <span className="text-burgundy">Projects</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Systems I have built to solve real problems</p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-burgundy border-t-transparent animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading projects...</p>
          </div>
        )}

        {!isLoading && isError && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-300 font-medium">Could not load projects</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                {error?.message === 'Network Error' ? 'Backend is not running.' : 'Something went wrong.'}
              </p>
            </div>
            <button onClick={() => refetch()} className="px-6 py-2 rounded-xl bg-burgundy text-white text-sm font-semibold hover:bg-burgundy/90">Retry</button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="mb-8 relative">
              <FilterControl tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />
              {isFetching && (
                <div className="absolute top-0 right-0 flex items-center gap-1.5 text-xs text-gray-400">
                  <div className="w-3 h-3 rounded-full border-2 border-burgundy border-t-transparent animate-spin" />
                  <span>Refreshing</span>
                </div>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 dark:text-gray-500 text-lg">No projects found.</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Add projects from the admin dashboard.</p>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(p => (
                  <motion.div key={p.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <ProjectCard project={p} />
                  </motion.div>
                ))}
                {filtered.length === 0 && projects.length > 0 && (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-gray-400">No projects match this filter.</p>
                    <button onClick={() => setActiveTag(null)} className="mt-3 text-burgundy dark:text-gold text-sm hover:underline">Clear filter</button>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}

        {/* ── IGS CAPSTONE PROJECT 4101 ── */}
        <div className="mt-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-burgundy/30 to-transparent" />
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                IGS <span className="text-burgundy">CAPSTONE</span> PROJECT <span className="text-gold">4101</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Final Year Capstone Project Documentation</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-burgundy/30 to-transparent" />
          </div>

          {/* Videos */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-burgundy/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-burgundy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Project Videos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videos.length > 0
                ? videos.map(v => <VideoCard key={v.id} item={v} />)
                : [1, 2, 3].map(i => (
                  <VideoCard key={i} item={{ id: i, title: `Project Demo - Part ${i}`, drive_url: '', abstract: '', thumbnail: null }} />
                ))
              }
            </div>
          </div>

          {/* CVs / Documents */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Documents &amp; CVs</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cvDocs.length > 0
                ? cvDocs.map(d => <CVCard key={d.id} item={d} />)
                : [
                    { id: 1, title: 'Everton Anyiro - Full CV', drive_url: '', thumbnail: null },
                    { id: 2, title: 'Technical Resume', drive_url: '', thumbnail: null },
                    { id: 3, title: 'Academic Transcript', drive_url: '', thumbnail: null },
                  ].map(d => <CVCard key={d.id} item={d} />)
              }
            </div>
          </div>

          {/* View Full IGS Folder Button — below Documents & CVs */}
          <div className="flex justify-center pt-2">
            <a
              href="https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-burgundy to-burgundy/80 text-white font-semibold text-sm shadow-lg hover:shadow-burgundy/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 87.3 78" fill="currentColor">
                <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="M43.65 25L29.9 1.4C28.55.5 26.95 0 25.3 0 23.65 0 22.05.5 20.7 1.4L3.85 29.5 17.2 53z" fill="#00ac47"/>
                <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l6.45 12.4z" fill="#ea4335"/>
                <path d="M43.65 25L57.4 1.4C56.05.5 54.45 0 52.8 0H34.5c-1.65 0-3.25.5-4.6 1.4z" fill="#00832d"/>
                <path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.4 4.5-1.2z" fill="#2684fc"/>
                <path d="M73.4 26.5l-16.85-29.1C55.2.5 53.6 0 51.95 0h-1.65l-6.65 25 15.85 28H87.3c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
              </svg>
              Click to view full IGS [4101] CAPSTONE PROJECTS
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

        </div>
      </div>
    </PageTransitionWrapper>
  )
}
