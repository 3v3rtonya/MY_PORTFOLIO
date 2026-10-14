import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

function resolveUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${API_URL}${url}`
}

// ── Flip Card ─────────────────────────────────────────────────────────────────
function FlipCard({ photoUrl, backImages = [] }) {
  const [flipped, setFlipped] = useState(false)
  const [slide, setSlide]     = useState(0)
  const [dir, setDir]         = useState(1)   // 1 = forward, -1 = backward

  // All slides: profile photo first, then back images
  const allSlides = [
    photoUrl ? { src: photoUrl, label: 'Profile Photo' } : null,
    ...backImages.map((src, i) => ({ src, label: `Photo ${i + 1}` })),
  ].filter(Boolean)

  const total = allSlides.length

  function prev(e) {
    e.stopPropagation()
    setDir(-1)
    setSlide(s => (s - 1 + total) % total)
  }

  function next(e) {
    e.stopPropagation()
    setDir(1)
    setSlide(s => (s + 1) % total)
  }

  // Slide variants — horizontal slide
  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  // When the card is flipped, reset to slide 0 each time
  function handleFlip() {
    if (!flipped) setSlide(0)
    setFlipped(f => !f)
  }

  const hasPhotos = total > 0

  return (
    <div
      className="w-full h-full cursor-pointer select-none"
      style={{ perspective: '1200px' }}
      onClick={handleFlip}
    >
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
        {/* ── FRONT — My Story ── */}
        <div
          style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className="rounded-2xl backdrop-blur-[12px] bg-white/[.15] dark:bg-white/[.08] border border-white/[.20] dark:border-white/[.12] shadow-xl flex flex-col p-8 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-extrabold text-burgundy dark:text-gold tracking-tight">My Story</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 select-none">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              flip
            </span>
          </div>
          <div className="w-12 h-1 rounded-full bg-burgundy mb-5" />
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1">{BIO}</p>
          <div className="mt-6 pt-4 border-t border-white/[.20] dark:border-white/[.08] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-burgundy" />
            <div className="w-2 h-2 rounded-full bg-gold" />
            <div className="w-2 h-2 rounded-full bg-burgundy/40" />
            <p className="text-xs text-gray-400 dark:text-gray-500 ml-1">
              {hasPhotos ? `Tap to see photos (${total})` : 'Tap to see photo'}
            </p>
          </div>
        </div>

        {/* ── BACK — Photo carousel ── */}
        <div
          style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="rounded-2xl overflow-hidden shadow-xl border border-white/[.20] dark:border-white/[.12] bg-gray-900"
        >
          {hasPhotos ? (
            <>
              {/* Slides */}
              <div className="relative w-full h-full overflow-hidden">
                <AnimatePresence initial={false} custom={dir} mode="popLayout">
                  <motion.img
                    key={slide}
                    src={allSlides[slide].src}
                    alt={allSlides[slide].label}
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                  />
                </AnimatePresence>

                {/* Arrows — only when more than 1 photo */}
                {total > 1 && (
                  <>
                    {/* Left arrow */}
                    <button
                      onClick={prev}
                      aria-label="Previous photo"
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 active:scale-90 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Right arrow */}
                    <button
                      onClick={next}
                      aria-label="Next photo"
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 active:scale-90 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Dot indicators */}
                {total > 1 && (
                  <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {allSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setDir(i > slide ? 1 : -1); setSlide(i) }}
                        aria-label={`Go to photo ${i + 1}`}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                          i === slide
                            ? 'bg-white scale-125'
                            : 'bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Slide label + flip-back hint at bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 pt-6 pb-3 flex items-end justify-between z-10">
                  <span className="text-white/80 text-xs font-medium">
                    {total > 1 ? `${slide + 1} / ${total}` : allSlides[0]?.label}
                  </span>
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-white/70 text-[10px]">flip</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* No photos uploaded yet */
            <div className="w-full h-full bg-gradient-to-br from-burgundy/20 via-gold/10 to-burgundy/30 flex flex-col items-center justify-center gap-4 backdrop-blur-[12px]">
              <div className="w-24 h-24 rounded-full border-4 border-burgundy/30 bg-burgundy/10 flex items-center justify-center">
                <svg className="w-12 h-12 text-burgundy/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <div className="text-center px-6">
                <p className="text-burgundy/60 dark:text-gold/60 font-semibold text-sm">No photos uploaded yet</p>
                <p className="text-gray-400 text-xs mt-1">Upload from Admin → Profile Photo</p>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                flip back
              </div>
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

  const photoUrl   = settings?.photo_url
    ? resolveUrl(settings.photo_url)
    : null

  const backImages = (settings?.profile_back_images || [])
    .map(resolveUrl)
    .filter(Boolean)

  return (
    <PageTransitionWrapper>

      {/* ── Hero ── */}
      <section className="relative min-h-screen pt-20 pb-10 overflow-hidden flex items-center">
        <ParticleBackground />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch min-h-[calc(100vh-140px)]">

            {/* LEFT — Hero content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="backdrop-blur-[12px] bg-white/[.15] dark:bg-white/[.08] border border-white/[.20] dark:border-white/[.12] rounded-2xl shadow-xl flex flex-col items-center justify-center text-center p-8 md:p-12 gap-6"
            >
              {/* Profile photo circle */}
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

            {/* RIGHT — Flip card (My Story ↔ photo carousel) */}
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

      {/* ── Stats strip ── */}
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
