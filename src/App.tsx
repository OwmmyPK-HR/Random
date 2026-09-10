import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { EventStoreProvider } from './store/EventStoreContext'
import { ToastProvider } from './store/ToastContext'
import { ThemeProvider } from './store/ThemeContext'
import { HomePage } from './pages/HomePage'

// โหลดแบบ lazy เฉพาะหน้าที่ไม่ใช่หน้าแรก — ลดขนาดไฟล์ก้อนแรกที่ต้องโหลดตอนเข้าเว็บครั้งแรก
// (หน้าแรกเป็นหน้าที่ผู้ใช้ส่วนใหญ่เจอก่อนเสมอ เลยยังโหลดแบบปกติไปพร้อมแอป ไม่ต้องรอซ้ำ)
const SportGroupPage = lazy(() => import('./pages/SportGroupPage').then((m) => ({ default: m.SportGroupPage })))
const EventPage = lazy(() => import('./pages/EventPage').then((m) => ({ default: m.EventPage })))
const NumberDrawPage = lazy(() => import('./pages/NumberDrawPage').then((m) => ({ default: m.NumberDrawPage })))
const SummaryPage = lazy(() => import('./pages/SummaryPage').then((m) => ({ default: m.SummaryPage })))

function PageLoading() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-border border-t-accent" />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <EventStoreProvider>
          <Layout>
            <Suspense fallback={<PageLoading />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/sport/:slug" element={<SportGroupPage />} />
                <Route path="/event/:code" element={<EventPage />} />
                <Route path="/number-draw" element={<NumberDrawPage />} />
                <Route path="/summary" element={<SummaryPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </Suspense>
          </Layout>
        </EventStoreProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
