import React, { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminProjects, createProject, updateProject, deleteProject,
  fetchMessages, patchMessage, fetchCVLogs, clearCVLogs,
  changePassword, uploadCV, deleteCV, fetchCVStatus,
  uploadPhoto, deletePhoto,
  fetchProfileBackImages, uploadProfileBackImage, deleteProfileBackImage,
  fetchAdminSocial, updateSocialLinks,
  fetchNotifications, markNotificationRead, markAllNotificationsRead,
  fetchAdminMedia, createMediaItem, updateMediaItem, deleteMediaItem,
  uploadMediaThumbnail, deleteMediaThumbnail,
  uploadMediaBackImage, deleteMediaBackImage,
  uploadProjectImage, deleteProjectImage,
  fetchSocialLinks,
} from '../api/client'
import GlassmorphismCard from '../components/GlassmorphismCard'
import PageTransitionWrapper from '../components/PageTransitionWrapper'
import { useToast } from '../components/ToastContainer'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Eye Icon ──────────────────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

// ── Forgot Password Flow ──────────────────────────────────────────────────────
function ForgotPasswordPanel({ onBack }) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const [step, setStep] = useState('email') // email | reset | done
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const ic2 = 'w-full px-4 py-2.5 rounded-xl bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 text-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-burgundy/40'

  async function requestToken(e) {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.token) {
        setToken(data.token)
        setMsg('Reset token generated. Enter it below along with your new password.')
        setStep('reset')
      } else {
        setErr('No admin account found with that email.')
      }
    } catch { setErr('Request failed. Is the backend running?') }
    finally { setLoading(false) }
  }

  async function resetPassword(e) {
    e.preventDefault(); setErr('')
    if (newPass.length < 6) { setErr('Password must be at least 6 characters'); return }
    if (!/[A-Za-z]/.test(newPass)) { setErr('Password must contain at least one letter'); return }
    if (!/[0-9]/.test(newPass)) { setErr('Password must contain at least one number'); return }
    if (newPass !== confirmPass) { setErr('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPass }),
      })
      const data = await res.json()
      if (res.ok) { setStep('done'); setMsg(data.message) }
      else setErr(data.detail || 'Reset failed. Token may be invalid or expired.')
    } catch { setErr('Request failed. Is the backend running?') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-gray-500 hover:text-burgundy dark:hover:text-gold transition-colors">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to login
      </button>

      <div className="text-center mb-2">
        <p className="font-bold text-lg text-burgundy dark:text-gold">Reset Password</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {step === 'email' && 'Enter your admin email to get a reset token'}
          {step === 'reset' && 'Enter your reset token and new password'}
          {step === 'done'  && 'Password reset complete'}
        </p>
      </div>

      {msg && <div className="px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-400/30 text-green-700 dark:text-green-300 text-xs text-center">{msg}</div>}
      {err && <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-400/30 text-red-600 dark:text-red-400 text-xs text-center">{err}</div>}

      {step === 'email' && (
        <form onSubmit={requestToken} className="flex flex-col gap-3">
          <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className={ic2} required />
          <button type="submit" disabled={loading} className="py-2.5 rounded-xl bg-burgundy text-white font-semibold text-sm hover:bg-burgundy/90 disabled:opacity-60">
            {loading ? 'Sending...' : 'Get Reset Token'}
          </button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={resetPassword} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Reset Token</label>
            <input type="text" placeholder="Paste your token here" value={token} onChange={e => setToken(e.target.value)} className={ic2} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">New Password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} placeholder="Min 6 chars, letters + numbers" value={newPass} onChange={e => setNewPass(e.target.value)} className={`${ic2} pr-10`} />
              <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-burgundy dark:hover:text-gold transition-colors">
                <EyeIcon open={showNew} />
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Confirm Password</label>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} placeholder="Repeat new password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={`${ic2} pr-10`} />
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-burgundy dark:hover:text-gold transition-colors">
                <EyeIcon open={showConfirm} />
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="py-2.5 rounded-xl bg-burgundy text-white font-semibold text-sm hover:bg-burgundy/90 disabled:opacity-60">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      {step === 'done' && (
        <button onClick={onBack} className="w-full py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700">
          Back to Login
        </button>
      )}
    </div>
  )
}

// ── Login Form ────────────────────────────────────────────────────────────────
function AdminLoginForm() {
  const { login } = useAuth()
  const [creds, setCreds]           = useState({ email: '', password: '' })
  const [errors, setErrors]         = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]       = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  function validate() {
    const e = {}
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!creds.email.trim()) e.email = 'Email is required'
    else if (!emailRe.test(creds.email)) e.email = 'Enter a valid email address'
    if (!creds.password) e.password = 'Password is required'
    else if (creds.password.length < 6) e.password = 'At least 6 characters required'
    else if (!/[A-Za-z]/.test(creds.password)) e.password = 'Must contain at least one letter'
    else if (!/[0-9]/.test(creds.password)) e.password = 'Must contain at least one number'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true); setServerError('')
    try {
      await login(creds.email, creds.password)
    } catch (err) {
      // err.message is set by AuthContext with the real server message
      setServerError(err.message || 'Login failed. Please try again.')
      setCreds(c => ({ ...c, password: '' }))
    } finally { setLoading(false) }
  }

  const fieldCls = (field) =>
    `w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-white/5 border text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-burgundy/40 ${errors[field] ? 'border-red-400' : 'border-white/30 dark:border-white/10'}`

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <GlassmorphismCard className="p-10 w-full max-w-sm">
        {showForgot ? (
          <ForgotPasswordPanel onBack={() => setShowForgot(false)} />
        ) : (
          <>
            {/* Lock icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-burgundy/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-burgundy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-burgundy dark:text-gold mb-1 text-center">Admin Access</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-6">Sign in with your admin credentials</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={creds.email}
                  onChange={e => { setCreds(c => ({ ...c, email: e.target.value })); setErrors(er => ({ ...er, email: '' })) }}
                  className={fieldCls('email')}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password with eye toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 chars, letters + numbers"
                    value={creds.password}
                    onChange={e => { setCreds(c => ({ ...c, password: e.target.value })); setErrors(er => ({ ...er, password: '' })) }}
                    className={`${fieldCls('password')} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-burgundy dark:hover:text-gold transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end -mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-burgundy dark:text-gold hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {serverError && (
                <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-400/30">
                  <p className="text-red-600 dark:text-red-400 text-sm text-center">{serverError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-burgundy text-white font-semibold hover:bg-burgundy/90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
              Access restricted to authorised personnel only
            </p>
          </>
        )}
      </GlassmorphismCard>
    </div>
  )
}

// ── Tab helpers ───────────────────────────────────────────────────────────────
const ic = 'w-full px-3 py-2 rounded-lg bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 text-gray-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-burgundy/40'

// ── Projects Tab ──────────────────────────────────────────────────────────────
function ProjectsTab() {
  const { showToast } = useToast()
  const qc = useQueryClient()
  const imgRef = useRef(null)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', tech_stack: '', github_url: '', live_url: '' })
  const [pendingImg, setPendingImg] = useState(null)   // { file, preview } before save
  const [uploadingImg, setUploadingImg] = useState(false)

  const { data: projects = [] } = useQuery({ queryKey: ['admin-projects'], queryFn: fetchAdminProjects })

  const inv = () => {
    qc.invalidateQueries({ queryKey: ['projects'] })
    qc.invalidateQueries({ queryKey: ['admin-projects'] })
  }

  const deleteMut = useMutation({ mutationFn: deleteProject, onSuccess: inv })
  const deleteImgMut = useMutation({
    mutationFn: deleteProjectImage,
    onSuccess: () => { inv(); showToast('Image removed', 'success') },
    onError: () => showToast('Failed to remove image', 'error'),
  })

  const [saving, setSaving] = useState(false)

  function resolvePreview(url) {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_URL}${url}`
  }

  function pickImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setPendingImg({ file, preview })
    e.target.value = ''
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    const data = {
      ...form,
      tech_stack: form.tech_stack.split(',').map(t => t.trim()).filter(Boolean),
    }

    try {
      if (editing) {
        await updateProject(editing.id, data)
        inv()
        if (pendingImg) {
          setUploadingImg(true)
          try {
            await uploadProjectImage(editing.id, pendingImg.file)
            inv()
            showToast('Project & image updated!', 'success')
          } catch {
            showToast('Project saved but image upload failed', 'error')
          } finally {
            setUploadingImg(false)
          }
        } else {
          showToast('Project updated!', 'success')
        }
        setEditing(null)
      } else {
        const created = await createProject(data)
        inv()
        if (pendingImg) {
          setUploadingImg(true)
          try {
            await uploadProjectImage(created.id, pendingImg.file)
            inv()
            showToast('Project created with image!', 'success')
          } catch {
            showToast('Project created but image upload failed', 'error')
          } finally {
            setUploadingImg(false)
          }
        } else {
          showToast('Project created!', 'success')
        }
      }
    } catch {
      showToast('Failed to save project', 'error')
    } finally {
      setSaving(false)
    }

    setForm({ title: '', description: '', tech_stack: '', github_url: '', live_url: '' })
    setPendingImg(null)
  }

  function startEdit(p) {
    setEditing(p)
    setForm({
      title: p.title,
      description: p.description,
      tech_stack: p.tech_stack.join(', '),
      github_url: p.github_url || '',
      live_url: p.live_url || '',
    })
    setPendingImg(null)
  }

  function cancelEdit() {
    setEditing(null)
    setForm({ title: '', description: '', tech_stack: '', github_url: '', live_url: '' })
    setPendingImg(null)
  }

  // Current preview: pending upload takes priority, then saved image
  const currentPreview = pendingImg
    ? pendingImg.preview
    : editing ? resolvePreview(editing.image_url) : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <GlassmorphismCard className="p-6">
        <h3 className="font-bold text-burgundy dark:text-gold mb-4">
          {editing ? 'Edit Project' : 'Add Project'}
        </h3>
        <form onSubmit={submit} className="flex flex-col gap-3">

          {/* Image upload area */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Project Image
            </label>
            <div
              className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-dashed border-white/30 dark:border-white/10 bg-white/10 dark:bg-white/5 flex items-center justify-center cursor-pointer hover:border-burgundy/50 transition-colors group"
              onClick={() => imgRef.current?.click()}
            >
              {currentPreview ? (
                <>
                  <img src={currentPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">Change image</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500 pointer-events-none">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="text-xs">Click to upload image</p>
                  <p className="text-[10px]">JPEG, PNG, WebP, GIF</p>
                </div>
              )}
            </div>
            <input
              ref={imgRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={pickImage}
            />

            {/* Remove image buttons */}
            <div className="flex gap-2 mt-1.5">
              {pendingImg && (
                <button
                  type="button"
                  onClick={() => setPendingImg(null)}
                  className="text-[10px] text-amber-500 hover:text-amber-600 font-medium"
                >
                  ✕ Cancel new image
                </button>
              )}
              {editing?.image_url && !pendingImg && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Remove this project image?')) {
                      deleteImgMut.mutate(editing.id)
                      setEditing(prev => ({ ...prev, image_url: null }))
                    }
                  }}
                  disabled={deleteImgMut.isPending}
                  className="text-[10px] text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
                >
                  ✕ Remove current image
                </button>
              )}
            </div>
          </div>

          {/* Text fields */}
          {[
            ['title', 'Title'],
            ['description', 'Description'],
            ['tech_stack', 'Tech Stack (comma separated)'],
            ['github_url', 'GitHub URL'],
            ['live_url', 'Live URL'],
          ].map(([f, placeholder]) => (
            <input
              key={f}
              placeholder={placeholder}
              value={form[f]}
              onChange={e => setForm(x => ({ ...x, [f]: e.target.value }))}
              className={ic}
            />
          ))}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || uploadingImg}
              className="flex-1 py-2 rounded-lg bg-burgundy text-white text-sm font-semibold hover:bg-burgundy/90 disabled:opacity-60"
            >
              {uploadingImg ? 'Uploading image...' : saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </GlassmorphismCard>

      {/* Project list */}
      <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
        {projects.map(p => {
          const thumb = p.image_url
            ? (p.image_url.startsWith('http') ? p.image_url : `${API_URL}${p.image_url}`)
            : null
          return (
            <GlassmorphismCard key={p.id} className="p-4 flex items-center gap-3">
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-burgundy/20 to-gold/10 flex-shrink-0">
                {thumb
                  ? <img src={thumb} alt={p.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xl opacity-20">📁</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{p.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{p.tech_stack.join(', ')}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(p)} className="px-3 py-1 rounded-lg bg-gold/20 text-gold text-xs font-medium">Edit</button>
                <button
                  onClick={() => window.confirm('Delete this project?') && deleteMut.mutate(p.id)}
                  className="px-3 py-1 rounded-lg bg-red-500/20 text-red-500 text-xs font-medium"
                >
                  Delete
                </button>
              </div>
            </GlassmorphismCard>
          )
        })}
        {projects.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-500 py-10 text-sm">No projects yet. Add one on the left.</p>
        )}
      </div>
    </div>
  )
}

