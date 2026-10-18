// Pantry: mark what you have, see grouped results. per spec section 5,
// pantry state is a snapshot — edits after load don't re-sort results
// live; the "Update results" button re-snapshots. Saved to the profile.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { Screen } from '../components/Screen'
import { Chip } from '../components/Chip'
import { Sticker } from '../components/Sticker'
import { useBlend } from '../state/store'
import { pantryHits } from '../data/browse'
import { LEVELS } from '../state/levels'
import { ing } from '../data/ingredients'
import type { CSSProperties } from 'react'

const QUICK_ADD = ['banana', 'peanut-butter', 'milk', 'protein', 'strawberry', 'blueberry', 'honey', 'oats', 'yogurt', 'avocado', 'spinach', 'ice']

export default function Pantry() {
  const { level, pantry, togglePantry, clearPantry, setResults } = useBlend()
  const [only, setOnly] = useState(false)
  // snapshot: results are computed from this slice, not the live pantry
  const [snapshot, setSnapshot] = useState(pantry)
  const dirty = useMemo(
    () => snapshot.length !== pantry.length || snapshot.some((x, i) => x !== pantry[i]),
    [snapshot, pantry],
  )
  const hits = useMemo(() => pantryHits(level, snapshot), [level, snapshot])
  const groups = only ? [{ title: 'Make now', items: hits.ready }] : [
    { title: 'Ready now', items: hits.ready },
    { title: 'Missing 1', items: hits.missingOne },
    { title: 'Missing 2 or more', items: hits.missingMore },
  ].filter((g) => g.items.length > 0)

  const updateResults = () => {
    if (dirty) setSnapshot(pantry)
  }

  return (
    <Screen>
      <Nav />
      <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        <h1 style={headline}>
          <span style={{ display: 'block', color: 'var(--ink)' }}>Your pantry.</span>
          <span style={{ display: 'block' }}>What you have on hand.</span>
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          {pantry.length > 0 && <Chip label="Clear pantry" onClick={clearPantry} />}
        </div>
      </div>
      <p style={{ margin: '16px 0 0', maxWidth: 560, fontSize: 16, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
        {snapshot.length === 0
          ? 'Tap the ingredients you have. Results update when you press Update results.'
          : `${snapshot.length} item${snapshot.length === 1 ? '' : 's'} in the pantry · matched at the ${LEVELS[level].label} level${dirty ? ' · results are from your earlier snapshot' : ''}.`}
      </p>

      <section style={{ marginTop: 28 }}>
        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {QUICK_ADD.map((id) => {
            const on = pantry.includes(id)
            return <Chip key={id} label={ing(id).name} on={on} onClick={() => togglePantry(id)} />
          })}
        </div>
      </section>

      <section style={{ marginTop: 36 }}>
        {snapshot.length === 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
            <span style={{ fontSize: 15, color: 'var(--ink-soft)' }}>A few common starters:</span>
          </div>
        )}
        {pantry.length > 0 && (
          <div aria-hidden="true" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {pantry.map((id) => (
              <button key={id} type="button" onClick={() => togglePantry(id)} aria-label={`Remove ${ing(id).name} from pantry`} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0 }}>
                <Sticker id={id} size={52} />
              </button>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500 }}>
            <input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} style={{ width: 18, height: 18 }} />
            Only ready now
          </label>
          <button
            type="button"
            onClick={updateResults}
            disabled={!dirty}
            aria-label={dirty ? 'Update results from your current pantry' : 'Results already match your pantry'}
            style={updateBtn(dirty)}
          >
            {dirty ? 'Update results' : 'Results up to date'}
          </button>
        </div>
        {groups.map((g) => (
          <div key={g.title} style={{ marginTop: 24 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em' }}>{g.title}</h2>
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {g.items.map((h) => (
                <Link
                  key={h.rc.id}
                  to={`/recipe/${h.rc.id}?level=${level}`}
                  aria-label={`Open ${h.rc.name}`}
                  onClick={() => setResults(g.items.map((x) => x.rc.id))}
                  style={{ flex: '1 1 240px', minWidth: 200, padding: '16px 20px', borderRadius: 'var(--r-lg)', background: 'var(--card)', boxShadow: 'var(--shadow-card)', textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ fontSize: 18, fontWeight: 500 }}>{h.rc.name}</div>
                  <div style={{ marginTop: 4, fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
                    {h.missing.length === 0
                      ? `${h.have.length} ingredients · everything in your pantry`
                      : `Missing: ${h.missing.map((m) => ing(m).name).join(', ')}`}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </Screen>
  )
}

function updateBtn(dirty: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    height: 44,
    padding: '0 18px',
    borderRadius: 22,
    border: dirty ? '1.5px solid var(--ink)' : '1px solid var(--line)',
    background: dirty ? 'var(--ink)' : 'var(--card)',
    color: dirty ? '#fff' : 'var(--ink-soft)',
    fontSize: 15,
    fontWeight: 500,
    cursor: dirty ? 'pointer' : 'default',
    opacity: dirty ? 1 : 0.7,
  }
}

const headline = {
  margin: 0,
  fontSize: 'clamp(36px, 4.4vw, 60px)',
  lineHeight: 1.05,
  letterSpacing: '-0.035em',
  fontWeight: 500,
  color: 'var(--ink-mute)',
} as CSSProperties
