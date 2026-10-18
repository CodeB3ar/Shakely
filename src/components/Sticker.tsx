// Sticker renderer: native colour emoji for the bundled map
// (data/stickers.tsx). Soft halo + soft shadow (two drop-shadows, CSS).
// Rotation rides the --r CSS variable so it never fights the .stk-hero
// float animation (transform-only there, paused off-screen, honours
// prefers-reduced-motion). Emoji are decorative: aria-hidden, with an
// optional sr-only-friendly label wrapper for singleton contexts.
import type { CSSProperties } from 'react'
import { stickerOf } from '../data/stickers'

export interface StickerProps {
  id: string
  size: number | string
  rotate?: number
  delay?: number
  hero?: boolean
  animate?: boolean
  label?: string
  style?: CSSProperties
}

export function Sticker({ id, size, rotate = 0, delay = 0, hero = false, animate = true, label, style }: StickerProps) {
  const cls = `stk${hero ? ' stk-hero' : ''}`
  const anim: CSSProperties | undefined = hero
    ? { animationPlayState: animate ? 'running' : 'paused', animationDelay: `${delay}s` }
    : undefined
  const glyph = (
    <span
      className={cls}
      aria-hidden="true"
      style={{ fontSize: size, lineHeight: 1, ['--r' as string]: `${rotate}deg`, ...anim, ...style }}
    >
      {stickerOf(id)}
    </span>
  )
  if (!label) return glyph
  return (
    <span role="img" aria-label={label}>
      {glyph}
    </span>
  )
}

/** Accessible label for a purely decorative sticker cluster. */
export function clusterLabel(items: string[], nameOf: (id: string) => string): string | undefined {
  if (items.length === 0) return undefined
  return items.map(nameOf).join(', ')
}
