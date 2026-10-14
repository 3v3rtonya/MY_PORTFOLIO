import React from 'react'
import { motion } from 'framer-motion'
import PageTransitionWrapper from '../components/PageTransitionWrapper'
import TimelineComponent from '../components/TimelineComponent'
import GlassmorphismCard from '../components/GlassmorphismCard'
import { useCV } from '../hooks/useCV'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { scrollRevealVariants } from '../animations/variants'

const BIO = `I'm a final-year BBIT student at Dedan Kimathi University of Technology, majoring in Cybersecurity & Networking. I'm driven by curiosity — I love exploring new challenges and engineering solutions that make a real difference through technology. My core passion lies in cybersecurity, backed by Cisco certifications in Intro to Cybersecurity, Networking, Python Essentials 1 & 2, and Linux System Administration. Along the way, I picked up full-stack web development as an additional craft — and it quickly became something I genuinely enjoy. I build systems that solve real-world problems, from hotel inventory management to university digitization platforms.`

export default function AboutPage() {
  const { downloadCV, cvError } = useCV()
  const bio = useScrollReveal()
  const logo = useScrollReveal()

  return (
    <PageTransitionWrapper>
      <div className="min-h-screen pt-24 pb-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-16">
          About <span className="text-burgundy">Me</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start mb-20">
          {/* DeKUT card */}
          <motion.div ref={logo.ref} variants={scrollRevealVariants} initial="hidden" animate={logo.isInView ? 'visible' : 'hidden'}>
            <GlassmorphismCard className="p-8 flex flex-col items-center gap-5">
              <div className="min-w-[150px] w-48 h-36 bg-gradient-to-br from-gold/20 to-burgundy/10 rounded-xl flex flex-col items-center justify-center border border-gold/30 p-4">
                <div className="text-4xl font-extrabold text-gold tracking-widest">DeKUT</div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-2 text-center leading-tight uppercase tracking-wide">Dedan Kimathi University of Technology</div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800 dark:text-white">BSc. Business &amp; IT</p>
                <p className="text-sm text-burgundy dark:text-gold mt-0.5">Cybersecurity &amp; Networking</p>
              </div>
              <div>
                <button onClick={downloadCV} className="px-6 py-2.5 rounded-xl bg-burgundy text-white font-semibold text-sm hover:bg-burgundy/90 active:scale-95 transition-all">
                  Download CV
                </button>
                {cvError && <p className="text-red-500 text-xs mt-1 text-center">{cvError}</p>}
              </div>
            </GlassmorphismCard>
          </motion.div>

          {/* Bio */}
          <motion.div ref={bio.ref} variants={scrollRevealVariants} initial="hidden" animate={bio.isInView ? 'visible' : 'hidden'}>
            <GlassmorphismCard className="p-8">
              <h3 className="text-xl font-bold text-burgundy dark:text-gold mb-4">My Story</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{BIO}</p>
            </GlassmorphismCard>
          </motion.div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">
            My <span className="text-burgundy">Journey</span>
          </h3>
          <GlassmorphismCard className="p-8 max-w-2xl mx-auto">
            <TimelineComponent />
          </GlassmorphismCard>
        </div>
      </div>
    </PageTransitionWrapper>
  )
}