// ── Messages Tab ──────────────────────────────────────────────────────────────
function MessagesTab() {
  const qc = useQueryClient()
  const { data: messages = [] } = useQuery({ queryKey: ['admin-messages'], queryFn: fetchMessages })
  const readMut = useMutation({ mutationFn: ({ id, is_read }) => patchMessage(id, is_read), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-messages'] }) })
  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 && <p className="text-center text-gray-400 py-10">No messages yet.</p>}
      {messages.map(m => (
        <GlassmorphismCard key={m.id} className={`p-5 ${m.is_read ? 'opacity-60' : ''}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 dark:text-white">{m.name} <span className="text-gray-500 font-normal text-sm">({m.email})</span></p>
              <p className="text-sm font-medium text-burgundy dark:text-gold mt-1">{m.subject}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{m.message}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(m.created_at).toLocaleString()}</p>
            </div>
            <button onClick={() => readMut.mutate({ id: m.id, is_read: !m.is_read })}
              className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium ${m.is_read ? 'bg-gray-200 dark:bg-gray-700 text-gray-600' : 'bg-green-500/20 text-green-600 dark:text-green-400'}`}>
              {m.is_read ? 'Unread' : 'Mark Read'}
            </button>
          </div>
        </GlassmorphismCard>
      ))}
    </div>
  )
}

