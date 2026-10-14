import React, { useState, useCallback, createContext, useContext } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div key={toast.id}
              initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
              transition={{ duration: 0.3 }}
              className={`px-5 py-3 rounded-xl shadow-xl text-sm font-medium backdrop-blur-[12px] border ${
                toast.type === 'success'
                  ? 'bg-green-500/20 border-green-400/30 text-green-800 dark:text-green-300'
                  : 'bg-red-500/20 border-red-400/30 text-red-800 dark:text-red-300'
              }`}>
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
