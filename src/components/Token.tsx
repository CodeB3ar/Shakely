import type { CSSProperties, ReactNode } from 'react'

export function Card({
  children,
  style,
}: {
  children: ReactNode
  style?: CSSProperties
}) {
  return <div style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', ...style }}>{children}</div>
}

export function Screen({
  children,
  style,
}: {
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', padding: '0 24px 80px', background: 'var(--bg)', color: 'var(--ink)', ...style }}>
      <div style={{ position: 'relative', maxWidth: 1240, margin: '0 auto' }}>{children}</div>
    </div>
  )
}

export function Chip({
  label,
  on,
  onClick,
}: {
  label: string
  on?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      style={{
        height: 44,
        padding: '0 18px',
        borderRadius: 'var(--r-pill)',
        fontSize: 15,
        fontWeight: 500,
        background: on ? 'var(--ink)' : 'var(--card)',
        color: on ? '#fff' : '#222222',
        border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`,
      }}
    >
      {label}
    </button>
  )
}

export function RoundBtn({
  label,
  onClick,
  size = 48,
  style,
  children,
}: {
  label: string
  onClick?: () => void
  size?: number
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        padding: 0,
        border: 0,
        flex: 'none',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function DarkBtn({
  label,
  onClick,
  height = 48,
  children,
}: {
  label: string
  onClick?: () => void
  height?: number
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        height,
        padding: '0 20px 0 16px',
        border: 0,
        borderRadius: height / 2,
        background: 'var(--ink)',
        color: '#fff',
        fontSize: 16,
        fontWeight: 500,
        flex: 'none',
      }}
    >
      {children}
    </button>
  )
}

export function Sticker({
  emoji,
  size,
  rotate = 0,
  delay = 0,
  style,
}: {
  emoji: string
  size: number | string
  rotate?: number
  delay?: number
  style?: CSSProperties
}) {
  return (
    <span
      className="sticker"
      aria-hidden="true"
      style={{ fontSize: size, ['--r' as string]: `${rotate}deg`, animationDelay: `${delay}s`, ...style }}
    >
      {emoji}
    </span>
  )
}
