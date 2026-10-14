import React from 'react'
import { motion } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { timelineItemVariants } from '../animations/variants'
import { CheckIcon, ClockIcon } from './Icons'

const MILESTONES = [
  { label: 'Cisco: Introduction to Cybersecurity', status: 'Completed' },
  { label: 'Cisco: Introduction to Networking', status: 'Completed' },
  { label: 'Cisco: Python Essentials 1', status: 'Completed' },
  { label: 'Cisco: Python Essentials 2', status: 'Completed' },
  { label: 'Cisco: Linux System Administration', status: 'Completed' },
  { label: 'DeKUT BSc. BBIT — Cybersecurity & Networking', status: 'In Progress' },
]

function TimelineItem({ milestone, index }) {
  const { ref, isInView } = useScrollReveal(0.2)
  const done = milestone.status === 'Completed'
  return (
    <motion.div ref={ref} custom={index} variants={timelineItemVariants} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="flex items-start gap-4">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${done ? 'bg-gold/20 text-gold border border-gold/40' : 'bg-burgundy/20 text-burgundy border border-burgundy/40'}`}>
        {done ? <CheckIcon /> : <ClockIcon />}
      </div>
      <div>
        <p className="font-medium text-gray-800 dark:text-gray-200">{milestone.label}</p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${done ? 'bg-gold/10 text-gold' : 'bg-burgundy/10 text-burgundy'}`}>
          {milestone.status}
        </span>
      </div>
    </motion.div>
  )
}

export default function TimelineComponent() {
  return (
    <div className="flex flex-col gap-6 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-px before:bg-gold/20 pl-2">
      {MILESTONES.map((m, i) => <TimelineItem key={m.label} milestone={m} index={i} />)}
    </div>
  )
}