// ── CV Logs Tab ───────────────────────────────────────────────────────────────
function CVLogsTab() {
  const { showToast } = useToast()
  const qc = useQueryClient()
  const { data: cvLogs = [] } = useQuery({ queryKey: ['admin-cv-logs'], queryFn: fetchCVLogs })
  const clearMut = useMutation({
    mutationFn: clearCVLogs,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-cv-logs'] }); showToast('All CV logs cleared', 'success') },
    onError: () => showToast('Failed to clear logs', 'error'),
  })
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">{cvLogs.length} record{cvLogs.length !== 1 ? 's' : ''}</p>
        {cvLogs.length > 0 && (
          <button
            onClick={() => window.confirm('Clear all CV download logs? This cannot be undone.') && clearMut.mutate()}
            disabled={clearMut.isPending}
            className="px-4 py-1.5 rounded-lg bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-500/30 disabled:opacity-50 transition-colors"
          >
            {clearMut.isPending ? 'Clearing...' : 'Clear All Logs'}
          </button>
        )}
      </div>
      {cvLogs.length === 0 && <p className="text-center text-gray-400 py-10">No CV downloads yet.</p>}
      {cvLogs.map(l => (
        <GlassmorphismCard key={l.id} className="p-4">
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="text-burgundy dark:text-gold font-mono font-semibold">{l.ip_address}</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs flex-1 truncate">{l.user_agent}</span>
            <span className="text-gray-400 text-xs flex-shrink-0">{new Date(l.downloaded_at).toLocaleString()}</span>
          </div>
        </GlassmorphismCard>
      ))}
    </div>
  )
}

