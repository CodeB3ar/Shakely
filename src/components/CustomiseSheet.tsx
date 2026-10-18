// Customise sheet (mobile Recipe): bottom sheet for tap-to-edit — resize,
// swap (with protein/kcal deltas at the same amount), remove. Focus trap
// while open, focus + scroll restore on close (useFocusTrap).
import { type CSSProperties, type ReactNode } from 'react'
import { useFocusTrap } from './useFocusTrap'
import { Sticker } from './Sticker'
import { ing } from '../data/ingredients'

const sgn = (n: number, d: number) => {
  const m = 10 ** d
  const v = Math.round(n * m) / m
  return `${v > 0 ? '+' : v < 0 ? '−' : '±'}${Math.abs(v)}`
}

export interface SheetRow {
  ing: string
  qty: number // current per-serve quantity in the ingredient's unit
  scale: number // dial-in scale already applied to qty
  total: { p: number; kcal: number } // per serve contribution shown
  alts: { id: string; name: string; dP: number; dK: number }[]
}

export default function CustomiseSheet({
  open,
  onClose,
  rows,
  onQty,
  onRemove,
  onSwap,
  onUndo,
  canUndo,
  footer,
}: {
  open: boolean
  onClose: () => void
  rows: SheetRow[]
  onQty: (slot: string, delta: number) => void
  onRemove: (slot: string) => void
  onSwap: (slot: string, toId: string) => void
  onUndo: () => void
  canUndo: boolean
  footer?: ReactNode
}) {
  const ref = useFocusTrap(open, onClose)
  if (!open) return null

  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    borderTop: '1px solid #f0f0f0',
  }

  const altOf = (slot: string): { id: string; name: string; dP: number; dK: number }[] => rows.find((r) => r.ing === slot)?.alts ?? []

  return (
    <div role="dialog" aria-modal="true" aria-label="Customise shake" className="sheet-veil">
      <div ref={ref} className="sheet-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 24, letterSpacing: '-0.02em', fontWeight: 500 }}>
            <span style={{ color: 'var(--ink-mute)' }}>Customise.</span>{' '}
            <span>Tap to change.</span>
          </h2>
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo last change"
            style={{ width: 48, height: 48, border: 0, borderRadius: '50%', background: 'var(--card)', boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 6px 16px rgba(0,0,0,0.05)', opacity: canUndo ? 1 : 0.35, cursor: canUndo ? 'pointer' : 'default', flex: 'none' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h10a6 6 0 0 1 0 12h-3" /><path d="M8 4 4 8l4 4" /></svg>
          </button>
        </div>

        <div style={{ marginTop: 6, maxHeight: 'min(52vh, 560px)', overflowY: 'auto', paddingBottom: 8 }}>
          {rows.map((r) => {
            const d = ing(r.ing)
            const alts = altOf(r.ing)
            return (
              <div key={r.ing}>
                <div style={rowStyle}>
                  <span style={{ flex: 'none' }}>
                    <Sticker id={r.ing} size={40} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 16, fontWeight: 500 }}>
                      {d.name}
                      {r.scale !== 1 && <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}> · ×{r.scale}</span>}
                    </span>
                    <span style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)' }}>
                      {r.total.p ? `${Math.round(r.total.p)}g protein · ` : ''}{Math.round(r.total.kcal)} kcal
                    </span>
                  </span>
                  <span style={{ display: 'flex', gap: 6, flex: 'none', alignItems: 'center' }}>
                    <button type="button" onClick={() => onQty(r.ing, -1)} style={{ width: 40, height: 44, border: 0, borderRadius: 14, background: '#2b2b2b', color: '#ffffff', fontSize: 18, cursor: 'pointer' }} aria-label={`Less ${d.name}`}>−</button>
                    <span style={{ minWidth: 52, textAlign: 'center', fontSize: 15, fontWeight: 500 }}>
                      {Math.round(r.qty * 100) / 100} {d.unit}
                    </span>
                    <button type="button" onClick={() => onQty(r.ing, 1)} style={{ width: 40, height: 44, border: 0, borderRadius: 14, background: '#2b2b2b', color: '#ffffff', fontSize: 18, cursor: 'pointer' }} aria-label={`More ${d.name}`}>+</button>
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '2px 0 12px' }}>
                  {alts.map((alt) => (
                    <button
                      key={alt.id}
                      type="button"
                      onClick={() => onSwap(r.ing, alt.id)}
                      style={{ height: 40, boxSizing: 'border-box', padding: '0 14px', borderRadius: 20, border: '1px solid var(--line)', background: 'var(--card)', color: '#222222', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                    >
                      {alt.name}
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 400, color: 'var(--ink-soft)' }}>{sgn(alt.dP, 1)}g protein · {sgn(alt.dK, 0)} kcal</span>
                    </button>
                  ))}
                  <button type="button" onClick={() => onRemove(r.ing)} aria-label={`Remove ${d.name}`} style={{ width: 44, height: 44, border: 0, borderRadius: '50%', background: 'transparent', cursor: 'pointer', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 7 7 18M7 7l11 11" /></svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {footer}
      </div>
    </div>
  )
}
