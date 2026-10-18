import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import PageTransitionWrapper from '../components/PageTransitionWrapper'
import GlassmorphismCard from '../components/GlassmorphismCard'
import ContactForm from '../components/ContactForm'
import { fetchSocialLinks } from '../api/client'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { scrollRevealVariants } from '../animations/variants'
import {
  MailIcon, LocationIcon, PhoneIcon,
  GitHubIcon, LinkedInIcon,
  FacebookIcon, XIcon,
  InstagramIcon, WhatsAppIcon,
} from '../components/Icons'

// Fallback defaults — shown only when admin hasn't saved a value yet
const DEFAULTS = {
  email:     'everton.anyiro@gmail.com',
  github:    'https://github.com/evertonanyiro',
  linkedin:  'https://linkedin.com/in/evertonanyiro',
  facebook:  'https://facebook.com/evertonanyiro',
  x:         'https://x.com/evertonanyiro',
  instagram: 'https://instagram.com/evertonanyiro',
  whatsapp:  'https://wa.me/254700000000',
  phone:     '',
}

export default function ContactPage() {
  const { ref, isInView } = useScrollReveal()

  const { data: social } = useQuery({
    queryKey: ['social-links'],
    queryFn: fetchSocialLinks,
    staleTime: 60000,
  })

  const s = {
    email:     (social?.email     || DEFAULTS.email).trim(),
    github:    (social?.github    || DEFAULTS.github).trim(),
    linkedin:  (social?.linkedin  || DEFAULTS.linkedin).trim(),
    facebook:  (social?.facebook  || DEFAULTS.facebook).trim(),
    x:         (social?.x         || DEFAULTS.x).trim(),
    instagram: (social?.instagram || DEFAULTS.instagram).trim(),
    whatsapp:  (social?.whatsapp  || DEFAULTS.whatsapp).trim(),
    phone:     (social?.phone     || DEFAULTS.phone).trim(),
  }

  const whatsappHref = s.whatsapp
    ? (s.whatsapp.startsWith('http') ? s.whatsapp : `https://wa.me/${s.whatsapp.replace(/\D/g, '')}`)
    : DEFAULTS.whatsapp

  const SOCIAL = [
    s.email    && { icon: <MailIcon />,      label: s.email,                              href: `mailto:${s.email}`,                     target: '_self'  },
    s.phone    && { icon: <PhoneIcon />,     label: s.phone,                              href: `tel:${s.phone}`,                        target: '_self'  },
    s.github   && { icon: <GitHubIcon />,    label: s.github.replace('https://', ''),     href: s.github,                                target: '_blank' },
    s.linkedin && { icon: <LinkedInIcon />,  label: s.linkedin.replace('https://', ''),   href: s.linkedin,                              target: '_blank' },
    s.facebook && { icon: <FacebookIcon />,  label: s.facebook.replace('https://', ''),   href: s.facebook,                              target: '_blank' },
    s.x        && { icon: <XIcon />,         label: s.x.replace('https://', ''),          href: s.x,                                     target: '_blank' },
    s.instagram && { icon: <InstagramIcon />, label: s.instagram.replace('https://', ''), href: s.instagram,                             target: '_blank' },
    s.whatsapp && { icon: <WhatsAppIcon />,  label: 'WhatsApp',                           href: whatsappHref,                            target: '_blank' },
  ].filter(Boolean)

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

              {/* Social links — live from backend */}
              <div className="flex flex-col gap-3 flex-1">
                {SOCIAL.map(({ icon, label, href, target }) => (
                  <a
                    key={href}
                    href={href}
                    target={target}
                    rel="noreferrer"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-burgundy dark:hover:text-gold transition-colors text-sm"
                  >
                    {icon}
                    <span className="truncate">{label}</span>
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