// ── Social Links Tab ──────────────────────────────────────────────────────────
function SocialTab() {
  const { showToast } = useToast()
  const qc = useQueryClient()
  const { data: social = {} } = useQuery({ queryKey: ['admin-social'], queryFn: fetchAdminSocial })
  const [form, setForm] = useState({})
  React.useEffect(() => { if (social) setForm(social) }, [social])
  const saveMut = useMutation({
    mutationFn: updateSocialLinks,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-links'] }); qc.invalidateQueries({ queryKey: ['admin-social'] }); showToast('Social links updated!', 'success') },
    onError: () => showToast('Failed to update links', 'error'),
  })
  const FIELDS = [
    ['github','GitHub URL'],['linkedin','LinkedIn URL'],['facebook','Facebook URL'],
    ['x','X (Twitter) URL'],['instagram','Instagram URL'],['whatsapp','WhatsApp URL'],
    ['email','Email Address'],['phone','Phone Number'],
  ]
  return (
    <GlassmorphismCard className="p-6 max-w-xl">
      <h3 className="font-bold text-burgundy dark:text-gold mb-4">Social Media Links</h3>
      <div className="flex flex-col gap-3">
        {FIELDS.map(([key, label]) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{label}</label>
            <input className={ic} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={`Enter ${label}`} />
          </div>
        ))}
        <button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending}
          className="mt-2 py-2.5 rounded-xl bg-burgundy text-white font-semibold text-sm hover:bg-burgundy/90 disabled:opacity-60">
          {saveMut.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </GlassmorphismCard>
  )
}

// ── CV Manager Tab ────────────────────────────────────────────────────────────
function CVTab() {
  const { showToast } = useToast()
  const qc = useQueryClient()
  const fileRef = useRef(null)
  const { data: cvStatus } = useQuery({ queryKey: ['cv-status'], queryFn: fetchCVStatus, refetchInterval: 5000 })
  const uploadMut = useMutation({
    mutationFn: uploadCV,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cv-status'] }); showToast('CV uploaded successfully!', 'success') },
    onError: () => showToast('Upload failed. Ensure it is a PDF.', 'error'),
  })
  const deleteMut = useMutation({
    mutationFn: deleteCV,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cv-status'] }); showToast('CV removed.', 'success') },
  })
  return (
    <GlassmorphismCard className="p-6 max-w-md">
      <h3 className="font-bold text-burgundy dark:text-gold mb-4">CV Manager</h3>
      <div className={`p-4 rounded-xl mb-5 text-sm font-medium text-center ${cvStatus?.exists ? 'bg-green-500/15 text-green-700 dark:text-green-300 border border-green-400/30' : 'bg-red-500/10 text-red-500 border border-red-400/20'}`}>
        {cvStatus?.exists ? 'CV is currently available for download' : 'No CV uploaded — download button will show error'}
      </div>
      <div className="flex flex-col gap-3">
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={e => e.target.files[0] && uploadMut.mutate(e.target.files[0])} />
        <button onClick={() => fileRef.current?.click()} disabled={uploadMut.isPending}
          className="py-2.5 rounded-xl bg-burgundy text-white font-semibold text-sm hover:bg-burgundy/90 disabled:opacity-60">
          {uploadMut.isPending ? 'Uploading...' : 'Upload New CV (PDF)'}
        </button>
        {cvStatus?.exists && (
          <button onClick={() => confirm('Remove the CV?') && deleteMut.mutate()} disabled={deleteMut.isPending}
            className="py-2.5 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-500/30 disabled:opacity-60">
            {deleteMut.isPending ? 'Removing...' : 'Remove CV'}
          </button>
        )}
      </div>
    </GlassmorphismCard>
  )
}

