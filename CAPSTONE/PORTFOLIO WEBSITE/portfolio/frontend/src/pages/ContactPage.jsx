import React from 'react'
import { motion } from 'framer-motion'
import PageTransitionWrapper from '../components/PageTransitionWrapper'
import GlassmorphismCard from '../components/GlassmorphismCard'
import ContactForm from '../components/ContactForm'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { scrollRevealVariants } from '../animations/variants'
import {
  MailIcon, LocationIcon,
  GitHubIcon, LinkedInIcon,
  FacebookIcon, XIcon,
  InstagramIcon, WhatsAppIcon,
} from '../components/Icons'

const SOCIAL = [
  { icon: <MailIcon />,      label: 'everton.anyiro@gmail.com',      href: 'mailto:everton.anyiro@gmail.com'        },
  { icon: <GitHubIcon />,    label: 'github.com/evertonanyiro',       href: 'https://github.com/evertonanyiro'       },
  { icon: <LinkedInIcon />,  label: 'linkedin.com/in/evertonanyiro',  href: 'https://linkedin.com/in/evertonanyiro'  },
  { icon: <FacebookIcon />,  label: 'facebook.com/evertonanyiro',     href: 'https://facebook.com/evertonanyiro'     },
  { icon: <XIcon />,         label: 'x.com/evertonanyiro',           href: 'https://x.com/evertonanyiro'            },
  { icon: <InstagramIcon />, label: 'instagram.com/evertonanyiro',    href: 'https://instagram.com/evertonanyiro'    },
  { icon: <WhatsAppIcon />,  label: '+254 700 000 000',               href: 'https://wa.me/254700000000'             },
]

export default function ContactPage() {
  const { ref, isInView } = useScrollReveal()

  return (
    <PageTransitionWrapper>
      <div className="min-h-screen pt-24 pb-20 px-6 max-w-5xl mx-auto">

        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Get In <span className="text-burgundy">Touch</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
            Have a project in mind? Let&apos;s work together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

          {/* Left — contact info */}
          <motion.div
            ref={ref}
            variants={scrollRevealVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="h-full"
          >
            <GlassmorphismCard className="p-7 h-full flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-bold text-burgundy dark:text-gold mb-1">Contact Me</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  Open to internship opportunities, freelance projects, and collaboration on interesting systems.
                </p>
              </div>

              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm">
                <LocationIcon /> Nyeri, Kenya
              </div>

              {/* Social links */}
              <div className="flex flex-col gap-3 flex-1">
                {SOCIAL.map(({ icon, label, href }) => (
                  <a
                    key={href}
                    href={href}
                    target={href.startsWith('mailto') ? '_self' : '_blank'}
                    rel="noreferrer"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-burgundy dark:hover:text-gold transition-colors text-sm"
                  >
                    {icon}
                    <span>{label}</span>
                  </a>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-white/[.20] dark:border-white/[.08]">
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                  I typically respond within 24 hours
                </p>
              </div>
            </GlassmorphismCard>
          </motion.div>

          {/* Right — contact form */}
          <GlassmorphismCard className="p-7 h-full">
            <h3 className="text-lg font-bold text-burgundy dark:text-gold mb-4">Send a Message</h3>
            <ContactForm />
          </GlassmorphismCard>

        </div>
      </div>
    </PageTransitionWrapper>
  )
}
