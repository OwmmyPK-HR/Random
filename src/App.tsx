import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { EventStoreProvider } from './store/EventStoreContext'
import { ToastProvider } from './store/ToastContext'
import { ThemeProvider } from './store/ThemeContext'
import { HomePage } from './pages/HomePage'
import { SportGroupPage } from './pages/SportGroupPage'
import { EventPage } from './pages/EventPage'
import { SchedulePage } from './pages/SchedulePage'
import { SummaryPage } from './pages/SummaryPage'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <EventStoreProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/sport/:slug" element={<SportGroupPage />} />
              <Route path="/event/:code" element={<EventPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/summary" element={<SummaryPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Layout>
        </EventStoreProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
