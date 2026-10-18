// Recipe: working Dial-it-in (solver port from the Recipe (web) mock-up),
// Customise (web inline swap accordion + mobile bottom sheet), Serves 1-4,
// Undo history with 800 ms drag coalescing, URL-carried level/serves/
// targets (replace + at most one write per frame). Save writes a real
// Saved entry; un-save removes it; Next shake wraps the recipe list.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams, type NavigateFunction, type SetURLSearchParams } from 'react-router-dom'
import Nav from '../components/Nav'
import { Screen } from '../components/Screen'
import LevelPills from '../components/LevelPills'
import { MacroBar } from '../components/MacroBar'
import ServesStepper from '../components/ServesStepper'
import SliderPanel, { type SliderSpec } from '../components/SliderPanel'
import CustomiseSheet, { type SheetRow } from '../components/CustomiseSheet'
import { Sticker } from '../components/Sticker'
import { useBlend, type Edit } from '../state/store'
import type { Level } from '../state/levels'
import { computeMacros, itemsForLevel, recipeOf } from '../data/macros'
import { type Item, type Recipe } from '../data/recipes'
import { ing, ING_BY_ID } from '../data/ingredients'
import { applyEdits, swapDelta, meaningfulEdits } from '../data/edits'
import { nextIdInList } from '../data/next-shake'
import { takeDraft } from '../state/draft'
import { scaleOf, solve, totalsOf, achievableRange, pushDial, popDial, type DialSnapshot } from '../data/solver'

const GOAL_HEADLINE: Record<string, string> = {
  post: 'Post-workout shake',
  pre: 'Pre-workout shake',
  green: 'Greens-forward shake',
  lean: 'Lighter everyday shake',
  'high-protein': 'High-protein shake',
}

const LIQUIDS = ['milk', 'oat-milk', 'almond-milk', 'coconut-water', 'coffee']

interface Snapshot extends DialSnapshot {
  edits: Edit[]
}

interface UiState {
  a: number
  b: number
  serves: number
  edits: Edit[]
  hist: Snapshot[]
  lastDrive: number
  lockP: boolean
  lockK: boolean
  note: string
  swapOpen: string | null
  sheetSlot: string | null
}

const freshState = (serves = 1): UiState => ({
  a: 1, b: 1, serves, edits: [], hist: [], lastDrive: 0, lockP: false, lockK: false, note: '', swapOpen: null, sheetSlot: null,
})

const clampServes = (n: number) => (Number.isFinite(n) && n >= 1 ? Math.min(4, Math.round(n)) : 1)

/** Solve a and b stepwise from URL targets, no undo pushes (URL build back). */
function solveState(base: Item[], from: UiState, driver: 'p' | 'k', val: number): UiState {
  const items = applyEdits(base, from.edits)
  const cur = totalsOf(items, from.a, from.b)
  const res = solve(items, from.a, from.b, driver, val, { p: cur.p, k: cur.kcal }, from.lockP, from.lockK)
  return { ...from, a: res.a, b: res.b, note: res.note }
}

