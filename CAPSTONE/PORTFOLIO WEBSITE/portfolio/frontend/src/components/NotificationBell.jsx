import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { fetchUnreadCount, fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../api/client'
import { useAuth } from '../contexts/AuthContext'

const TYPE_COLORS = {
  message:         'bg-blue-500/20 text-blue-600 dark:text-blue-300',
  cv_download:     'bg-gold/20 text-gold',
  password_change: 'bg-red-500/20 text-red-500',
  cv_upload:       'bg-green-500/20 text-green-600 dark:text-green-300',
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()

  const { data: countData } = useQuery({
    queryKey: ['notif-count'],
    queryFn: fetchUnreadCount,
    refetchInterval: 15000,
    enabled: isAuthenticated,
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: open && isAuthenticated,
  })

  const readMut    = useMutation({ mutationFn: markNotificationRead,     onSuccess: () => { qc.invalidateQueries({ queryKey: ['notif-count'] }); qc.invalidateQueries({ queryKey: ['notifications'] }) } })
  const readAllMut = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: () => { qc.invalidateQueries({ queryKey: ['notif-count'] }); qc.invalidateQueries({ queryKey: ['notifications'] }) } })

  const count = countData?.count || 0
  if (!isAuthenticated) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg bg-burgundy/10 hover:bg-burgundy/20 dark:bg-gold/10 dark:hover:bg-gold/20 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-burgundy dark:text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-burgundy text-white text-[10px] font-bold flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 z-[60] backdrop-blur-[16px] bg-white/[.92] dark:bg-dark-bg/95 border border-white/[.25] dark:border-white/[.10] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[.20] dark:border-white/[.08]">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">Notifications</p>
                  {count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-burgundy text-white text-[10px] font-bold">{count}</span>
                  )}
                </div>
                {count > 0 && (
                  <button onClick={() => readAllMut.mutate()} className="text-xs text-burgundy dark:text-gold hover:underline">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/[.10] dark:divide-white/[.05]">
                {notifications.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">No notifications yet</p>
                )}
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && readMut.mutate(n.id)}
                    className={`px-4 py-3 cursor-pointer hover:bg-white/[.30] dark:hover:bg-white/[.05] transition-colors ${!n.is_read ? 'bg-burgundy/5' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${TYPE_COLORS[n.type] || 'bg-gray-200/50 text-gray-600'}`}>
                        {n.type.replace('_', ' ').toUpperCase()}
                      </span>
                      {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-burgundy flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white mt-1">{n.title}</p>
                    {n.body && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.body}</p>}
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
