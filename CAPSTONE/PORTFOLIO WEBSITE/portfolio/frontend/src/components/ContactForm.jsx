import React, { useState } from 'react'
import { submitContact } from '../api/client'
import { useToast } from './ToastContainer'

function validate(f) {
  const e = {}
  if (!f.name.trim())    e.name    = 'Name is required'
  if (!f.subject.trim()) e.subject = 'Subject is required'
  if (!f.message.trim()) e.message = 'Message is required'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!f.email.trim())        e.email = 'Email is required'
  else if (!re.test(f.email)) e.email = 'Enter a valid email address'
  return e
}

const FIELDS = [
  { name: 'name',    label: 'Your Name',  type: 'text',  placeholder: 'First name, Surname' },
  { name: 'email',   label: 'Email',      type: 'email', placeholder: 'you@example.com'     },
  { name: 'subject', label: 'Subject',    type: 'text',  placeholder: 'Project inquiry'      },
]

export default function ContactForm() {
  const { showToast } = useToast()
  const [fields, setFields]   = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setFields(f  => ({ ...f,  [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(fields)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      await submitContact(fields)
      showToast("Message sent! I'll get back to you soon.", 'success')
      setFields({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      const msg = err.response?.data?.detail?.error
                || err.response?.data?.error
                || 'Failed to send. Please try again.'
      showToast(msg, 'error')
      // Preserve field values on error — Req 8.6
    } finally { setLoading(false) }
  }

  // All inputs share the same visual height (py-2.5) for uniformity
  const ic = (field) => [
    'w-full px-4 py-2.5 rounded-xl',
    'backdrop-blur-[12px]',
    'bg-white/20 dark:bg-white/5',
    'border transition-colors',
    'text-sm text-gray-800 dark:text-gray-200',
    'placeholder-gray-400 dark:placeholder-gray-500',
    'outline-none focus:ring-2 focus:ring-burgundy/40',
    errors[field] ? 'border-red-400' : 'border-white/30 dark:border-white/10',
  ].join(' ')

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>

      {/* Top fields — all same height */}
      {FIELDS.map(({ name, label, type, placeholder }) => (
        <div key={name}>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
            {label}
          </label>
          <input
            type={type}
            name={name}
            value={fields[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className={ic(name)}
          />
          {errors[name] && (
            <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
          )}
        </div>
      ))}

      {/* Message — 4 rows to keep card proportional */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
          Message
        </label>
        <textarea
          name="message"
          value={fields.message}
          onChange={handleChange}
          placeholder="Tell me about your project…"
          rows={4}
          className={`${ic('message')} resize-none`}
        />
        {errors.message && (
          <p className="text-red-500 text-xs mt-1">{errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-burgundy text-white font-semibold text-sm hover:bg-burgundy/90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
      >
        {loading ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
