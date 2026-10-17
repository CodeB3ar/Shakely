// Level variant pills. A level is a recipe variant with real stats, not a
// filter. Announced as a radiogroup with aria-checked (audit fix).
import type { CSSProperties } from 'react'
import { LEVELS, type Level } from '../state/levels'

export default function LevelPills({
  level,
  onPick,
  size = 'md',
  label = 'Level',
}: {
  level: Level
  onPick: (lv: Level) => void
  size?: 'md' | 'lg'
  label?: string
}) {
  const height = size === 'lg' ? 48 : 44
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {LEVELS.map((meta, i) => {
        const on = level === i
        const pill: CSSProperties = {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          height,
          boxSizing: 'border-box',
          padding: size === 'lg' ? '0 10px 0 20px' : '0 6px 0 16px',
          border: 0,
          borderRadius: height / 2,
          fontSize: size === 'lg' ? 17 : 15,
          fontWeight: on ? 600 : 500,
          background: on ? 'var(--card)' : 'transparent',
          color: on ? 'var(--ink)' : 'var(--ink-soft)',
          boxShadow: on ? '0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px var(--line)' : 'none',
          cursor: 'pointer',
        }
        return (
          <button
            key={meta.label}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onPick(i as Level)}
            style={pill}
          >
            <span>{meta.label}</span>
            <span
              style={{
                display: 'block',
                height: size === 'lg' ? 30 : 26,
                lineHeight: size === 'lg' ? '30px' : '26px',
                padding: '0 10px',
                borderRadius: (size === 'lg' ? 30 : 26) / 2,
                fontSize: size === 'lg' ? 14 : 13,
                fontWeight: 500,
                color: on ? '#555555' : '#6b6b6b',
                background: on ? 'var(--chip)' : '#ececec',
              }}
            >
              {meta.time}
            </span>
          </button>
        )
      })}
    </div>
  )
}
