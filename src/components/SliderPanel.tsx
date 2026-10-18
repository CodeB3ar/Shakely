// Dial-it-in panel shell (Recipe mock-up). Presentational in M1; the
// solver from the Recipe (web) mock-up is ported and mounted in M2.
// Inputs commit through the handlers passed in; no internal dead state.
import { Chip } from './Chip'
import type { CSSProperties } from 'react'

export interface SliderSpec {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  hint?: string
  locked?: boolean
  onLock?: () => void
  onChange: (v: number) => void
}

export default function SliderPanel({
  specs,
  note,
  onUndo,
  onReset,
  canUndo,
  canReset,
}: {
  specs: SliderSpec[]
  note?: string
  onUndo?: () => void
  onReset?: () => void
  canUndo?: boolean
  canReset?: boolean
}) {
  return (
    <aside
      aria-label="Dial it in"
      style={{
        flex: '1 1 340px',
        maxWidth: 420,
        minWidth: 0,
        boxSizing: 'border-box',
        padding: 28,
        borderRadius: 36,
        background: 'var(--card)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.08)' as CSSProperties['boxShadow'],
      }}
    >
      <h2 style={{ margin: 0, fontSize: 28, lineHeight: 1.1, letterSpacing: '-0.03em', fontWeight: 500, color: '#8e8e8e' }}>
        <span style={{ display: 'block', color: '#111111' }}>Dial it in.</span>
        <span style={{ display: 'block' }}>Everything rescales.</span>
      </h2>
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {specs.map((sp) => (
          <div key={sp.id}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <label htmlFor={`sp-${sp.id}`} style={{ fontSize: 15, fontWeight: 500 }}>{sp.label}</label>
              <span style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>{sp.hint ?? sp.value}</span>
            </div>
            <input
              id={`sp-${sp.id}`}
              type="range"
              min={sp.min}
              max={sp.max}
              step={sp.step}
              value={sp.value}
              disabled={sp.locked}
              aria-disabled={sp.locked || undefined}
              onChange={(e) => sp.onChange(Number(e.target.value))}
              style={{ marginTop: 4 }}
            />
            <div style={{ marginTop: -2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                {sp.locked ? 'Locked — the other slider adjusts' : 'Drag to retune this shake'}
              </span>
              {sp.onLock && (
                <Chip
                  label={sp.locked ? 'Locked' : 'Lock'}
                  on={!!sp.locked}
                  onClick={sp.onLock}
                  style={{ height: 36, padding: '0 14px', fontSize: 14 }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      {(note || onUndo || onReset) && (
        <div style={{ marginTop: 24 }}>
          {note && (
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#6b6b6b' }}>{note}</p>
          )}
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            {onUndo && (
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                style={{ flex: 1, height: 44, borderRadius: 22, border: '1px solid var(--line)', background: 'var(--card)', color: '#111111', fontSize: 15, fontWeight: 500, opacity: canUndo ? 1 : 0.4, cursor: canUndo ? 'pointer' : 'default' }}
              >
                Undo
              </button>
            )}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                disabled={!canReset}
                style={{ flex: 1, height: 44, borderRadius: 22, border: '1px solid var(--line)', background: 'var(--card)', color: '#111111', fontSize: 15, fontWeight: 500, opacity: canReset ? 1 : 0.4, cursor: canReset ? 'pointer' : 'default' }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
