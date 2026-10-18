// Macro panel from the Recipe mock-up: 4 values + two-tone split bar.
// Numbers are computed upstream (data/macros.ts); this is presentational.
import type { Macros } from '../data/macros'

export function MacroBar({
  macros,
  serves = 1,
}: {
  macros: Macros
  serves?: number
}) {
  const sub = (v: number, u: string) =>
    serves === 1 ? 'per serve' : `${Math.round(v * serves)}${u} in ${serves}`
  const items = [
    { label: 'Protein', value: `${Math.round(macros.p)}g`, sub: sub(macros.p, 'g') },
    { label: 'Carbs', value: `${Math.round(macros.c)}g`, sub: sub(macros.c, 'g') },
    { label: 'Fat', value: `${Math.round(macros.f)}g`, sub: sub(macros.f, 'g') },
    { label: 'Calories', value: `${Math.round(macros.kcal)}`, sub: sub(macros.kcal, ' kcal') },
  ]
  const pk = macros.p * 4
  const ck = macros.c * 4
  const fk = macros.f * 9
  const tk = pk + ck + fk || 1
  const pc = Math.round((pk / tk) * 100)
  const cc = Math.round((ck / tk) * 100)
  return (
    <div style={{ boxSizing: 'border-box', padding: 24, borderRadius: 'var(--r-lg)', background: 'var(--card)', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {items.map((m) => (
          <div key={m.label} style={{ flex: '1 1 120px', minWidth: 0 }}>
            <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{m.label}</div>
            <div style={{ marginTop: 2, fontSize: 34, fontWeight: 500, letterSpacing: '-0.03em' }}>{m.value}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{m.sub}</div>
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        style={{ marginTop: 20, display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', background: '#ececec' }}
      >
        <div style={{ width: `${(pk / tk) * 100}%`, background: '#111111' }} />
        <div style={{ width: `${(ck / tk) * 100}%`, background: '#8e8e8e' }} />
        <div style={{ width: `${(fk / tk) * 100}%`, background: '#d0d0d0' }} />
      </div>
      <div style={{ marginTop: 10, fontSize: 13, color: 'var(--ink-soft)' }}>
        Calories from {pc}% protein, {cc}% carbs, {100 - pc - cc}% fat
      </div>
    </div>
  )
}
