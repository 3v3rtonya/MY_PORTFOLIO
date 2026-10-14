import React from 'react'
import { motion } from 'framer-motion'
import PageTransitionWrapper from '../components/PageTransitionWrapper'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { scrollRevealVariants } from '../animations/variants'

const CATEGORIES = [
  {
    id: 'programming',
    title: 'Programming Languages',
    accent: '#800020',
    skills: [
      { name: 'Python', logo: '/skills/python.png' },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    accent: '#D4AF37',
    skills: [
      { name: 'HTML5',        logo: '/skills/html.png'      },
      { name: 'CSS3',         logo: '/skills/css3.jfif'     },
      { name: 'React.js',     logo: '/skills/react.png'     },
      { name: 'Tailwind CSS', logo: '/skills/tailwind.jfif' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    accent: '#800020',
    skills: [
      { name: 'FastAPI', logo: '/skills/api.jfif'  },
      { name: 'Flask',   logo: '/skills/flask.png' },
    ],
  },
  {
    id: 'database',
    title: 'Database',
    accent: '#D4AF37',
    skills: [
      { name: 'PostgreSQL', logo: '/skills/post.png' },
      { name: 'SQL',        logo: '/skills/sql.jfif' },
    ],
  },
  {
    id: 'cyber',
    title: 'Cybersecurity & Networking',
    accent: '#800020',
    skills: [
      { name: 'Cybersecurity', logo: '/skills/cyber.jfif'       },
      { name: 'Networking',    logo: '/skills/networking.jfif'   },
      { name: 'Linux',         logo: '/skills/linux.png'         },
    ],
  },
]

const CERTS = [
  'Introduction to Cybersecurity',
  'Introduction to Networking',
  'Python Essentials 1',
  'Python Essentials 2',
  'Linux System Administration',
]

function TechCard({ skill }) {
  return (
    <div className={[
      'flex flex-col items-center justify-center gap-3',
      'w-28 h-32',
      'backdrop-blur-[12px]',
      'bg-white/[.20] dark:bg-white/[.06]',
      'border border-white/[.25] dark:border-white/[.10]',
      'rounded-xl shadow-md',
      'cursor-default select-none',
      'transition-transform duration-300 ease-out',
      'hover:scale-110 hover:shadow-xl',
      'hover:border-white/[.45] dark:hover:border-white/[.25]',
    ].join(' ')}>
      <img
        src={skill.logo}
        alt={skill.name}
        className="w-12 h-12 object-contain rounded"
        loading="lazy"
      />
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center leading-tight px-1">
        {skill.name}
      </span>
    </div>
  )
}

function CategoryCard({ category }) {
  const { ref, isInView } = useScrollReveal(0.15)
  return (
    <motion.div
      ref={ref}
      variants={scrollRevealVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="w-full backdrop-blur-[12px] bg-white/[.15] dark:bg-white/[.08] border border-white/[.20] dark:border-white/[.12] rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: category.accent }} />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-widest uppercase">
          {category.title}
        </h3>
      </div>
      <div className="flex flex-wrap gap-4">
        {category.skills.map(skill => (
          <TechCard key={skill.name} skill={skill} />
        ))}
      </div>
    </motion.div>
  )
}

function CertBadge({ name }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-[12px] bg-white/[.12] dark:bg-white/[.06] border border-gold/30 text-sm font-medium">
      <span className="text-xs font-bold text-gold tracking-widest">CISCO</span>
      <span className="text-gray-700 dark:text-gray-300">{name}</span>
    </div>
  )
}

export default function SkillsPage() {
  const certsReveal = useScrollReveal(0.1)
  return (
    <PageTransitionWrapper>
      <div className="min-h-screen pt-24 pb-20 px-4 md:px-10 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            My <span className="text-burgundy">Skills</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">Technologies and tools I work with</p>
        </div>

        <div className="flex flex-col gap-5">
          {CATEGORIES.map(cat => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>

        <motion.div
          ref={certsReveal.ref}
          variants={scrollRevealVariants}
          initial="hidden"
          animate={certsReveal.isInView ? 'visible' : 'hidden'}
          className="mt-14"
        >
          <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Cisco <span className="text-burgundy">Certifications</span>
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {CERTS.map(c => <CertBadge key={c} name={c} />)}
          </div>
        </motion.div>
      </div>
    </PageTransitionWrapper>
  )
}
