// Shared screen wrapper: one container, one background.
import type { CSSProperties, ReactNode } from 'react'

export function Screen({
  children,
  style,
}: {
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        padding: '0 24px 80px',
        background: 'var(--bg)',
        color: 'var(--ink)',
        ...style,
      }}
    >
      <div style={{ position: 'relative', maxWidth: 1240, margin: '0 auto' }}>{children}</div>
    </div>
  )
}
