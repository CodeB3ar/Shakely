// Single chip control used everywhere a pill toggle is needed.
import type { CSSProperties } from 'react'

export function Chip({
  label,
  on,
  onClick,
  title,
  style,
}: {
  label: string
  on?: boolean
  onClick?: () => void
  title?: string
  style?: CSSProperties
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      title={title}
      style={{
        height: 44,
        boxSizing: 'border-box',
        padding: '0 18px',
        borderRadius: 'var(--r-pill)',
        fontSize: 15,
        fontWeight: 500,
        background: on ? 'var(--ink)' : 'var(--card)',
        color: on ? '#fff' : '#222222',
        border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`,
        cursor: 'pointer',
        flex: 'none',
        ...style,
      }}
    >
      {label}
    </button>
  )
}
