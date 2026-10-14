import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PageTransitionWrapper from '../components/PageTransitionWrapper'
import ParticleBackground from '../components/ParticleBackground'
import TypewriterComponent from '../components/TypewriterComponent'
import { useCV } from '../hooks/useCV'
import { ChevronDownIcon } from '../components/Icons'
import { fetchSocialLinks } from '../api/client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const BIO = `I'm a final-year BBIT student at Dedan Kimathi University of Technology, majoring in Cybersecurity & Networking. I'm driven by curiosity — I love exploring new challenges and engineering solutions that make a real difference through technology. My core passion lies in cybersecurity, backed by Cisco certifications in Intro to Cybersecurity, Networking, Python Essentials 1 & 2, and Linux System Administration. Along the way, I picked up full-stack web development as an additional craft — and it quickly became something I genuinely enjoy. I build systems that solve real-world problems, from hotel inventory management to university digitization platforms.`

// ── Flip Card ─────────────────────────────────────────────────────────────────
function FlipCard({ photoUrl, backImages = [] }) {
  const [flipped, setFlipped] = useState(false)
  const hasBackImages = backImages.length > 0

  const gridCols = backImages.length === 1 ? 'grid-cols-1' : backImages.length === 2 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div
      className="w-full h-full cursor-pointer"
      style={{ perspective: '1200px' }}
      onClick={() => setFlipped(f => !f)}
    >
      {/* Flip container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT — My Story ───────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          className="rounded-2xl backdrop-blur-[12px] bg-white/[.15] dark:bg-white/[.08] border border-white/[.20] dark:border-white/[.12] shadow-xl flex flex-col p-8 overflow-y-auto"
        >
          {/* Flip hint */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-extrabold text-burgundy dark:text-gold tracking-tight">
              My Story
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 select-none">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              flip
            </span>
          </div>

          <div className="w-12 h-1 rounded-full bg-burgundy mb-5" />

          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
            {BIO}
          </p>

          {/* Decorative bottom accent */}
          <div className="mt-6 pt-4 border-t border-white/[.20] dark:border-white/[.08] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-burgundy" />
            <div className="w-2 h-2 rounded-full bg-gold" />
            <div className="w-2 h-2 rounded-full bg-burgundy/40" />
            <p className="text-xs text-gray-400 dark:text-gray-500 ml-1">
              {hasBackImages ? 'Tap to see back' : 'Tap to see photo'}
            </p>
          </div>
        </div>

        {/* ── BACK ──────────────────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="rounded-2xl overflow-hidden shadow-xl border border-white/[.20] dark:border-white/[.12]"
        >
          {hasBackImages ? (
            /* Grid of back images */
            <div className={`grid ${gridCols} w-full h-full`}>
              {backImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Profile photo ${i + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ))}
            </div>
          ) : photoUrl ? (
            <img
              src={photoUrl}
              alt="Everton Anyiro"
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            /* Placeholder when no photo uploaded yet */
            <div className="w-full h-full bg-gradient-to-br from-burgundy/20 via-gold/10 to-burgundy/30 flex flex-col items-center justify-center gap-4 backdrop-blur-[12px]">
              <div className="w-24 h-24 rounded-full border-4 border-burgundy/30 bg-burgundy/10 flex items-center justify-center">
                <svg className="w-12 h-12 text-burgundy/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <div className="text-center px-6">
                <p className="text-burgundy/60 dark:text-gold/60 font-semibold text-sm">No photo uploaded yet</p>
                <p className="text-gray-400 text-xs mt-1">Upload from the admin dashboard</p>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                flip back
              </div>
            </div>
          )}

          {/* Overlay flip hint */}
          {(hasBackImages || photoUrl) && (
            <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
              <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-white/70 text-[10px]">flip</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── HomePage ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { downloadCV, cvError } = useCV()

  const { data: settings } = useQuery({
    queryKey: ['social-links'],
    queryFn: fetchSocialLinks,
    staleTime: 60000,
  })

  const photoUrl = settings?.photo_url ? `${API_URL}${settings.photo_url}` : null
  const backImages = (settings?.profile_back_images || []).map(u =>
    u.startsWith('http') ? u : `${API_URL}${u}`
  )

  return (
    <PageTransitionWrapper>

      {/* ── Hero — two side-by-side cards ─────────────────────────────────── */}
      <section className="relative min-h-screen pt-20 pb-10 overflow-hidden flex items-center">
        <ParticleBackground />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch min-h-[calc(100vh-140px)]">

            {/* ── LEFT CARD — Hero content ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="backdrop-blur-[12px] bg-white/[.15] dark:bg-white/[.08] border border-white/[.20] dark:border-white/[.12] rounded-2xl shadow-xl flex flex-col items-center justify-center text-center p-8 md:p-12 gap-6"
            >
              {/* Profile photo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-36 h-36 rounded-full border-4 border-burgundy shadow-2xl shadow-burgundy/20 overflow-hidden bg-gradient-to-br from-burgundy/20 to-gold/20 flex items-center justify-center flex-shrink-0"
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Everton Anyiro" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-20 h-20 text-burgundy/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                )}
              </motion.div>

              {/* Name + typewriter */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <p className="text-gray-500 dark:text-gray-400 text-base mb-1">Hi, I am</p>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
                  Everton Anyiro
                </h1>
                <div className="text-xl md:text-2xl mb-4 h-9">
                  <TypewriterComponent />
                </div>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed text-sm">
                  Final-year BBIT @ DeKUT &middot; Cybersecurity &amp; Networking &middot; Building systems that matter.
                </p>
              </motion.div>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full"
              >
                <Link
                  to="/projects"
                  className="px-7 py-2.5 rounded-xl bg-burgundy text-white font-semibold hover:bg-burgundy/90 active:scale-95 transition-all shadow-lg shadow-burgundy/25 text-sm"
                >
                  View My Projects
                </Link>
                <div>
                  <button
                    onClick={downloadCV}
                    className="px-7 py-2.5 rounded-xl border-2 border-burgundy text-burgundy dark:text-gold dark:border-gold font-semibold hover:bg-burgundy/10 active:scale-95 transition-all text-sm"
                  >
                    Download CV
                  </button>
                  {cvError && <p className="text-red-500 text-xs mt-1 text-center">{cvError}</p>}
                </div>
              </motion.div>

              {/* Skill chips */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-2 justify-center"
              >
                {['Python', 'React.js', 'FastAPI', 'PostgreSQL', 'Cybersecurity', 'Linux'].map(skill => (
                  <span key={skill} className="px-3 py-1 rounded-full text-xs font-medium bg-burgundy/10 text-burgundy dark:text-gold border border-burgundy/20">
                    {skill}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* ── RIGHT CARD — Flip card ────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
              className="min-h-[520px] lg:min-h-0"
            >
              <FlipCard photoUrl={photoUrl} backImages={backImages} />
            </motion.div>

          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
            className="flex justify-center mt-6"
          >
            <button
              onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
              className="text-burgundy dark:text-gold animate-bounce"
              aria-label="Scroll down"
            >
              <ChevronDownIcon />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[['3+', 'Projects Built'], ['5', 'Cisco Certs'], ['2+', 'Years Coding'], ['1', 'Final Year']].map(([num, label]) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="text-center backdrop-blur-[12px] bg-white/[.15] dark:bg-white/[.08] border border-white/[.20] dark:border-white/[.12] rounded-xl p-6"
            >
              <p className="text-3xl font-extrabold text-burgundy dark:text-gold">{num}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </PageTransitionWrapper>
  )
}
