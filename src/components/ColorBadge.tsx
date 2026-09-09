import { COLOR_THEME, type ColorName } from '../types'

export function ColorDot({ color, size = 10 }: { color: ColorName; size?: number }) {
  return (
    <span
      className="inline-block rounded-full ring-2 ring-white shadow"
      style={{ backgroundColor: COLOR_THEME[color].base, width: size, height: size }}
    />
  )
}

export function ColorBadge({ color, size = 'sm' }: { color: ColorName; size?: 'sm' | 'md' }) {
  const theme = COLOR_THEME[color]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
      style={{ backgroundColor: theme.light, color: theme.dark }}
    >
      <ColorDot color={color} size={size === 'sm' ? 8 : 10} />
      สี{color}
    </span>
  )
}
