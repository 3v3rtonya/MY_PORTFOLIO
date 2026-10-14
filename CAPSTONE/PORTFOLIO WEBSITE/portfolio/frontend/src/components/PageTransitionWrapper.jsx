import React from 'react'
import { motion } from 'framer-motion'
import { pageVariants } from '../animations/variants'

export default function PageTransitionWrapper({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  )
}
