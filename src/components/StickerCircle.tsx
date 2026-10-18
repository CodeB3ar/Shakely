// Ring of ingredient stickers used by the Home hero circle and Pantry.
// Sizing comes from the container, never a fixed width (fixes the
// overflow-under-500px audit finding). Animation pauses off-screen.
import type { CSSProperties, ReactNode } from 'react'
import { Sticker } from './Sticker'
import { useInView } from '../hooks/useInView'

export function StickerCircle({
  ids,
  animate = true,
  sizeLabels = ['clamp(40px, 5.2vw, 76px)', 'clamp(52px, 6.8vw, 100px)', 'clamp(46px, 6vw, 88px)'],
  extraChildren,
  ringStyle,
}: {
  ids: string[]
  animate?: boolean
  sizeLabels?: string[]
  extraChildren?: ReactNode
  ringStyle?: CSSProperties
}) {
  const [ref, shown] = useInView<HTMLDivElement>(0.05)
  const run = animate && shown
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', ...ringStyle }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid #e3e3e3' }} />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '8%',
          top: '8%',
          width: '84%',
          height: '84%',
          borderRadius: '50%',
          background: 'var(--card)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 30px 80px rgba(0,0,0,0.08)',
        }}
      />
      {ids.map((id, i) => {
        const angle = (i / ids.length) * Math.PI * 2 - Math.PI / 2
        const x = 50 + 47 * Math.cos(angle)
        const y = 50 + 47 * Math.sin(angle)
        const rotate = (Math.round(((angle * 180) / Math.PI + 90) / 10) * 10) % 24
        return (
          <div
            key={id}
            aria-hidden="true"
            style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <Sticker
              id={id}
              size={sizeLabels[i % sizeLabels.length]}
              rotate={rotate}
              delay={-(i % 5) * 0.9}
              hero
              animate={run}
            />
          </div>
        )
      })}
      {extraChildren}
    </div>
  )
}
