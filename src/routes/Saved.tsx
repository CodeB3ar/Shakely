// Saved cookbook (mock-up: Saved-Web). Filters live in the URL:
// level=<csv of 0/1/2>, my=1 (my versions only), q=search. Removing an
// entry keeps a 6-second Undo banner. Cards open /recipe/:id restoring
// level/serves/edits via the draft slot plus saved-entry fallback.
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Nav from '../components/Nav'
import { Screen } from '../components/Screen'
import { RecipeCard } from '../components/RecipeCard'
import { Chip } from '../components/Chip'
import { SearchBox } from '../components/SearchBox'
import { useBlend, type Saved } from '../state/store'
import { setDraft } from '../state/draft'
import { RECIPES_BY_ID, type Recipe } from '../data/recipes'
import { linesFor } from '../data/macros'
import { clampLevel, LEVELS, type Level } from '../state/levels'

const UNDO_MS = 6000

export default function Saved() {
  const { saved, unsave, restoreSaved, setResults } = useBlend()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()

  const levelFilter = csvFrom(params.get('level')).map((x) => clampLevel(Number(x)))
  const myOnly = params.get('my') === '1'
  const q = (params.get('q') ?? '').trim()

  const entries = useMemo(
    () =>
      saved
        .filter((e) => RECIPES_BY_ID[e.recipeId])
        .filter((e) => levelFilter.length === 0 || levelFilter.includes(e.level))
        .filter((e) => !myOnly || (e.edits?.length ?? 0) > 0)
        .filter((e) => matchQ(RECIPES_BY_ID[e.recipeId], e.level, q)),
    [saved, levelFilter, myOnly, q],
  )

  // ---- removal + 6-second undo banner ----
  const [removed, setRemoved] = useState<Saved | null>(null)
  useEffect(() => {
    if (!removed) return
    const t = window.setTimeout(() => setRemoved(null), UNDO_MS)
    return () => window.clearTimeout(t)
  }, [removed])
  const removeEntry = (entry: Saved) => {
    unsave(entry.recipeId)
    setResults(entries.filter((e) => e.recipeId !== entry.recipeId).map((e) => e.recipeId))
    setRemoved(entry)
  }
  const undoRemove = () => {
    if (removed) restoreSaved(removed)
    setRemoved(null)
  }

  const filtersActive = hasFilters(levelFilter, myOnly, q)
  const commit = (mut: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(params)
    mut(p)
    setParams(p, { replace: true })
  }
  const toggleLevel = (lv: Level) =>
    commit((p) => {
      const cur = csvFrom(p.get('level'))
      if (cur.includes(String(lv))) {
        const rest = cur.filter((x) => x !== String(lv))
        if (rest.length) p.set('level', rest.join(','))
        else p.delete('level')
      } else {
        const next = [...cur, String(lv)].sort()
        if (next.length === 3) p.delete('level')
        else p.set('level', next.join(','))
      }
    })
  const toggleMy = () =>
    commit((p) => {
      if (p.get('my') === '1') p.delete('my')
      else p.set('my', '1')
    })
  const submitSearch = (draft: string) =>
    commit((p) => {
      const t = draft.trim()
      if (t) p.set('q', t)
      else p.delete('q')
    })

  const openEntry = (entry: Saved) => {
    setResults(entries.map((e) => e.recipeId))
    setDraft({ recipeId: entry.recipeId, level: entry.level, serves: entry.serves, edits: entry.edits })
  }

  const nothingSaved = saved.filter((e) => RECIPES_BY_ID[e.recipeId]).length === 0

  return (
    <Screen>
      <Nav />

      {removed && (
        <div role="status" style={banner}>
          Removed {RECIPES_BY_ID[removed.recipeId]?.name ?? 'that shake'}.{' '}
          <button type="button" onClick={undoRemove} style={undoBtn}>
            Undo
          </button>
        </div>
      )}

      <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(36px, 4.4vw, 60px)', lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 500, color: 'var(--ink-mute)' }}>
            <span style={{ display: 'block', color: 'var(--ink)' }}>Your cookbook.</span>
            <span style={{ display: 'block' }}>{entries.length === 1 ? '1 shake saved' : `${entries.length} shakes saved`}</span>
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 16, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
            Your cookbook lives in this browser.{' '}
            <Link to="/profile" style={plainLink}>
              Get your code
            </Link>{' '}
            to take it anywhere.
          </p>
        </div>
        {!nothingSaved && <SearchBox key={q} initial={q} onSubmit={submitSearch} />}
      </div>

      {filtersActive && !nothingSaved && (
        <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-soft)' }}>What it filtered by:</span>
          {LEVELS.map((meta, lv) =>
            levelFilter.includes(lv as Level) ? <Chip key={lv} label={`${meta.label} level`} on onClick={() => toggleLevel(lv as Level)} /> : null,
          )}
          {myOnly && <Chip label="My versions" on onClick={toggleMy} />}
          {q && <Chip label={`\u201c${q}\u201d`} on onClick={() => commit((p) => p.delete('q'))} />}
          <button type="button" onClick={() => navigate('/saved')} style={clearLink}>
            Clear filters
          </button>
        </div>
      )}

      {entries.length > 0 ? (
        <>
          <div style={{ marginTop: 44, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            {LEVELS.map((meta, lv) => (
              <Chip key={lv} label={meta.label} on={levelFilter.includes(lv as Level)} onClick={() => toggleLevel(lv as Level)} />
            ))}
            <Chip label="My versions" on={myOnly} onClick={toggleMy} />
          </div>
          <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {entries.map((entry) => {
              const rc = RECIPES_BY_ID[entry.recipeId]
              return (
                <div key={entry.recipeId} style={cellWrap}>
                  <RecipeCard
                    rc={rc}
                    level={entry.level}
                    lines={linesFor(rc, entry.level)}
                    variant="panel"
                    serves={entry.serves}
                    why={(entry.edits?.length ?? 0) > 0 ? 'My version' : undefined}
                    onClick={() => openEntry(entry)}
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${rc.name} from the cookbook`}
                    onClick={() => removeEntry(entry)}
                    style={removeBtn}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
                  </button>
                </div>
              )
            })}
          </div>
        </>
      ) : nothingSaved ? (
        <div style={emptyPanel}>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>Nothing saved yet.</div>
          <p style={{ margin: '10px 0 0', fontSize: 16, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
            Every shake you save lands here, with its level and your tweaks.
          </p>
          <Link to="/browse" style={emptyCta}>
            Find a shake
          </Link>
        </div>
      ) : (
        <div style={emptyPanel}>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>No shakes match these filters.</div>
          <button type="button" onClick={() => navigate('/saved')} style={emptyCta}>
            Clear filters
          </button>
        </div>
      )}
    </Screen>
  )
}

function matchQ(rc: Recipe, level: Level, q: string): boolean {
  if (!q) return true
  const lc = q.toLowerCase()
  if (rc.name.toLowerCase().includes(lc)) return true
  return linesFor(rc, level).some((ln) => ln.ing.name.toLowerCase().includes(lc))
}

function hasFilters(levelFilter: Level[], myOnly: boolean, q: string): boolean {
  return levelFilter.length > 0 || myOnly || q.length > 0
}

function csvFrom(v: string | null): string[] {
  return (v ?? '').split(',').map((x) => x.trim()).filter(Boolean)
}

const banner: CSSProperties = {
  margin: '20px 0 -12px',
  height: 46,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '0 18px',
  borderRadius: 23,
  background: 'var(--card)',
  boxShadow: 'var(--shadow-card)',
  fontSize: 14.5,
  color: 'var(--ink-soft)',
  width: 'fit-content',
  maxWidth: '100%',
}
const undoBtn: CSSProperties = {
  height: 30,
  padding: '0 12px',
  borderRadius: 15,
  border: 0,
  background: 'var(--ink)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
}
const plainLink: CSSProperties = { color: 'var(--ink)', textDecoration: 'underline' }
const clearLink: CSSProperties = {
  height: 34,
  padding: '0 14px',
  borderRadius: 17,
  border: '1px solid var(--line)',
  background: 'var(--card)',
  color: 'var(--ink-soft)',
  fontSize: 13.5,
  fontWeight: 500,
  cursor: 'pointer',
}
const cellWrap: CSSProperties = { position: 'relative', flex: '1 1 300px', display: 'flex' }
const removeBtn: CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 12,
  width: 30,
  height: 30,
  borderRadius: 15,
  border: '1px solid var(--line)',
  background: 'var(--card)',
  color: 'var(--ink-soft)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}
const emptyPanel: CSSProperties = {
  marginTop: 44,
  padding: '56px 40px',
  maxWidth: 640,
  borderRadius: 'var(--r-lg)',
  background: 'var(--card)',
  boxShadow: 'var(--shadow-card)',
}
const emptyCta: CSSProperties = {
  display: 'inline-block',
  marginTop: 24,
  height: 44,
  lineHeight: '44px',
  padding: '0 22px',
  borderRadius: 22,
  background: 'var(--ink)',
  color: '#ffffff',
  fontSize: 15,
  fontWeight: 500,
  textDecoration: 'none',
  border: 0,
  cursor: 'pointer',
}
