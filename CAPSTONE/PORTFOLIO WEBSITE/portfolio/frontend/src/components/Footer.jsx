import React from 'react'
import { Link } from 'react-router-dom'
import {
  GitHubIcon, LinkedInIcon, MailIcon,
  FacebookIcon, XIcon, InstagramIcon, WhatsAppIcon,
} from './Icons'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/skills', label: 'Skills' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
]

const SOCIALS = [
  { Icon: GitHubIcon,    href: 'https://github.com/evertonanyiro',      label: 'GitHub'     },
  { Icon: LinkedInIcon,  href: 'https://linkedin.com/in/evertonanyiro', label: 'LinkedIn'   },
  { Icon: FacebookIcon,  href: 'https://facebook.com/evertonanyiro',    label: 'Facebook'   },
  { Icon: XIcon,         href: 'https://x.com/evertonanyiro',           label: 'X'          },
  { Icon: InstagramIcon, href: 'https://instagram.com/evertonanyiro',   label: 'Instagram'  },
  { Icon: WhatsAppIcon,  href: 'https://wa.me/254700000000',            label: 'WhatsApp'   },
]

export default function Footer() {
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
                  <Link to={to} className="text-sm text-beige/80 hover:text-gold transition-colors transition-colors">
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
              <a href="mailto:everton.anyiro@gmail.com"
                className="flex items-center gap-2 text-sm text-beige/80 hover:text-gold transition-colors transition-colors">
                <MailIcon /> everton.anyiro@gmail.com
              </a>
              <a href="https://wa.me/254700000000" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm text-beige/80 hover:text-gold transition-colors transition-colors">
                <WhatsAppIcon /> WhatsApp
              </a>
              <a href="https://instagram.com/evertonanyiro" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm text-beige/80 hover:text-gold transition-colors transition-colors">
                <InstagramIcon /> instagram.com/evertonanyiro
              </a>
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

