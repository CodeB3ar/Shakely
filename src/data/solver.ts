// Dial-it-in solver, ported from the Recipe (web) mock-up's drive() logic.
// Linear two-dial model over the real ingredient index:
//   slot amount = authored qty x scale, quantised to the ingredient's step;
//   scale: role 'protein' -> a, role 'energy' -> b, role 'base' -> fixed 1.
// Clamps a: 0.5-2, b: 0.4-1.6. One lock at a time (locking one releases the
// other). Targets are solved from the driver dial; a locked dial keeps its
// value (2x2 solve when the determinant allows), quantised then recomputed,
// and drift beyond tolerance becomes the "Closest possible" note.
import { ing, type Role } from './ingredients'
import type { Item } from './recipes'
import { computeMacros, lineFor, sumMacros, type Line, type Macros } from './macros'

export const CLAMP = { aMin: 0.5, aMax: 2, bMin: 0.4, bMax: 1.6 }
export const TOL_P = 1.5
export const TOL_K = 12

export function scaleOf(role: Role, a: number, b: number): number {
  return role === 'protein' ? a : role === 'energy' ? b : 1
}

/** Lines with the dial scale applied per role (quantised in the unit). */
export function dialLines(items: Item[], a: number, b: number): Line[] {
  return items.map((it) => {
    const d = ing(it.ing)
    return lineFor(it, scaleOf(d.role, a, b))
  })
}

/** Full macro totals of the quantised dial-adjusted lines (per serve). */
export function totalsOf(items: Item[], a: number, b: number): Macros {
  return sumMacros(dialLines(items, a, b).map(computeMacros))
}

// Authored (unscaled) coefficients: protein/kcal contributed by each role.
export function coefficients(items: Item[]): { P0: number; K0: number; Pp: number; Kp: number; Pe: number; Ke: number } {
  const c = { P0: 0, K0: 0, Pp: 0, Kp: 0, Pe: 0, Ke: 0 }
  items.forEach((it) => {
    const d = ing(it.ing)
    const p = (d.per100g.p * d.gramsPerUnit) / 100 * it.qty
    const k = (d.per100g.kcal * d.gramsPerUnit) / 100 * it.qty
    if (d.role === 'protein') { c.Pp += p; c.Kp += k } else if (d.role === 'energy') { c.Pe += p; c.Ke += k } else { c.P0 += p; c.K0 += k }
  })
  return c
}

export function solve(items: Item[], a: number, b: number, driver: 'p' | 'k',
  val: number, cur: { p: number; k: number }, lockP: boolean, lockK: boolean): { a: number; b: number; note: string; totals: Macros } {
  const co = coefficients(items)
  const det = co.Pp * co.Ke - co.Pe * co.Kp
  let a1 = a
  let b1 = b
  const both = (P: number, K: number) => {
    a1 = ((P - co.P0) * co.Ke - co.Pe * (K - co.K0)) / det
    b1 = (co.Pp * (K - co.K0) - (P - co.P0) * co.Kp) / det
  }
  if (driver === 'p') {
    if (lockK && Math.abs(det) > 1e-6) both(val, cur.k)
    else if (co.Pp > 0) a1 = (val - co.P0 - b1 * co.Pe) / co.Pp
  } else {
    if (lockP && Math.abs(det) > 1e-6) both(cur.p, val)
    else if (co.Ke > 0) b1 = (val - co.K0 - a1 * co.Kp) / co.Ke
  }
  a1 = Math.max(CLAMP.aMin, Math.min(CLAMP.aMax, a1))
  b1 = Math.max(CLAMP.bMin, Math.min(CLAMP.bMax, b1))
  const totals = totalsAt(items, a1, b1)
  let note = ''
  const missP = driver === 'p' && Math.abs(totals.p - val) > TOL_P
  const missK = driver === 'k' && Math.abs(totals.kcal - val) > TOL_K
  const drift = (driver === 'p' && lockK && Math.abs(totals.kcal - cur.k) > TOL_K) ||
    (driver === 'k' && lockP && Math.abs(totals.p - cur.p) > TOL_P)
  if (missP || missK || drift) {
    note = `Closest possible with these ingredients: ${Math.round(totals.p)}g protein, ${Math.round(totals.kcal)} kcal.`
  }
  return { a: a1, b: b1, note, totals }
}

/** Totals of the quantised lines at the given dial positions (per serve). */
export const totalsAt = totalsOf

