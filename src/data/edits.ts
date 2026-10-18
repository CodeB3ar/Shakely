// Explicit, persistable edits as deltas on top of the authored recipe
// (spec section 4). Ops are append-only; applying them re-derives the
// current item list. Swap keeps the same slot amount (grams) and
// re-quantises in the replacement ingredient's unit/step; deltas shown in
// Customise are computed at that same scale.
import { ing, ING_BY_ID } from './ingredients'
import type { Item } from './recipes'
import type { Edit } from '../state/profile'

export type { Edit, EditOp } from '../state/profile'

export function applyEdits(items: Item[], edits: Edit[]): Item[] {
  let out = items.map((it) => ({ ...it }))
  for (const e of edits) {
    if (e.op === 'remove') {
      out = out.filter((it) => it.ing !== e.slot)
    } else if (e.op === 'swap') {
      const id = typeof e.value === 'string' ? e.value : ''
      const cur = out.find((it) => it.ing === e.slot)
      if (!ING_BY_ID[id] || !cur) continue
      const grams = cur.qty * ing(e.slot).gramsPerUnit
      const nd = ing(id)
      const raw = grams / nd.gramsPerUnit
      const qty = Math.max(nd.step, Math.round(raw / nd.step) * nd.step)
      out = out.map((it) => (it.ing === e.slot ? { ing: id, qty } : it))
    } else if (e.op === 'qty') {
      const v = typeof e.value === 'number' ? e.value : NaN
      const d = ING_BY_ID[e.slot]
      if (out.some((it) => it.ing === e.slot) && Number.isFinite(v) && d) {
        const qty = Math.max(d.step, Math.round(v / d.step) * d.step)
        out = out.map((it) => (it.ing === e.slot ? { ing: e.slot, qty } : it))
      }
    } else if (e.op === 'scale') {
      const v = typeof e.value === 'number' ? Math.min(4, Math.max(0.25, e.value)) : NaN
      if (Number.isFinite(v)) {
        const d = ING_BY_ID[e.slot]
        out = out.map((it) => {
          if (it.ing !== e.slot || !d) return it
          const qty = Math.max(d.step, Math.round((it.qty * v) / d.step) * d.step)
          return { ing: it.ing, qty }
        })
      }
    }
  }
  return out
}

/**
 * Alt swap delta, at the same slot amount (grams): protein/kcal the
 * replacement would add versus the current slot ("+2 g protein · −40 kcal").
 */
export function swapDelta(items: Item[], slot: string, toId: string, a: number, b: number): { dP: number; dK: number } {
  const cur = items.find((it) => it.ing === slot)
  const nd = ING_BY_ID[toId]
  if (!cur || !nd) return { dP: 0, dK: 0 }
  // Swap keeps grams; recompute what the slot would weigh there.
  const grams = cur.qty * ing(slot).gramsPerUnit
  const raw = grams / nd.gramsPerUnit
  const qty = Math.max(nd.step, Math.round(raw / nd.step) * nd.step)
  const role = nd.role
  const sc = role === 'protein' ? a : role === 'energy' ? b : 1
  const newQty = Math.max(nd.step, Math.round((qty * sc) / nd.step) * nd.step)
  // Current slot's own quantised contribution:
  const cd = ing(slot)
  const cRole = cd.role
  const cSc = cRole === 'protein' ? a : cRole === 'energy' ? b : 1
  const cQty = Math.max(cd.step, Math.round((cur.qty * cSc) / cd.step) * cd.step)
  const dP = (nd.per100g.p * newQty * nd.gramsPerUnit) / 100 - (cd.per100g.p * cQty * cd.gramsPerUnit) / 100
  const dK = (nd.per100g.kcal * newQty * nd.gramsPerUnit) / 100 - (cd.per100g.kcal * cQty * cd.gramsPerUnit) / 100
  return { dP, dK }
}

/** True when any edit changes the authored recipe at the given level. */
export function meaningfulEdits(base: Item[], edits: Edit[]): boolean {
  if (edits.length === 0) return false
  const after = applyEdits(base, edits)
  const same = base.length === after.length && base.every((it, i) => it.ing === after[i].ing && Math.abs(it.qty - after[i].qty) < 1e-9)
  return !same
}
