import { SportBasketballIcon, SportFootballIcon, SportPetanqueIcon, SportTennisIcon } from './Icons'

const TILES = [
  { Icon: SportFootballIcon, color: '#0284C7', rotate: '-6deg', pos: 'top-[8%] left-[10%]' },
  { Icon: SportTennisIcon, color: '#9333EA', rotate: '5deg', pos: 'top-[4%] right-[12%]' },
  { Icon: SportPetanqueIcon, color: '#DB2777', rotate: '4deg', pos: 'bottom-[14%] left-[16%]' },
  { Icon: SportBasketballIcon, color: '#16A34A', rotate: '-4deg', pos: 'bottom-[8%] right-[8%]' },
]

/** แผงภาพประกอบสไตล์โปสเตอร์ — ใช้คู่กับ hero ให้หน้าแรกดูมีมิติ ไม่ขึ้นกับโหมดมืด/ขาว (ตั้งใจให้เขียวเข้มเสมอ) */
export function ShowcasePanel() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-gradient-to-br from-pine-800 via-pine-900 to-black shadow-pop sm:aspect-auto sm:h-full sm:min-h-[360px]">
      {/* พื้นผิวลายจุดจาง ๆ */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '22px 22px' }}
      />
      {/* วงแหวนทอง */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold-400/30" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[44%] w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold-400/20" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400/20 blur-3xl" />

      {/* หัวข้อ */}
      <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-7">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">TU Sport Day 2026</p>
          <h3 className="mt-1.5 text-2xl font-extrabold uppercase leading-tight text-white sm:text-[26px]">เวทีจับสลาก</h3>
          <p className="mt-1 text-xs text-white/70">กีฬาเชื่อมเรา ให้ใกล้กว่าเดิม</p>
        </div>

        {/* กระเบื้องไอคอนกีฬา ลอยรอบวงแหวน */}
        <div className="relative mx-auto my-4 h-40 w-full max-w-[260px] sm:h-48">
          {TILES.map(({ Icon, color, rotate, pos }, i) => (
            <div
              key={i}
              className={`absolute ${pos} flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg sm:h-16 sm:w-16`}
              style={{ background: color, transform: `rotate(${rotate})`, boxShadow: `0 10px 24px ${color}66` }}
            >
              <Icon size={26} />
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between gap-3">
          <p className="text-[9px] font-bold uppercase leading-relaxed tracking-[0.16em] text-white/50">
            Different Colors
            <br />
            Same Spirit
          </p>
          <span className="inline-flex items-center rounded-full border border-gold-400/40 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-300">
            TU Sport Day 2026
          </span>
        </div>
      </div>

      {/* ป้ายคำเล็ก ๆ แนวตั้งขวาสุด */}
      <div className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-3 text-right text-[9px] font-bold uppercase tracking-[0.18em] text-white/40 sm:flex">
        <span>Play</span>
        <span>Unite</span>
        <span>Belong</span>
        <span>Beyond</span>
      </div>
    </div>
  )
}
