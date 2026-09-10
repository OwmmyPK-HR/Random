import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Base({ size = 20, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

export const CalendarIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </Base>
)

export const MapPinIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </Base>
)

export const PrinterIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 9V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5" />
    <rect x="4" y="9" width="16" height="8" rx="1.5" />
    <path d="M6 14h12v6a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-6Z" />
  </Base>
)

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.3-4.3" />
  </Base>
)

export const SunIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4.3" />
    <path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
  </Base>
)

export const MoonIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.7 6.7 0 0 0 10.5 10.5Z" />
  </Base>
)

export const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 11.5 12 4l8 7.5" />
    <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
  </Base>
)

export const ChartIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Base>
)

export const UploadIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 15V4M12 4 8 8M12 4l4 4" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </Base>
)

export const DownloadIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4v11M12 15l-4-4M12 15l4-4" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </Base>
)

export const DiceIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
  </Base>
)

export const UsersIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 8.2a3 3 0 1 1 0 5.9" />
    <path d="M15 20a5.4 5.4 0 0 0-2-3.9" />
  </Base>
)

export const TrophyIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" />
    <path d="M12 14v3M9 20h6M8.5 20v-1.2a2 2 0 0 1 2-1.8h3a2 2 0 0 1 2 1.8V20" />
  </Base>
)

export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 6l6 6-6 6" />
  </Base>
)

export const ArrowLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Base>
)

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
)

export const MenuIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Base>
)

export const PencilIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20l.9-3.6L15.3 6a1.7 1.7 0 0 1 2.4 0l.3.3a1.7 1.7 0 0 1 0 2.4L7.6 19.1 4 20Z" />
    <path d="M13.5 7.8l2.7 2.7" />
  </Base>
)

export const TrashIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-.7 12.1a2 2 0 0 1-2 1.9H8.7a2 2 0 0 1-2-1.9L6 7" />
    <path d="M10 11v6M14 11v6" />
  </Base>
)

export const CheckCircleIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 12.3l2.4 2.4L15.8 9.4" />
  </Base>
)

export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
)

export const CircleDashedIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" strokeDasharray="3 4" />
  </Base>
)

export const SparklesIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5 13.3 8.7 18.5 10 13.3 11.3 12 16.5 10.7 11.3 5.5 10 10.7 8.7 12 3.5Z" />
    <path d="M18.5 15.5 19.2 18 21.5 18.7 19.2 19.4 18.5 21.9 17.8 19.4 15.5 18.7 17.8 18 18.5 15.5Z" />
  </Base>
)

export const FilterIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </Base>
)

export const InfoIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.2M12 8.3v.1" />
  </Base>
)

export const HelpIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.3 9.3a2.7 2.7 0 1 1 3.9 2.4c-.8.5-1.2 1-1.2 1.9v.3" />
    <path d="M12 16.7v.1" />
  </Base>
)

// ---- ไอคอนหมวดกีฬา (เส้นเรียบง่าย โทนเดียวกับไอคอนหลัก) ----

export const SportTennisIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M4.8 7.5c2.7 1.6 4 4 4 4.5s-1.3 2.9-4 4.5M19.2 7.5c-2.7 1.6-4 4-4 4.5s1.3 2.9 4 4.5" />
  </Base>
)

export const SportFootballIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8.3 15.3 10.6 14.1 14.5 9.9 14.5 8.7 10.6 12 8.3Z" />
    <path d="M12 3.5v4.8M12 15.7l2 4.6M12 15.7l-2 4.6M6 8.3l-3-1M18 8.3l3-1" />
  </Base>
)

export const SportFutsalIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="6" width="17" height="12" rx="1.5" />
    <path d="M3.5 9h17M3.5 15h17M9 6v12M15 6v12" />
  </Base>
)

export const SportVolleyballIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 3.5c2.8 2 4.3 5.2 4.3 8.5M12 3.5c-2.8 2-4.3 5.2-4.3 8.5M4 10.2c2.8.6 5.5 2.6 6.7 5.4M20 10.2c-2.8.6-5.5 2.6-6.7 5.4" />
  </Base>
)

export const SportBasketballIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 3.5v17M3.5 12h17M5.3 6.3c2.2 1.7 3.5 3.9 3.7 5.7-.2 1.8-1.5 4-3.7 5.7M18.7 6.3c-2.2 1.7-3.5 3.9-3.7 5.7.2 1.8 1.5 4 3.7 5.7" />
  </Base>
)

export const SportBadmintonIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="8" r="4.2" />
    <path d="M8 12.2v2M6.3 17.8 4 20.5M8 14.5l1.6 3.8M8 14.5l-3.4 2.3M8 14.5l4.4.3" />
  </Base>
)

export const SportPetanqueIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="10" r="4.3" />
    <circle cx="15.5" cy="15" r="3" />
    <path d="M4 20h16" />
  </Base>
)

export const SPORT_ICON: Record<string, (p: IconProps) => JSX.Element> = {
  เทนนิส: SportTennisIcon,
  ฟุตบอล: SportFootballIcon,
  ฟุตซอล: SportFutsalIcon,
  วอลเลย์บอล: SportVolleyballIcon,
  บาสเกตบอล: SportBasketballIcon,
  แบดมินตัน: SportBadmintonIcon,
  เปตอง: SportPetanqueIcon,
}
