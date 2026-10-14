export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25, ease: 'easeIn' } },
}
export const scrollRevealVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
export const timelineItemVariants = {
  hidden:  { opacity: 0, x: -24 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
}
