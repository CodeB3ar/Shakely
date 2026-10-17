// Browse: results grid on the active level's real totals.
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Nav from '../components/Nav'
import { Screen } from '../components/Screen'
import { RecipeCard } from '../components/RecipeCard'
import { Chip } from '../components/Chip'
import { useBlend } from '../state/store'
import { searchRecipes, GOAL_FILTERS, DIET_FILTERS } from '../data/browse'
import { linesFor } from '../data/macros'
import { LEVELS } from '../state/levels'

export default function Browse() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { level, chips, toggleChip, clearChips } = useBlend()
  const q = params.get('q') ?? ''
  const [draft, setDraft] = useState(q)

  const shown = useMemo(() => searchRecipes(level, chips, q), [level, chips, q])
  const n = shown.length

  return (
    <Screen>
      <div aria-hidden="true" style={{ position: 'absolute', right: -240, top: -340, width: 820, height: 820, borderRadius: '50%', border: '1px solid #e8e8e8' }} />
      <div aria-hidden="true" style={{ position: 'absolute', left: -300, top: 900, width: 800, height: 800, borderRadius: '50%', border: '1px solid #e8e8e8' }} />
      <div style={{ position: 'relative' }}>
        <Nav />

        <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <Link to="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 44, fontSize: 15, fontWeight: 500, color: 'var(--ink-soft)', textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
              Back to Explore
            </Link>
            <h1 style={{ margin: '4px 0 0', fontSize: 'clamp(36px, 4.4vw, 60px)', lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 500, color: 'var(--ink-mute)' }}>
              <span style={{ display: 'block', color: 'var(--ink)' }}>{q ? `“${q}”.` : 'All shakes.'}</span>
              <span style={{ display: 'block' }}>{n === 1 ? '1 shake found' : `${n} shakes found`}</span>
            </h1>
          </div>
          <div style={{ flex: '1 1 320px', maxWidth: 460, boxSizing: 'border-box', height: 64, padding: '0 20px', borderRadius: 32, background: 'var(--card)', boxShadow: 'var(--shadow-float)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            <input
              type="text"
              aria-label="Search shakes"
              placeholder="Search by name or ingredient"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/browse?q=${encodeURIComponent(draft)}`)
              }}
              style={{ flex: 1, minWidth: 0, height: 44, border: 0, padding: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 17, color: 'var(--ink)' }}
            />
            {draft !== q && (
              <button type="button" onClick={() => navigate(`/browse?q=${encodeURIComponent(draft)}`)} aria-label="Run search" style={{ width: 44, height: 44, flex: 'none', borderRadius: 22, border: 0, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 32 }}>
          <aside aria-label="Filters" style={{ flex: '1 1 260px', maxWidth: 300, boxSizing: 'border-box', padding: 24, borderRadius: 'var(--r-lg)', background: 'var(--card)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-soft)' }}>Stats at level: {LEVELS[level].label}</div>
            <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
              Level is chosen per recipe on its page — filters below check the {LEVELS[level].label} variant.
            </p>

            {[
              { title: 'Goal', list: GOAL_FILTERS },
              { title: 'Diet', list: DIET_FILTERS },
            ].map((grp) => (
              <div key={grp.title}>
                <div style={{ marginTop: 24, fontSize: 14, fontWeight: 500, color: 'var(--ink-soft)' }}>{grp.title}</div>
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {grp.list.map((f) => (
                    <Chip key={f.id} label={f.label} on={!!chips[f.id]} onClick={() => toggleChip(f.id)} />
                  ))}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => { clearChips(); navigate('/browse') }}
              style={{ marginTop: 24, height: 44, width: '100%', border: '1px solid var(--line)', borderRadius: 22, background: 'var(--card)', color: 'var(--ink)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
            >
              Clear filters
            </button>
          </aside>

          <div style={{ flex: 999, flexBasis: 560, minWidth: 0 }}>
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {shown.map(({ rc }) => (
                <RecipeCard key={rc.id} rc={rc} level={level} lines={linesFor(rc, level)} variant="grid" />
              ))}
            </div>
           {n === 0 && (
              <div style={{ marginTop: 16, padding: '64px 24px', borderRadius: 'var(--r-lg)', background: 'var(--card)', textAlign: 'center', fontSize: 17, color: 'var(--ink-soft)' }}>
                No shakes match. Try removing a filter or clearing the search.
              </div>
            )}
          </div>
        </div>
      </div>
    </Screen>
  )
}