// ── Photo Tab ─────────────────────────────────────────────────────────────────
function PhotoTab() {
  const { showToast } = useToast()
  const qc = useQueryClient()
  const fileRef = useRef(null)
  const backImgRef = useRef(null)

  const { data: settings } = useQuery({ queryKey: ['social-links'], queryFn: fetchSocialLinks })
  const photoUrl = settings?.photo_url ? `${API_URL}${settings.photo_url}` : null

  const { data: backImgData } = useQuery({
    queryKey: ['profile-back-images'],
    queryFn: fetchProfileBackImages,
  })
  const backImages = backImgData?.images || []

  const uploadMut = useMutation({
    mutationFn: uploadPhoto,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-links'] }); showToast('Photo updated!', 'success') },
    onError: () => showToast('Upload failed.', 'error'),
  })
  const deleteMut = useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-links'] }); showToast('Photo removed.', 'success') },
  })

  const uploadBackMut = useMutation({
    mutationFn: uploadProfileBackImage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile-back-images'] })
      qc.invalidateQueries({ queryKey: ['social-links'] })
      showToast('Back image uploaded!', 'success')
    },
    onError: (e) => {
      const msg = e?.response?.data?.detail?.error || 'Upload failed'
      showToast(msg, 'error')
    },
  })

  const deleteBackMut = useMutation({
    mutationFn: deleteProfileBackImage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile-back-images'] })
      qc.invalidateQueries({ queryKey: ['social-links'] })
      showToast('Back image removed.', 'success')
    },
    onError: () => showToast('Failed to remove image.', 'error'),
  })

  return (
    <div className="flex flex-col gap-6 max-w-md">
      {/* ── Profile Photo ── */}
      <GlassmorphismCard className="p-6">
        <h3 className="font-bold text-burgundy dark:text-gold mb-4">Profile Photo</h3>
        <div className="flex flex-col items-center gap-5">
          <div className="w-32 h-32 rounded-full border-4 border-burgundy overflow-hidden bg-gradient-to-br from-burgundy/20 to-gold/20 flex items-center justify-center">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-16 h-16 text-burgundy/30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => e.target.files[0] && uploadMut.mutate(e.target.files[0])} />
          <button onClick={() => fileRef.current?.click()} disabled={uploadMut.isPending}
            className="w-full py-2.5 rounded-xl bg-burgundy text-white font-semibold text-sm hover:bg-burgundy/90 disabled:opacity-60">
            {uploadMut.isPending ? 'Uploading...' : 'Upload Photo'}
          </button>
          {photoUrl && (
            <button onClick={() => confirm('Remove photo?') && deleteMut.mutate()} disabled={deleteMut.isPending}
              className="w-full py-2.5 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-500/30 disabled:opacity-60">
              {deleteMut.isPending ? 'Removing...' : 'Remove Photo'}
            </button>
          )}
          <p className="text-xs text-gray-400 text-center">Accepted: JPEG, PNG, WebP. This photo appears on the landing page.</p>
        </div>
      </GlassmorphismCard>

      {/* ── Profile Back Images ── */}
      <GlassmorphismCard className="p-6">
        <h3 className="font-bold text-burgundy dark:text-gold mb-1">Profile Back Images (up to 3)</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          These appear on the back side of the flip card on the landing page.
        </p>
        <div className="flex gap-3 flex-wrap">
          {backImages.map((url, idx) => {
            const src = url.startsWith('http') ? url : `${API_URL}${url}`
            return (
              <div key={idx} className="relative group">
                <img
                  src={src}
                  alt={`Back image ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border border-white/20"
                />
                <button
                  onClick={() => window.confirm('Remove this back image?') && deleteBackMut.mutate(idx)}
                  disabled={deleteBackMut.isPending}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  aria-label="Delete back image"
                >
                  ✕
                </button>
              </div>
            )
          })}

          {backImages.length < 3 && (
            <button
              onClick={() => backImgRef.current?.click()}
              disabled={uploadBackMut.isPending}
              className="w-24 h-24 rounded-lg border-2 border-dashed border-white/30 dark:border-white/10 flex flex-col items-center justify-center text-gray-400 hover:border-burgundy/50 hover:text-burgundy dark:hover:text-gold transition-colors disabled:opacity-50"
              aria-label="Upload back image"
            >
              {uploadBackMut.isPending ? (
                <div className="w-5 h-5 rounded-full border-2 border-burgundy border-t-transparent animate-spin" />
              ) : (
                <>
                  <span className="text-2xl leading-none">+</span>
                  <span className="text-[10px] mt-1">Upload</span>
                </>
              )}
            </button>
          )}
        </div>
        <input
          ref={backImgRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) uploadBackMut.mutate(file)
            e.target.value = ''
          }}
        />
      </GlassmorphismCard>
    </div>
  )
}

// ── Password Tab ──────────────────────────────────────────────────────────────
function PasswordTab() {
  const { showToast } = useToast()
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' })
  const [err, setErr] = useState('')
  const changeMut = useMutation({
    mutationFn: () => changePassword(form.current, form.newPass),
    onSuccess: () => { showToast('Password changed successfully!', 'success'); setForm({ current:'', newPass:'', confirm:'' }); setErr('') },
    onError: (e) => setErr(e.response?.data?.detail?.error || 'Failed to change password'),
  })
  function submit(e) {
    e.preventDefault(); setErr('')
    if (form.newPass !== form.confirm) { setErr('New passwords do not match'); return }
    if (form.newPass.length < 8) { setErr('New password must be at least 8 characters'); return }
    changeMut.mutate()
  }
  return (
    <GlassmorphismCard className="p-6 max-w-md">
      <h3 className="font-bold text-burgundy dark:text-gold mb-4">Change Password</h3>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {[['current','Current Password'],['newPass','New Password'],['confirm','Confirm New Password']].map(([key, label]) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{label}</label>
            <input type="password" className={ic} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={label} />
          </div>
        ))}
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button type="submit" disabled={changeMut.isPending}
          className="mt-1 py-2.5 rounded-xl bg-burgundy text-white font-semibold text-sm hover:bg-burgundy/90 disabled:opacity-60">
          {changeMut.isPending ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </GlassmorphismCard>
  )
}

// ── Notifications Tab ─────────────────────────────────────────────────────────
function NotificationsTab() {
  const qc = useQueryClient()
  const { data: notifs = [] } = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications })
  const readMut    = useMutation({ mutationFn: markNotificationRead,     onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['notif-count'] }) } })
  const readAllMut = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['notif-count'] }) } })
  const TYPE_COLOR = { message:'bg-blue-500/20 text-blue-600 dark:text-blue-300', cv_download:'bg-gold/20 text-gold', password_change:'bg-red-500/20 text-red-500', cv_upload:'bg-green-500/20 text-green-600 dark:text-green-300' }
  const unread = notifs.filter(n => !n.is_read).length
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{unread} unread</p>
        {unread > 0 && <button onClick={() => readAllMut.mutate()} className="text-xs text-burgundy dark:text-gold hover:underline">Mark all read</button>}
      </div>
      <div className="flex flex-col gap-3">
        {notifs.length === 0 && <p className="text-center text-gray-400 py-10">No notifications yet.</p>}
        {notifs.map(n => (
          <GlassmorphismCard key={n.id} className={`p-4 cursor-pointer ${!n.is_read ? 'border-burgundy/30' : ''}`} onClick={() => !n.is_read && readMut.mutate(n.id)}>
            <div className="flex items-start gap-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${TYPE_COLOR[n.type] || 'bg-gray-200/50 text-gray-600'}`}>
                {n.type.replace('_',' ').toUpperCase()}
              </span>
              {!n.is_read && <span className="w-2 h-2 rounded-full bg-burgundy flex-shrink-0 mt-1" />}
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white mt-1">{n.title}</p>
            {n.body && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.body}</p>}
            <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
          </GlassmorphismCard>
        ))}
      </div>
    </div>
  )
}

