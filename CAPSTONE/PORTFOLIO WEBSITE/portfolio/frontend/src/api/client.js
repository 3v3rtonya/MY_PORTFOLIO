import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('admin-token')
  if (token && config.url && config.url.includes('/admin')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Public
export const fetchProjects      = () => api.get('/api/v1/projects').then(r => r.data)
export const submitContact      = (payload) => api.post('/api/v1/contact', payload).then(r => r.data)
export const fetchSocialLinks   = () => api.get('/api/v1/settings/social').then(r => r.data)

// Auth
export const adminLogin = (email, password) => api.post('/api/v1/auth/login', { email, password }).then(r => r.data)

// Admin — projects
export const fetchAdminProjects = () => api.get('/api/v1/admin/projects').then(r => r.data)
export const createProject      = (data) => api.post('/api/v1/admin/projects', data).then(r => r.data)
export const updateProject      = (id, data) => api.put(`/api/v1/admin/projects/${id}`, data).then(r => r.data)
export const deleteProject      = (id) => api.delete(`/api/v1/admin/projects/${id}`)

// Admin — messages
export const fetchMessages      = () => api.get('/api/v1/admin/messages').then(r => r.data)
export const patchMessage       = (id, is_read) => api.patch(`/api/v1/admin/messages/${id}`, { is_read }).then(r => r.data)

// Admin — CV logs
export const fetchCVLogs        = () => api.get('/api/v1/admin/cv-logs').then(r => r.data)
export const clearCVLogs        = () => api.delete('/api/v1/admin/cv-logs').then(r => r.data)

// Admin — password
export const changePassword     = (current, next) => api.post('/api/v1/admin/change-password', { current_password: current, new_password: next }).then(r => r.data)

// Admin — CV upload/delete
export const uploadCV           = (file) => { const fd = new FormData(); fd.append('file', file); return api.post('/api/v1/admin/cv/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data) }
export const deleteCV           = () => api.delete('/api/v1/admin/cv').then(r => r.data)
export const fetchCVStatus      = () => api.get('/api/v1/admin/cv/status').then(r => r.data)
export const setCVUrl           = (url) => api.post('/api/v1/admin/cv/url', { url }).then(r => r.data)

// Admin — photo upload/delete
export const uploadPhoto        = (file) => { const fd = new FormData(); fd.append('file', file); return api.post('/api/v1/admin/photo/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data) }
export const deletePhoto        = () => api.delete('/api/v1/admin/photo').then(r => r.data)
export const setPhotoUrl        = (url) => api.post('/api/v1/admin/photo/url', { url }).then(r => r.data)

// Admin — profile back images
export const fetchProfileBackImages = () => api.get('/api/v1/admin/profile-back-images').then(r => r.data)
export const uploadProfileBackImage = (file) => { const fd = new FormData(); fd.append('file', file); return api.post('/api/v1/admin/profile-back-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data) }
export const deleteProfileBackImage = (index) => api.delete(`/api/v1/admin/profile-back-image/${index}`).then(r => r.data)
export const addProfileBackImageUrl = (url) => api.post('/api/v1/admin/profile-back-image/url', { url }).then(r => r.data)

// Admin — project image upload/delete
export const uploadProjectImage = (id, file) => { const fd = new FormData(); fd.append('file', file); return api.post(`/api/v1/admin/projects/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data) }
export const deleteProjectImage = (id) => api.delete(`/api/v1/admin/projects/${id}/image`).then(r => r.data)

// Admin — social links
export const fetchAdminSocial   = () => api.get('/api/v1/admin/social-links').then(r => r.data)
export const updateSocialLinks  = (data) => api.put('/api/v1/admin/social-links', data).then(r => r.data)

// Admin — notifications
export const fetchNotifications       = () => api.get('/api/v1/admin/notifications').then(r => r.data)
export const fetchUnreadCount         = () => api.get('/api/v1/admin/notifications/unread-count').then(r => r.data)
export const markNotificationRead     = (id) => api.patch(`/api/v1/admin/notifications/${id}`, { is_read: true }).then(r => r.data)
export const markAllNotificationsRead = () => api.post('/api/v1/admin/notifications/mark-all-read').then(r => r.data)

// Site media (public)
export const fetchMediaByCategory = (category) => api.get(`/api/v1/settings/media/${category}`).then(r => r.data)

// Admin — site media
export const fetchAdminMedia       = (category) => api.get(`/api/v1/admin/media/${category}`).then(r => r.data)
export const createMediaItem       = (data) => api.post('/api/v1/admin/media', data).then(r => r.data)
export const updateMediaItem       = (id, data) => api.patch(`/api/v1/admin/media/${id}`, data).then(r => r.data)
export const deleteMediaItem       = (id) => api.delete(`/api/v1/admin/media/${id}`).then(r => r.data)
export const uploadMediaThumbnail  = (id, file) => { const fd = new FormData(); fd.append('file', file); return api.post(`/api/v1/admin/media/${id}/thumbnail`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data) }
export const deleteMediaThumbnail  = (id) => api.delete(`/api/v1/admin/media/${id}/thumbnail`).then(r => r.data)
export const uploadMediaBackImage  = (id, file) => { const fd = new FormData(); fd.append('file', file); return api.post(`/api/v1/admin/media/${id}/back-image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data) }
export const deleteMediaBackImage  = (id, idx) => api.delete(`/api/v1/admin/media/${id}/back-image/${idx}`).then(r => r.data)

export default api
