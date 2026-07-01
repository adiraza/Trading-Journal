import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { Layout } from './components/layout/Layout'
import { AuthProvider } from './contexts/AuthContext'
import { initDB } from './db'

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.DashboardPage })))
const TradeFormPage = lazy(() => import('./pages/TradeForm').then(m => ({ default: m.TradeFormPage })))
const TradesPage = lazy(() => import('./pages/Trades').then(m => ({ default: m.TradesPage })))
const CalendarPage = lazy(() => import('./pages/Calendar').then(m => ({ default: m.CalendarPage })))
const WeeklyAnalyticsPage = lazy(() => import('./pages/WeeklyAnalytics').then(m => ({ default: m.WeeklyAnalyticsPage })))
const MonthlyAnalyticsPage = lazy(() => import('./pages/MonthlyAnalytics').then(m => ({ default: m.MonthlyAnalyticsPage })))
const SessionAnalyticsPage = lazy(() => import('./pages/SessionAnalytics').then(m => ({ default: m.SessionAnalyticsPage })))
const EntryModelAnalyticsPage = lazy(() => import('./pages/EntryModelAnalytics').then(m => ({ default: m.EntryModelAnalyticsPage })))
const InstrumentAnalyticsPage = lazy(() => import('./pages/InstrumentAnalytics').then(m => ({ default: m.InstrumentAnalyticsPage })))
const GalleryPage = lazy(() => import('./pages/Gallery').then(m => ({ default: m.GalleryPage })))
const ExportPage = lazy(() => import('./pages/Export').then(m => ({ default: m.ExportPage })))
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.SettingsPage })))
const ProfilePage = lazy(() => import('./pages/Profile').then(m => ({ default: m.ProfilePage })))
const LoginPage = lazy(() => import('./pages/Login').then(m => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('./pages/Signup').then(m => ({ default: m.SignupPage })))

// Loading component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--color-accent)] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    </div>
  )
}

function App() {
  useEffect(() => {
    initDB()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault()
            window.location.href = '/new-trade'
            break
          case 'h':
            e.preventDefault()
            window.location.href = '/'
            break
          case 'f':
            if (window.location.pathname !== '/trades') {
              e.preventDefault()
              window.location.href = '/trades'
            }
            break
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="new-trade" element={<TradeFormPage />} />
              <Route path="edit-trade/:id" element={<TradeFormPage />} />
              <Route path="trades" element={<TradesPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="weekly" element={<WeeklyAnalyticsPage />} />
              <Route path="monthly" element={<MonthlyAnalyticsPage />} />
              <Route path="sessions" element={<SessionAnalyticsPage />} />
              <Route path="entry-models" element={<EntryModelAnalyticsPage />} />
              <Route path="instruments" element={<InstrumentAnalyticsPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="export" element={<ExportPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
