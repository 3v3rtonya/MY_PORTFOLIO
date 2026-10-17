import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/ToastContainer'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import SkillsPage from './pages/SkillsPage'
import ProjectsPage from './pages/ProjectsPage'
import ContactPage from './pages/ContactPage'
import AdminPage from './pages/AdminPage'
import AboutPage from './pages/AboutPage'

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 0 } } })

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"           element={<HomePage />}    />
        <Route path="/about"      element={<AboutPage />}   />
        <Route path="/skills"     element={<SkillsPage />}  />
        <Route path="/projects"   element={<ProjectsPage />}/>
        <Route path="/contact"    element={<ContactPage />} />
        <Route path="/everton-006" element={<AdminPage />}   />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ToastProvider>
              <div className="min-h-screen flex flex-col bg-beige dark:bg-dark-bg transition-colors duration-300">
                <Navbar />
                <main className="flex-1">
                  <AnimatedRoutes />
                </main>
                <Footer />
              </div>
            </ToastProvider>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}