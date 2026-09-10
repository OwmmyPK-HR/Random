import { useEffect, useRef, type CSSProperties } from 'react'
import { COLOR_THEME, type ColorName } from '../types'

// ลูกเต๋าจริง ๆ ในพื้นที่ 3 มิติ (6 หน้าประกอบเป็นกล่องจริง ไม่ใช่รูปแบนบิดมุมมองแบบเดิม)
// ตอนหมุนจะเห็นหน้าอื่นสลับมาจริง ๆ ตามมุมมอง สมจริงกว่าไอคอนแบนที่แค่ยืด/บีบ
const CUBE_SIZE = 56
const HALF = CUBE_SIZE / 2
const SPEED_X_DEG_PER_SEC = 420
const SPEED_Y_DEG_PER_SEC = 630 // อัตราไม่ลงตัวกับแกน X ให้จังหวะหมุนดูเป็นธรรมชาติ ไม่ซ้ำวนแบบตายตัว

export function RollingDie3D({
  color,
  value,
  spinning,
  justSettled,
  reducedMotion,
}: {
  color: ColorName
  value: number
  spinning: boolean
  justSettled: boolean
  reducedMotion: boolean
}) {
  const theme = COLOR_THEME[color]
  const cubeRef = useRef<HTMLDivElement>(null)
  // มุมสะสมจริง (องศา) ควบคุมด้วยมือทั้งหมด — ไม่พึ่ง CSS @keyframes เพราะ keyframe แบบ infinite จะรีเซ็ตมุมทุกรอบ
  // ถ้าปล่อยให้หยุดแบบ snap กลับไป 0 องศาตรง ๆ จะดูเหมือนลูกเต๋าสะบัดถอยหลังแรง ๆ แทนที่จะค่อย ๆ หยุดนิ่งตามธรรมชาติ
  const angleRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>()

  useEffect(() => {
    const el = cubeRef.current
    if (!el || reducedMotion) return

    if (spinning) {
      el.style.transition = 'none'
      let last = performance.now()
      const step = (now: number) => {
        const dt = (now - last) / 1000
        last = now
        angleRef.current = {
          x: angleRef.current.x + SPEED_X_DEG_PER_SEC * dt,
          y: angleRef.current.y + SPEED_Y_DEG_PER_SEC * dt,
        }
        el.style.transform = `rotateX(${angleRef.current.x}deg) rotateY(${angleRef.current.y}deg)`
        rafRef.current = requestAnimationFrame(step)
      }
      rafRef.current = requestAnimationFrame(step)
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    }

    // หยุดหมุน — หมุนต่อไปข้างหน้าทิศเดิมจนถึงมุมตั้งตรงที่ใกล้ที่สุด (ทวีคูณของ 360) แล้วค่อย ๆ ชะลอ ไม่สะบัดย้อนกลับ
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const target = {
      x: Math.ceil((angleRef.current.x + 1) / 360) * 360,
      y: Math.ceil((angleRef.current.y + 1) / 360) * 360,
    }
    angleRef.current = target
    el.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)'
    el.style.transform = `rotateX(${target.x}deg) rotateY(${target.y}deg)`
  }, [spinning, reducedMotion])

  const faceBase: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${theme.soft}, ${theme.base})`,
    border: `2px solid ${theme.dark}`,
    borderRadius: 8,
    backfaceVisibility: 'hidden',
  }

  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      {justSettled && !reducedMotion && (
        <span
          className="animate-ringBurst pointer-events-none absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 0 3px ${theme.base}` }}
        />
      )}
      <div
        className={justSettled && !reducedMotion ? 'animate-settlePop' : ''}
        style={{ width: CUBE_SIZE, height: CUBE_SIZE, perspective: 280 }}
      >
        {/* transform ไม่ประกาศไว้ตรงนี้ตั้งใจ — ปล่อยให้ effect ด้านบนควบคุมทั้งหมดผ่าน ref โดยตรง
            (ถ้าประกาศไว้ใน JSX ด้วย จะโดน React เซ็ตทับค่าที่ตั้งด้วยมือทุกครั้งที่ re-render จากเลขที่วิ่งเปลี่ยนหน้าเต๋า) */}
        <div ref={cubeRef} style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
          <div style={{ ...faceBase, transform: `translateZ(${HALF}px)` }}>
            {/* ไม่โชว์เลขระหว่างหมุน (สมจริงกว่า — ลูกเต๋าจริงก็อ่านเลขตอนกำลังทอยไม่ได้) เผยเลขให้เห็นตอนหยุดนิ่งแล้วเท่านั้น */}
            {!spinning && (
              <span className="text-xl font-extrabold text-white [font-variant-numeric:tabular-nums] drop-shadow">{value}</span>
            )}
          </div>
          <div style={{ ...faceBase, transform: `rotateY(180deg) translateZ(${HALF}px)` }} />
          <div style={{ ...faceBase, transform: `rotateY(90deg) translateZ(${HALF}px)` }} />
          <div style={{ ...faceBase, transform: `rotateY(-90deg) translateZ(${HALF}px)` }} />
          <div style={{ ...faceBase, transform: `rotateX(90deg) translateZ(${HALF}px)` }} />
          <div style={{ ...faceBase, transform: `rotateX(-90deg) translateZ(${HALF}px)` }} />
        </div>
      </div>
    </div>
  )
}