/** Slider bounds: quantised totals at the reachable dial extremes, under the clamps and the active lock. */
export function achievableRange(items: Item[], a: number, b: number, driver: 'p' | 'k', lockP: boolean, lockK: boolean):
  { min: number; max: number; step: number } {
  const co = coefficients(items)
  const t = totalsAt(items, a, b) // current locked values
  const q = (m: Macros) => (driver === 'p' ? Math.round(m.p) : Math.round(m.kcal / 5) * 5)
  if (driver === 'p') {
    if (!lockK) {
      // Protein drag: b holds at its current position, a sweeps the clamp.
      const lo = totalsAt(items, CLAMP.aMin, b)
      const hi = totalsAt(items, CLAMP.aMax, b)
      return { min: Math.min(q(lo), q(hi)), max: Math.max(q(lo), q(hi)), step: 1 }
    }
    // kcal pinned: b = (kKeep - K0 - a*Kp) / Ke must stay inside the b clamp.
    const feasibleA = (av: number) => co.Ke > 0
      ? (t.kcal - co.K0 - av * co.Kp) / co.Ke
      : 0
    const bAtLo = feasibleA(CLAMP.aMin)
    const bAtHi = feasibleA(CLAMP.aMax)
    const inB = (bv: number) => bv >= CLAMP.bMin - 1e-9 && bv <= CLAMP.bMax + 1e-9
    let lo: Macros
    let hi: Macros
    if (inB(bAtLo) && inB(bAtHi)) {
      lo = totalsAt(items, CLAMP.aMin, Math.max(CLAMP.bMin, Math.min(CLAMP.bMax, bAtLo)))
      hi = totalsAt(items, CLAMP.aMax, Math.max(CLAMP.bMin, Math.min(CLAMP.bMax, bAtHi)))
    } else if (inB(bAtLo)) {
      const aMax2 = co.Ke > 0 && co.Kp !== 0
        ? (t.kcal - co.K0 - CLAMP.bMax * co.Ke) / co.Kp
        : CLAMP.aMax
      lo = totalsAt(items, CLAMP.aMin, Math.max(CLAMP.bMin, Math.min(CLAMP.bMax, bAtLo)))
      hi = totalsAt(items, Math.max(CLAMP.aMin, Math.min(CLAMP.aMax, aMax2)), CLAMP.bMax)
    } else if (inB(bAtHi)) {
      const aMin2 = co.Ke > 0 && co.Kp !== 0
        ? (t.kcal - co.K0 - CLAMP.bMin * co.Ke) / co.Kp
        : CLAMP.aMin
      lo = totalsAt(items, Math.max(CLAMP.aMin, Math.min(CLAMP.aMax, aMin2)), CLAMP.bMin)
      hi = totalsAt(items, CLAMP.aMax, Math.max(CLAMP.bMin, Math.min(CLAMP.bMax, bAtHi)))
    } else {
      lo = totalsAt(items, CLAMP.aMin, CLAMP.bMin)
      hi = totalsAt(items, CLAMP.aMax, CLAMP.bMax)
    }
    return { min: Math.min(q(lo), q(hi)), max: Math.max(q(lo), q(hi)), step: 1 }
  }
  if (!lockP) {
    // kcal drag: a holds, b sweeps the clamp.
    const lo = totalsAt(items, a, CLAMP.bMin)
    const hi = totalsAt(items, a, CLAMP.bMax)
    return { min: Math.min(q(lo), q(hi)), max: Math.max(q(lo), q(hi)), step: 5 }
  }
  // protein pinned: a = (pKeep - P0 - b*Pe) / Pp must stay inside the a clamp.
  const inA = (av: number) => av >= CLAMP.aMin - 1e-9 && av <= CLAMP.aMax + 1e-9
  const aAtLo = co.Pp > 0 ? (t.p - co.P0 - CLAMP.bMin * co.Pe) / co.Pp : 0
  const aAtHi = co.Pp > 0 ? (t.p - co.P0 - CLAMP.bMax * co.Pe) / co.Pp : 0
  let lo: Macros
  let hi: Macros
  if (inA(aAtLo) && inA(aAtHi)) {
    lo = totalsAt(items, Math.max(CLAMP.aMin, Math.min(CLAMP.aMax, aAtLo)), CLAMP.bMin)
    hi = totalsAt(items, Math.max(CLAMP.aMin, Math.min(CLAMP.aMax, aAtHi)), CLAMP.bMax)
  } else {
    lo = totalsAt(items, CLAMP.aMin, CLAMP.bMin)
    hi = totalsAt(items, CLAMP.aMin, CLAMP.bMax)
  }
  return { min: Math.min(q(lo), q(hi)), max: Math.max(q(lo), q(hi)), step: 5 }
}

// ---- undo history with drag coalescing (mock-up: 800 ms idle) ----

export const UNDO_MAX = 30
export const DRAG_IDLE_MS = 800

export interface DialSnapshot {
  a: number
  b: number
}

/**
 * Snapshot the state BEFORE a mutation, with coalescing: pushes when the
 * last mutation was more than DRAG_IDLE_MS ago (so a continuous drag is a
 * single undo step).
 */
export function pushDial<H extends DialSnapshot>(hist: H[], now: number, lastDrive: number, snap: H):
  { hist: H[]; lastDrive: number } {
  const next = now - lastDrive > DRAG_IDLE_MS ? [...hist, snap].slice(-UNDO_MAX) : hist
  return { hist: next, lastDrive: now }
}

export function popDial<H extends DialSnapshot>(hist: H[]): { snap: H | undefined; hist: H[] } {
  if (hist.length === 0) return { snap: undefined, hist }
  return { snap: hist[hist.length - 1], hist: hist.slice(0, -1) }
}
