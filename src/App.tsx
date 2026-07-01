import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './pages/Dashboard'
import { TradeFormPage } from './pages/TradeForm'
import { TradesPage } from './pages/Trades'
import { CalendarPage } from './pages/Calendar'
import { WeeklyAnalyticsPage } from './pages/WeeklyAnalytics'
import { MonthlyAnalyticsPage } from './pages/MonthlyAnalytics'
import { SessionAnalyticsPage } from './pages/SessionAnalytics'
import { EntryModelAnalyticsPage } from './pages/EntryModelAnalytics'
import { InstrumentAnalyticsPage } from './pages/InstrumentAnalytics'
import { GalleryPage } from './pages/Gallery'
import { ExportPage } from './pages/Export'
import { SettingsPage } from './pages/Settings'
import { initDB } from './db'

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
      <Routes>
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
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
