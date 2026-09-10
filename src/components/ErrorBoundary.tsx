import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * กันแอปทั้งหน้ากลายเป็นจอขาวเปล่าเวลามีจุดไหนพัง (error ที่ไม่คาดคิด) — แสดงข้อความอธิบาย + ปุ่มโหลดใหม่แทน
 * ข้อมูลใน localStorage ไม่ได้รับผลกระทบ (ยังอยู่ครบ) เพราะปัญหาอยู่ที่การแสดงผล ไม่ใช่ข้อมูล
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-canvas px-4">
          <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface-card p-6 text-center shadow-soft">
            <p className="text-3xl">😵</p>
            <h1 className="mt-3 text-lg font-extrabold text-mist-100">เกิดข้อผิดพลาดบางอย่าง</h1>
            <p className="mt-1.5 text-sm text-mist-400">
              หน้านี้แสดงผลไม่สำเร็จ แต่ข้อมูลที่บันทึกไว้ในเครื่องยังอยู่ครบ ลองโหลดหน้าใหม่อีกครั้ง
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-contrast shadow-glowAccent transition hover:-translate-y-0.5 hover:bg-accent-soft"
            >
              โหลดหน้าใหม่
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