// ── IGS Media Tab ─────────────────────────────────────────────────────────────
function IGSMediaTab() {
  const { showToast } = useToast()
  const qc = useQueryClient()
  const thumbRef = useRef(null)
  const backRef  = useRef(null)

  const [activeCategory, setActiveCategory] = React.useState('capstone_video') // 'capstone_video' | 'cv_document'
  const [mode, setMode]       = React.useState('idle')   // 'idle' | 'create' | 'edit'
  const [editing, setEditing] = React.useState(null)
  const [form, setForm]       = React.useState({ title: '', drive_url: '', abstract: '' })
  const [thumbUploading, setThumbUploading] = React.useState(false)
  const [backUploading, setBackUploading]   = React.useState(false)

  const queryKey = activeCategory === 'capstone_video' ? 'admin-media-capstone' : 'admin-media-cv'
  const publicKey = activeCategory === 'capstone_video' ? 'media-capstone' : 'media-cv'

  const { data: items = [], isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: () => fetchAdminMedia(activeCategory),
  })

  const inv = () => {
    qc.invalidateQueries({ queryKey: [queryKey] })
    qc.invalidateQueries({ queryKey: [publicKey] })
  }

  const createMut = useMutation({
    mutationFn: (data) => createMediaItem({ ...data, category: activeCategory }),
    onSuccess: () => { inv(); showToast('Item created!', 'success'); setMode('idle'); setForm({ title: '', drive_url: '', abstract: '' }) },
    onError: () => showToast('Create failed', 'error'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateMediaItem(id, data),
    onSuccess: () => { inv(); showToast('Item updated!', 'success'); setMode('idle'); setEditing(null) },
    onError: () => showToast('Update failed', 'error'),
  })
  const deleteMut = useMutation({
    mutationFn: deleteMediaItem,
    onSuccess: () => { inv(); showToast('Item deleted', 'success') },
    onError: () => showToast('Delete failed', 'error'),
  })

  function startCreate() {
    setMode('create'); setEditing(null); setForm({ title: '', drive_url: '', abstract: '' })
  }
  function startEdit(item) {
    setMode('edit'); setEditing(item)
    setForm({ title: item.title, drive_url: item.drive_url || '', abstract: item.abstract || '' })
  }
  function cancelForm() { setMode('idle'); setEditing(null) }

  function handleSubmit(e) {
    e.preventDefault()
    if (mode === 'create') createMut.mutate(form)
    else if (mode === 'edit' && editing) updateMut.mutate({ id: editing.id, data: form })
  }

  async function handleThumbUpload(e, itemId) {
    const file = e.target.files?.[0]; if (!file) return
    setThumbUploading(true)
    try {
      await uploadMediaThumbnail(itemId, file); inv(); showToast('Thumbnail uploaded!', 'success')
      // refresh editing state
      if (editing?.id === itemId) setEditing(prev => ({ ...prev, thumbnail: 'updated' }))
    } catch { showToast('Thumbnail upload failed', 'error') }
    finally { setThumbUploading(false); e.target.value = '' }
  }

  async function handleThumbDelete(itemId) {
    if (!window.confirm('Remove thumbnail?')) return
    try { await deleteMediaThumbnail(itemId); inv(); showToast('Thumbnail removed', 'success') }
    catch { showToast('Failed to remove thumbnail', 'error') }
  }

  async function handleBackImageUpload(e, itemId) {
    const file = e.target.files?.[0]; if (!file) return
    setBackUploading(true)
    try {
      const updated = await uploadMediaBackImage(itemId, file); inv()
      showToast('Back image added!', 'success')
      if (editing?.id === itemId) setEditing(updated)
    } catch (err) {
      const msg = err?.response?.data?.detail?.error || 'Upload failed'
      showToast(msg, 'error')
    }
    finally { setBackUploading(false); e.target.value = '' }
  }

  async function handleBackImageDelete(itemId, idx) {
    if (!window.confirm('Remove this image?')) return
    try {
      const updated = await deleteMediaBackImage(itemId, idx); inv()
      showToast('Image removed', 'success')
      if (editing?.id === itemId) setEditing(updated)
    } catch { showToast('Failed to remove image', 'error') }
  }

  // When switching category, reset form
  function switchCategory(cat) {
    setActiveCategory(cat); setMode('idle'); setEditing(null)
  }

  // Resolve static image URL
  function img(url) {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_URL}${url}`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* ── LEFT: Action panel ── */}
      <GlassmorphismCard className="p-6 flex flex-col gap-4">
        {/* Category switcher */}
        <div className="flex gap-2">
          {[['capstone_video','🎬 Videos'], ['cv_document','📄 Documents']].map(([cat, label]) => (
            <button
              key={cat}
              onClick={() => switchCategory(cat)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${activeCategory === cat ? 'bg-burgundy text-white' : 'bg-white/20 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-burgundy/10'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Create button */}
        {mode === 'idle' && (
          <button onClick={startCreate} className="w-full py-2 rounded-lg border-2 border-dashed border-burgundy/40 text-burgundy dark:text-gold text-sm font-semibold hover:bg-burgundy/5 transition-colors">
            + Add New {activeCategory === 'capstone_video' ? 'Video' : 'Document'}
          </button>
        )}

        {/* Create / Edit Form */}
        {(mode === 'create' || mode === 'edit') && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <h3 className="font-bold text-burgundy dark:text-gold text-sm">
              {mode === 'create' ? `New ${activeCategory === 'capstone_video' ? 'Video' : 'Document'}` : `Editing: ${editing?.title}`}
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Title</label>
              <input className={ic} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" required />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                {activeCategory === 'capstone_video' ? 'Google Drive Video URL' : 'Google Drive Document URL'}
              </label>
              <input className={ic} value={form.drive_url} onChange={e => setForm(f => ({ ...f, drive_url: e.target.value }))} placeholder="https://drive.google.com/..." />
            </div>
            {activeCategory === 'capstone_video' && (
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Abstract</label>
                <textarea className={`${ic} min-h-[80px] resize-y`} value={form.abstract} onChange={e => setForm(f => ({ ...f, abstract: e.target.value }))} placeholder="Project abstract..." />
              </div>
            )}

            {/* Thumbnail upload — only shown when editing existing */}
            {mode === 'edit' && editing && (
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Thumbnail Image</label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-20 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-burgundy/20 to-gold/10 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                    onClick={() => thumbRef.current?.click()}
                  >
                    {img(items.find(x => x.id === editing.id)?.thumbnail) ? (
                      <img src={img(items.find(x => x.id === editing.id)?.thumbnail)} alt="thumb" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => thumbRef.current?.click()} disabled={thumbUploading} className="px-3 py-1 rounded-lg bg-gold/20 text-gold text-xs font-medium disabled:opacity-50">
                      {thumbUploading ? 'Uploading...' : 'Upload Thumbnail'}
                    </button>
                    {items.find(x => x.id === editing.id)?.thumbnail && (
                      <button type="button" onClick={() => handleThumbDelete(editing.id)} className="px-3 py-1 rounded-lg bg-red-500/20 text-red-500 text-xs font-medium">Remove</button>
                    )}
                  </div>
                  <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={e => handleThumbUpload(e, editing.id)} />
                </div>
              </div>
            )}

            {/* Back images — only for edit mode */}
            {mode === 'edit' && editing && (
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  Flip Card Back Images <span className="normal-case text-gray-400">(up to 3)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {(items.find(x => x.id === editing.id)?.back_images || []).map((url, idx) => (
                    <div key={idx} className="relative w-20 h-14 rounded-lg overflow-hidden group">
                      <img src={img(url)} alt={`back ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleBackImageDelete(editing.id, idx)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                      >✕</button>
                    </div>
                  ))}
                  {(items.find(x => x.id === editing.id)?.back_images || []).length < 3 && (
                    <div
                      className="w-20 h-14 rounded-lg border-2 border-dashed border-white/30 dark:border-white/10 flex items-center justify-center cursor-pointer hover:border-burgundy/50 transition-colors"
                      onClick={() => backRef.current?.click()}
                    >
                      {backUploading
                        ? <div className="w-4 h-4 rounded-full border-2 border-burgundy border-t-transparent animate-spin" />
                        : <span className="text-gray-400 text-xl">+</span>
                      }
                    </div>
                  )}
                  <input ref={backRef} type="file" accept="image/*" className="hidden" onChange={e => handleBackImageUpload(e, editing.id)} />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="flex-1 py-2 rounded-lg bg-burgundy text-white text-sm font-semibold hover:bg-burgundy/90 disabled:opacity-60">
                {createMut.isPending || updateMut.isPending ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
              </button>
              <button type="button" onClick={cancelForm} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm">Cancel</button>
            </div>
          </form>
        )}

        {mode === 'idle' && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2">
            Select an item on the right to edit, or click "Add New" above.
          </p>
        )}
      </GlassmorphismCard>

      {/* ── RIGHT: Item list ── */}
      <div className="flex flex-col gap-3 max-h-[700px] overflow-y-auto pr-1">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
          {activeCategory === 'capstone_video' ? 'Capstone Videos' : 'Documents & CVs'}
        </p>
        {isLoading && <p className="text-sm text-gray-400 py-4">Loading...</p>}
        {items.map(v => (
          <GlassmorphismCard key={v.id} className={`p-4 transition-all ${editing?.id === v.id ? 'ring-2 ring-burgundy/40' : ''}`}>
            <div className="flex items-start gap-3">
              {/* Thumbnail preview */}
              <div className="w-14 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-burgundy/20 to-gold/10 flex-shrink-0 flex items-center justify-center">
                {img(v.thumbnail)
                  ? <img src={img(v.thumbnail)} alt="thumb" className="w-full h-full object-cover" />
                  : <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159" /></svg>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{v.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {v.drive_url ? v.drive_url : <span className="italic text-gray-400">No URL</span>}
                </p>
                <div className="flex gap-2 mt-0.5 flex-wrap">
                  {v.abstract && <span className="text-[10px] text-green-600 dark:text-green-400">✓ Abstract</span>}
                  {v.thumbnail && <span className="text-[10px] text-blue-500">✓ Thumbnail</span>}
                  {(v.back_images?.length > 0) && <span className="text-[10px] text-purple-500">✓ {v.back_images.length} back img{v.back_images.length > 1 ? 's' : ''}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button onClick={() => startEdit(v)} className="px-3 py-1 rounded-lg bg-gold/20 text-gold text-xs font-medium">Edit</button>
                <button
                  onClick={() => window.confirm(`Delete "${v.title}"?`) && deleteMut.mutate(v.id)}
                  className="px-3 py-1 rounded-lg bg-red-500/20 text-red-500 text-xs font-medium"
                >Delete</button>
              </div>
            </div>
          </GlassmorphismCard>
        ))}
        {items.length === 0 && !isLoading && (
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
            No {activeCategory === 'capstone_video' ? 'videos' : 'documents'} yet. Add one on the left.
          </p>
        )}
      </div>
    </div>
  )
}
const TABS = [
  { id: 'projects',      label: 'Projects' },
  { id: 'messages',      label: 'Messages' },
  { id: 'cv-logs',       label: 'CV Downloads' },
  { id: 'social',        label: 'Social Links' },
  { id: 'cv-manager',    label: 'CV Manager' },
  { id: 'photo',         label: 'Profile Photo' },
  { id: 'igs-media',     label: 'IGS Videos' },
  { id: 'password',      label: 'Password' },
  { id: 'notifications', label: 'Notifications' },
]

function AdminDashboard() {
  const { logout } = useAuth()
  const [tab, setTab] = useState('projects')

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 md:px-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
        <button onClick={logout} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors">
          Logout
        </button>
      </div>

      {/* Tab bar — scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-thin">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${tab === t.id ? 'bg-burgundy text-white' : 'bg-white/20 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-burgundy/10'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'projects'      && <ProjectsTab />}
      {tab === 'messages'      && <MessagesTab />}
      {tab === 'cv-logs'       && <CVLogsTab />}
      {tab === 'social'        && <SocialTab />}
      {tab === 'cv-manager'    && <CVTab />}
      {tab === 'photo'         && <PhotoTab />}
      {tab === 'igs-media'     && <IGSMediaTab />}
      {tab === 'password'      && <PasswordTab />}
      {tab === 'notifications' && <NotificationsTab />}
    </div>
  )
}

export default function AdminPage() {
  const { isAuthenticated } = useAuth()
  return (
    <PageTransitionWrapper>
      {isAuthenticated ? <AdminDashboard /> : <AdminLoginForm />}
    </PageTransitionWrapper>
  )
}

