import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchSocialLinks } from '../api/client'
import {
  GitHubIcon, LinkedInIcon, MailIcon,
  FacebookIcon, XIcon, InstagramIcon, WhatsAppIcon,
} from './Icons'

const navLinks = [
  { to: '/',         label: 'Home'     },
  { to: '/skills',   label: 'Skills'   },
  { to: '/projects', label: 'Projects' },
  { to: '/contact',  label: 'Contact'  },
]

// Default fallbacks — shown only when the admin hasn't saved a value yet
const DEFAULTS = {
  github:    'https://github.com/evertonanyiro',
  linkedin:  'https://linkedin.com/in/evertonanyiro',
  facebook:  'https://facebook.com/evertonanyiro',
  x:         'https://x.com/evertonanyiro',
  instagram: 'https://instagram.com/evertonanyiro',
  whatsapp:  'https://wa.me/254700000000',
  email:     'everton.anyiro@gmail.com',
  phone:     '',
}

export default function Footer() {
  const { data: social } = useQuery({
    queryKey: ['social-links'],
    queryFn: fetchSocialLinks,
    staleTime: 60000,
  })

  // Merge saved values over defaults — saved value wins if non-empty
  const s = {
    github:    (social?.github    || DEFAULTS.github).trim(),
    linkedin:  (social?.linkedin  || DEFAULTS.linkedin).trim(),
    facebook:  (social?.facebook  || DEFAULTS.facebook).trim(),
    x:         (social?.x         || DEFAULTS.x).trim(),
    instagram: (social?.instagram || DEFAULTS.instagram).trim(),
    whatsapp:  (social?.whatsapp  || DEFAULTS.whatsapp).trim(),
    email:     (social?.email     || DEFAULTS.email).trim(),
    phone:     (social?.phone     || DEFAULTS.phone).trim(),
  }

  const SOCIALS = [
    s.github    && { Icon: GitHubIcon,    href: s.github,                         label: 'GitHub'    },
    s.linkedin  && { Icon: LinkedInIcon,  href: s.linkedin,                       label: 'LinkedIn'  },
    s.facebook  && { Icon: FacebookIcon,  href: s.facebook,                       label: 'Facebook'  },
    s.x         && { Icon: XIcon,         href: s.x,                              label: 'X'         },
    s.instagram && { Icon: InstagramIcon, href: s.instagram,                      label: 'Instagram' },
    s.whatsapp  && { Icon: WhatsAppIcon,  href: s.whatsapp.startsWith('http') ? s.whatsapp : `https://wa.me/${s.whatsapp.replace(/\D/g,'')}`, label: 'WhatsApp' },
  ].filter(Boolean)

  const whatsappHref = s.whatsapp
    ? (s.whatsapp.startsWith('http') ? s.whatsapp : `https://wa.me/${s.whatsapp.replace(/\D/g,'')}`)
    : DEFAULTS.whatsapp

  return (
    <footer className="mt-auto bg-burgundy">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand + social icon row */}
          <div>
            <p className="font-extrabold text-xl text-gold mb-2 tracking-wide">Everton.dev</p>
            <p className="text-xs text-beige/70 leading-relaxed mb-4">
              Final-year BSc. BBIT student at DeKUT<br />
              Majoring in Cybersecurity &amp; Networking
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="text-beige/70 hover:text-gold transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-beige/60 mb-3">Navigation</p>
            <ul className="flex flex-col gap-2">
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-beige/80 hover:text-gold transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-beige/60 mb-3">Get In Touch</p>
            <div className="flex flex-col gap-3">
              {s.email && (
                <a
                  href={`mailto:${s.email}`}
                  className="flex items-center gap-2 text-sm text-beige/80 hover:text-gold transition-colors"
                >
                  <MailIcon /> {s.email}
                </a>
              )}
              {s.whatsapp && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-beige/80 hover:text-gold transition-colors"
                >
                  <WhatsAppIcon /> WhatsApp
                </a>
              )}
              {s.instagram && (
                <a
                  href={s.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-beige/80 hover:text-gold transition-colors"
                >
                  <InstagramIcon /> {s.instagram.replace('https://', '')}
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-beige/60">
            &copy; {new Date().getFullYear()} Everton Anyiro. All rights reserved.
          </p>
          <p className="text-xs text-beige/60">
            Built with React &middot; FastAPI &middot; PostgreSQL
          </p>
        </div>
      </div>
    </footer>
  )
}