export default function Recipe() {
  const route = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { saved, saveRecipe, unsave } = useBlend()

  const urlServes = useMemo(() => clampServes(Number(searchParams.get('serves')) || 1), [searchParams])
  const urlP = useMemo(() => {
    const n = Number(searchParams.get('p'))
    return searchParams.has('p') && Number.isFinite(n) && n > 0 ? n : null
  }, [searchParams])
  const urlK = useMemo(() => {
    const n = Number(searchParams.get('k'))
    return searchParams.has('k') && Number.isFinite(n) && n > 0 ? n : null
  }, [searchParams])

  const rc = recipeOf(Number(route.id))
  if (!rc) {
    return (
      <Screen>
        <div style={{ position: 'relative' }}>
          <Nav />
          <div style={{ marginTop: 48, padding: '72px 24px', borderRadius: 'var(--r-lg)', background: 'var(--card)', textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 500, letterSpacing: '-0.02em' }}>Recipe not found</h1>
            <Link to="/browse" style={{ display: 'inline-block', marginTop: 20, height: 44, lineHeight: '44px', borderRadius: 22, background: 'var(--ink)', color: '#ffffff', padding: '0 22px', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
              Browse shakes
            </Link>
          </div>
        </div>
      </Screen>
    )
  }

  // Open-from-cookbook seeding: URL wins when explicit, else the card-click
  // draft, else the saved entry itself (direct bookmark).
  const entry = saved.find((e) => e.recipeId === rc.id)
  const draft = takeDraft(rc.id)
  const hasUrlLevel = searchParams.has('level') && [0, 1, 2].includes(Number(searchParams.get('level')))
  const level: Level = hasUrlLevel ? (Number(searchParams.get('level')) as Level) : ((draft ? draft.level : entry?.level) ?? 0)
  const seedServes = searchParams.has('serves') ? urlServes : clampServes(draft ? draft.serves : entry ? entry.serves : 1)
  const seedEdits: Edit[] = draft && draft.edits ? draft.edits : entry?.edits ?? []

  return (
    <RecipeView
      rc={rc}
      level={level}
      seedServes={seedServes}
      seedEdits={seedEdits}
      urlP={urlP}
      urlK={urlK}
      navigate={navigate}
      setSearchParams={setSearchParams}
      saved={saved}
      saveRecipe={saveRecipe}
      unsave={unsave}
    />
  )
}

function RecipeView({
  rc,
  level,
  seedServes,
  seedEdits,
  urlP,
  urlK,
  navigate,
  setSearchParams,
  saved,
  saveRecipe,
  unsave,
}: {
  rc: Recipe
  level: Level
  seedServes: number
  seedEdits: Edit[]
  urlP: number | null
  urlK: number | null
  navigate: NavigateFunction
  setSearchParams: SetURLSearchParams
  saved: { recipeId: number }[]
  saveRecipe: (recipeId: number, patch: { level: Level; serves: number; edits?: Edit[] }) => void
  unsave: (recipeId: number) => void
}) {
  const results = useBlend((s) => s.results)
  const resultsKey = results ? results.join(',') : ''
  const base = useMemo(() => itemsForLevel(rc, level) as Item[], [rc, level])
  // Seed snapshot: the entry the page was opened from (draft or saved).
  // A later route change to a DIFFERENT recipe refreshes it.
  const seedRef = useRef({ recipeId: rc.id, serves: seedServes, edits: seedEdits })
  const [ui, setUi] = useState<UiState>(() => {
    let s = freshState(seedServes)
    s.edits = [...seedEdits]
    if (urlP != null) s = solveState(base, s, 'p', urlP)
    if (urlK != null) s = solveState(base, s, 'k', urlK)
    return s
  })

  // Re-init when the route/level/target state genuinely changes (card nav,
  // Next shake, level pill). Our own URL writes are recognised and skipped.
  const initKey = `${rc.id}:${level}:${seedServes}:${urlP ?? 'x'}:${urlK ?? 'x'}`
  const seen = useRef<Set<string>>(new Set())
  useEffect(() => {
    if (seedRef.current.recipeId !== rc.id) seedRef.current = { recipeId: rc.id, serves: seedServes, edits: seedEdits }
  }, [rc.id, seedServes, seedEdits])
  useEffect(() => {
    if (seen.current.has(initKey)) return
    seen.current.add(initKey)
    const seed = seedRef.current
    let s = freshState(seed.serves)
    s.edits = [...seed.edits]
    if (urlP != null) s = solveState(base, s, 'p', urlP)
    if (urlK != null) s = solveState(base, s, 'k', urlK)
    setUi(s)
  }, [initKey, base, seedEdits, seedServes, urlP, urlK])

  // ---- URL sync: replace; at most one write per animation frame ----
  const pendingWrite = useRef<UiState | null>(null)
  const frame = useRef(0)
  const writeUrl = useCallback(
    (next: UiState) => {
      pendingWrite.current = next
      if (frame.current) return
      frame.current = requestAnimationFrame(() => {
        frame.current = 0
        const s = pendingWrite.current
        pendingWrite.current = null
        if (!s) return
        const cur = totalsOf(applyEdits(base, s.edits), s.a, s.b)
        const p2 = new URLSearchParams()
        p2.set('level', String(level))
        p2.set('serves', String(s.serves))
        const p = Math.max(1, Math.round(cur.p))
        const k = Math.max(5, Math.round(cur.kcal / 5) * 5)
        p2.set('p', String(p))
        p2.set('k', String(k))
        setSearchParams(p2, { replace: true })
        seen.current.add(`${rc.id}:${level}:${s.serves}:${p}:${k}`)
      })
    },
    [base, level, rc.id, setSearchParams],
  )
  const push = useCallback(
    (mut: (s: UiState) => UiState) =>
      setUi((s) => {
        const n = mut(s)
        writeUrl(n)
        return n
      }),
    [writeUrl],
  )

  // ---- actions ----
  const drive = useCallback(
    (driver: 'p' | 'k', val: number) =>
      push((s) => {
        const items = applyEdits(base, s.edits)
        const cur = totalsOf(items, s.a, s.b)
        const res = solve(items, s.a, s.b, driver, val, { p: cur.p, k: cur.kcal }, s.lockP, s.lockK)
        const sg = pushDial(s.hist, Date.now(), s.lastDrive, { a: s.a, b: s.b, edits: s.edits })
        return { ...s, a: res.a, b: res.b, note: res.note, hist: sg.hist, lastDrive: sg.lastDrive }
      }),
    [base, push],
  )

  const toggleLock = useCallback(
    (which: 'p' | 'k') =>
      push((s) => (which === 'p' ? { ...s, lockP: !s.lockP, lockK: false, note: '' } : { ...s, lockK: !s.lockK, lockP: false, note: '' })),
    [push],
  )

  const removeIng = useCallback(
    (slot: string) =>
      push((s) => ({
        ...s,
        edits: [...s.edits, { op: 'remove', slot } as Edit],
        hist: [...s.hist, { a: s.a, b: s.b, edits: s.edits }].slice(-30),
        swapOpen: null,
        sheetSlot: null,
        note: '',
      })),
    [push],
  )

  const swapIng = useCallback(
    (slot: string, toId: string) =>
      push((s) => ({
        ...s,
        edits: [...s.edits, { op: 'swap', slot, value: toId } as Edit],
        hist: [...s.hist, { a: s.a, b: s.b, edits: s.edits }].slice(-30),
        swapOpen: null,
        sheetSlot: null,
        note: '',
      })),
    [push],
  )

  const qtyIng = useCallback(
    (slot: string, delta: number) =>
      push((s) => {
        const items = applyEdits(base, s.edits)
        const cur = items.find((x) => x.ing === slot)
        const d = ing(slot)
        if (!cur || !d) return s
        const next = Math.max(d.step, cur.qty + delta * d.step)
        return {
          ...s,
          edits: [...s.edits, { op: 'qty', slot, value: next } as Edit],
          hist: [...s.hist, { a: s.a, b: s.b, edits: s.edits }].slice(-30),
          note: '',
        }
      }),
    [base, push],
  )

  const undo = useCallback(
    () =>
      push((s) => {
        const { snap, hist } = popDial(s.hist)
        if (!snap) return s
        return { ...s, a: snap.a, b: snap.b, edits: (snap as Snapshot).edits, hist: hist as Snapshot[], note: '', swapOpen: null }
      }),
    [push],
  )

  const reset = useCallback(() => push((s) => freshState(s.serves)), [push])
  const setServes = useCallback((n: number) => push((s) => ({ ...s, serves: clampServes(n) })), [push])

  const pickLevel = useCallback(
    (lv: Level) => {
      navigate(`/recipe/${rc.id}?level=${lv}&serves=${ui.serves}`, { replace: true })
      seen.current = new Set()
      setUi(freshState(ui.serves))
    },
    [navigate, rc.id, ui.serves],
  )
  // Next shake follows the results list the user came from (Browse,
  // Pantry, Saved, Home), only when the current recipe is in it; else the
  // next recipe id wraps the whole list.
  const nextShake = useCallback(() => {
    const ids = resultsKey ? resultsKey.split(',').map(Number) : null
    const nextId = nextIdInList(ids, rc.id)
    navigate(`/recipe/${nextId}?level=${level}`)
  }, [navigate, rc.id, resultsKey, level])

  // ---- derived view data ----
  const items = applyEdits(base, ui.edits)
  const totals = totalsOf(items, ui.a, ui.b)
  const isSaved = saved.some((x) => x.recipeId === rc.id)
  const edited = ui.hist.length > 0 || meaningfulEdits(base, ui.edits)
  const canUndo = ui.hist.length > 0
  const canReset = ui.hist.length > 0 || ui.edits.length > 0

  interface RowModel {
    id: string
    name: string
    qty: number
    unit: string
    serveAmount: string
    serveMacro: string
    macros: { p: number; kcal: number }
    alts: { id: string; name: string; dP: number; dK: number }[]
  }

  const rows: RowModel[] = items.map((it) => {
    const d = ing(it.ing)
    const sc = scaleOf(d.role, ui.a, ui.b)
    const qty = Math.max(d.step, Math.round((it.qty * sc) / d.step) * d.step)
    const m = computeMacros({ ing: d, qty, grams: qty * d.gramsPerUnit })
    const fmt = (n: number) => (Math.round(n * 100) / 100).toString()
    const alts = d.alts.map((altId) => {
      const nd = ING_BY_ID[altId]
      const { dP, dK } = swapDelta(items, it.ing, altId, ui.a, ui.b)
      return { id: altId, name: nd.name, dP, dK }
    })
    return {
      id: it.ing,
      name: d.name,
      qty,
      unit: d.unit,
      serveAmount: `${fmt(qty * ui.serves)} ${d.unit}`,
      serveMacro: `${Math.round(m.p * ui.serves)}g protein · ${Math.round(m.kcal * ui.serves)} kcal`,
      macros: { p: m.p, kcal: m.kcal },
      alts,
    }
  })

  // Method generated from the actual slot list (liquid -> dry -> blend).
  const liquidRow = rows.find((r) => LIQUIDS.includes(r.id))
  const iceRow = items.find((x) => x.ing === 'ice')
  const restNames = rows.filter((r) => !LIQUIDS.includes(r.id) && r.id !== 'ice').map((r) => r.name.toLowerCase())
  const list = (names: string[]) => (names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`)
  const steps = [
    `Pour in the ${liquidRow ? liquidRow.name.toLowerCase() : 'first ingredient'}${iceRow ? ' and the ice' : ''}.`,
    restNames.length ? `Add the ${list(restNames)}.` : 'Add anything else you like.',
    'Blend for 30 to 45 seconds until smooth, then pour and drink straight away.',
  ]

  // ---- dial specs for the side panel ----
  const pRange = achievableRange(items, ui.a, ui.b, 'p', ui.lockP, ui.lockK)
  const kRange = achievableRange(items, ui.a, ui.b, 'k', ui.lockP, ui.lockK)
  const snap = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
  const specs: SliderSpec[] = [
    {
      id: 'p',
      label: 'Protein',
      value: snap(Math.round(totals.p), pRange.min, pRange.max),
      min: Math.min(pRange.min, Math.round(totals.p)),
      max: Math.max(pRange.max, Math.round(totals.p)),
      step: 1,
      hint: `${Math.round(totals.p)}g`,
      locked: ui.lockP,
      onLock: () => toggleLock('p'),
      onChange: (v) => drive('p', v),
    },
    {
      id: 'k',
      label: 'Calories',
      value: snap(Math.round(totals.kcal / 5) * 5, kRange.min, kRange.max),
      min: Math.min(kRange.min, Math.round(totals.kcal)),
      max: Math.max(kRange.max, Math.round(totals.kcal)),
      step: 5,
      hint: `${Math.round(totals.kcal)} kcal`,
      locked: ui.lockK,
      onLock: () => toggleLock('k'),
      onChange: (v) => drive('k', v),
    },
  ]

  // ---- Customise sheet (mobile only) ----
  const sheetRows: SheetRow[] = (ui.sheetSlot
    ? [...rows].sort((x, y) => (x.id === ui.sheetSlot ? -1 : y.id === ui.sheetSlot ? 1 : 0))
    : rows
  ).map((r) => ({
    ing: r.id,
    qty: r.qty,
    scale: scaleOf(ing(r.id).role, ui.a, ui.b),
    total: { p: r.macros.p, kcal: r.macros.kcal },
    alts: r.alts,
  }))

  const saveLabel = isSaved ? 'Saved to cookbook' : edited ? 'Save my version' : 'Save to cookbook'
  const onSave = () => {
    if (isSaved) unsave(rc.id)
    else saveRecipe(rc.id, { level, serves: ui.serves, edits: edited ? ui.edits : undefined })
  }

  const headline = GOAL_HEADLINE[rc.goal.find((g) => GOAL_HEADLINE[g]) ?? ''] ?? 'Shake'

  return (
    <Screen>
      <div aria-hidden="true" style={{ position: 'absolute', right: -240, top: -340, width: 820, height: 820, borderRadius: '50%', border: '1px solid #e8e8e8' }} />
      <div aria-hidden="true" style={{ position: 'absolute', left: -300, top: 900, width: 800, height: 800, borderRadius: '50%', border: '1px solid #e8e8e8' }} />
      <div style={{ position: 'relative', paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}>
        <Nav />

        <div className="recipe-root">
          <div>
            <Link to="/browse" className="recipe-back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
              Back to all shakes
            </Link>
            <h1 style={{ margin: '4px 0 0', fontSize: 'clamp(36px, 4.4vw, 60px)', lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 500, color: 'var(--ink-mute)' }}>
              <span style={{ display: 'block' }}>{headline}</span>
              <span style={{ display: 'block', color: 'var(--ink)' }}>{rc.name}</span>
            </h1>
          </div>

          <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18 }}>
            <LevelPills level={level} onPick={pickLevel} label="Make it" />
            <ServesStepper serves={ui.serves} onChange={setServes} max={4} />
          </div>

          <div style={{ marginTop: 24, maxWidth: 760 }}>
            <MacroBar macros={totals} serves={ui.serves} />
          </div>

          <div className="recipe-wrap">
            <div style={{ flex: '1 1 560px', minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em' }}>Ingredients</h2>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-soft)' }}>
                {rows.length} ingredient{rows.length === 1 ? '' : 's'}
                {ui.serves > 1 ? ` · amounts for ${ui.serves} serves` : ''}
              </p>
              <div style={{ marginTop: 12 }}>
                {rows.map((r, i) => (
                  <div key={`${r.id}-${i}`} className="ing-row">
                    <span style={{ flex: 'none' }} aria-hidden="true">
                      <Sticker id={r.id} size={44} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 16, fontWeight: 500 }}>{r.name}</span>
                      <span style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)' }}>
                        {r.serveAmount} · {r.serveMacro}
                      </span>
                    </span>
                    <span className="web-only" style={{ display: 'flex', gap: 8, flex: 'none', alignItems: 'center' }}>
                      {r.alts.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setUi((s) => ({ ...s, swapOpen: s.swapOpen === r.id ? null : r.id }))}
                          style={{ height: 44, padding: '0 16px', borderRadius: 22, border: '1px solid var(--line)', background: 'var(--card)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                        >
                          {ui.swapOpen === r.id ? 'Close' : 'Swap'}
                        </button>
                      ) : (
                        <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Fixed</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeIng(r.id)}
                        aria-label={`Remove ${r.name}`}
                        style={{ width: 44, height: 44, border: 0, borderRadius: '50%', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 7 7 18M7 7l11 11" /></svg>
                      </button>
                    </span>
                    <button type="button" className="m-only" onClick={() => setUi((s) => ({ ...s, sheetSlot: r.id }))} style={{ display: 'none', height: 44, padding: '0 16px', borderRadius: 22, border: '1px solid var(--line)', background: 'var(--card)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                      Customise
                    </button>
                  </div>
                ))}
              </div>
              <span className="sr-only">{clusterLabelOf(rows)}</span>

              {rows.map((r) =>
                ui.swapOpen === r.id && r.alts.length > 0 ? (
                  <div key={`alt-${r.id}`} className="alt-panel" style={{ marginTop: 8, marginBottom: 8, padding: 16, borderRadius: 'var(--r-lg)', background: '#f7f7f6' }}>
                    {r.alts.map((alt) => (
                      <button
                        key={alt.id}
                        type="button"
                        onClick={() => swapIng(r.id, alt.id)}
                        style={{ width: '100%', height: 52, boxSizing: 'border-box', padding: '0 16px', borderRadius: 26, border: '1px solid var(--line)', background: 'var(--card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <span style={{ fontSize: 15, fontWeight: 500 }}>{alt.name}</span>
                        <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{sgnText(alt.dP, 1)}g protein · {sgnText(alt.dK, 0)} kcal</span>
                      </button>
                    ))}
                  </div>
                ) : null,
              )}

              <h2 style={{ margin: '32px 0 0', fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em' }}>Method</h2>
              <ol style={{ margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
                {steps.map((st, i) => (
                  <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '10px 0' }}>
                    <span style={{ flex: 'none', width: 32, height: 32, borderRadius: '50%', background: 'var(--ink)', color: '#ffffff', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                    <span style={{ fontSize: 16, lineHeight: 1.5, paddingTop: 4 }}>{st}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="recipe-side" style={{ flex: '0 1 420px', minWidth: 0 }}>
              <SliderPanel specs={specs} note={ui.note} onUndo={undo} onReset={reset} canUndo={canUndo} canReset={canReset} />
              <button
                type="button"
                onClick={onSave}
                className="web-only"
                style={{ marginTop: 16, width: '100%', height: 52, border: 0, borderRadius: 26, background: isSaved ? '#f1f1f1' : 'var(--ink)', color: isSaved ? 'var(--ink)' : '#ffffff', fontSize: 16, fontWeight: 500, cursor: 'pointer' }}
              >
                {saveLabel}
              </button>
              <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
                Reset restores the authored recipe. Undo steps back one change; a continuous drag counts as one.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-bar">
        <button type="button" onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/browse') }} style={barBtn(false)}>
          Back
        </button>
        <button type="button" onClick={onSave} style={barBtn(isSaved)}>
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <button type="button" onClick={nextShake} style={barBtn(true)}>
          Next shake
        </button>
      </div>

      <CustomiseSheet
        open={ui.sheetSlot != null}
        onClose={() => setUi((s) => ({ ...s, sheetSlot: null }))}
        rows={sheetRows}
        onQty={qtyIng}
        onRemove={removeIng}
        onSwap={swapIng}
        onUndo={undo}
        canUndo={canUndo}
        footer={
          <button type="button" onClick={() => setUi((s) => ({ ...s, sheetSlot: null }))} style={{ width: '100%', height: 52, border: 0, borderRadius: 26, background: 'var(--ink)', color: '#ffffff', fontSize: 16, fontWeight: 500, cursor: 'pointer' }}>
            Done
          </button>
        }
      />
    </Screen>
  )
}

const sgnText = (n: number, d: number) => {
  const m = 10 ** d
  const v = Math.round(n * m) / m
  return `${v > 0 ? '+' : v < 0 ? '−' : '±'}${Math.abs(v)}`
}

const clusterLabelOf = (rows: { id: string; name: string }[]) =>
  rows.map((r) => r.name).join(', ')

const barBtn = (filled: boolean) => ({
  flex: 1,
  height: 52,
  border: 0,
  borderRadius: 26,
  background: filled ? '#111111' : '#f1f1f1',
  color: filled ? '#ffffff' : 'var(--ink)',
  fontSize: 16,
  fontWeight: 500,
  cursor: 'pointer',
} as const)
