// Explore: search-first screen. Search leads into Browse with the query
// in the URL; goal tiles set shared filters then open Browse.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { Screen } from '../components/Screen'
import { Chip } from '../components/Chip'
import { Sticker } from '../components/Sticker'
import { useBlend } from '../state/store'
import { GOAL_FILTERS, DIET_FILTERS } from '../data/browse'

export default function Explore() {
  const navigate = useNavigate()
  const { pantry, togglePantry } = useBlend()
  const [q, setQ] = useState('')

  return (
    <Screen>
      <Nav />
      <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <h1 style={headline}>
          <span style={{ display: 'block', color: 'var(--ink)' }}>Search shakes.</span>
          <span style={{ display: 'block' }}>Or explore by goal.</span>
        </h1>
        <div style={{ flex: '1 1 320px', maxWidth: 460, boxSizing: 'border-box', height: 64, padding: '0 20px', borderRadius: 32, background: 'var(--card)', boxShadow: 'var(--shadow-float)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input
            type="text"
            aria-label="Search shakes"
            placeholder="Search by name or ingredient"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(`/browse?q=${encodeURIComponent(q)}`)
            }}
            style={{ flex: 1, minWidth: 0, height: 44, border: 0, padding: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 17, color: 'var(--ink)' }}
          />
          <Link
            to={`/browse?q=${encodeURIComponent(q)}`}
            aria-label="Search"
            style={{ width: 44, height: 44, flex: 'none', borderRadius: 22, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
      </div>

      <section style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em' }}>By goal</h2>
          <Link to="/browse" style={{ display: 'flex', alignItems: 'center', height: 44, padding: '0 18px', borderRadius: 22, border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
            Open all shakes
          </Link>
        </div>
        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {GOAL_FILTERS.map((f) => (
            <QueryChip key={f.id} label={f.label} query={GOAL_SEARCH[f.id] ?? f.label} />
          ))}
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em' }}>Diet</h2>
        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {DIET_FILTERS.map((f) => (
            <QueryChip key={f.id} label={f.label} query={GOAL_SEARCH[f.id] ?? f.label} />
          ))}
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em' }}>Your pantry, quick add</h2>
        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {pantry.length === 0 ? (
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
              Nothing in your pantry yet. Tap the ingredients you have and shake results will use them.
            </p>
          ) : (
            pantry.map((id) => <Sticker key={id} id={id} size={44} />)
          )}
        </div>
        {pantry.length === 0 ? (
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['banana', 'peanut-butter', 'milk', 'protein', 'strawberry', 'honey'].map((id) => (
              <Chip key={id} label={`Add ${PANTRY_LABELS[id] ?? id}`} onClick={() => togglePantry(id)} />
            ))}
          </div>
        ) : (
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link to="/pantry" style={{ display: 'flex', alignItems: 'center', height: 44, padding: '0 18px', borderRadius: 22, border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
              Manage pantry
            </Link>
            <Link to="/pantry" style={{ display: 'flex', alignItems: 'center', height: 44, padding: '0 18px', borderRadius: 22, background: 'var(--ink)', color: '#fff', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
              Shakes Made from Pantry
            </Link>
          </div>
        )}
      </section>
    </Screen>
  )
}

function QueryChip({ label, query }: { label: string; query: string }) {
  const navigate = useNavigate()
  return <Chip label={label} onClick={() => navigate(`/browse?q=${encodeURIComponent(query)}`)} />
}

const GOAL_SEARCH: Record<string, string> = {
  p20: 'protein',
  k300: 'light',
  green: 'green',
  dairy: 'dairy-free',
  vegan: 'vegan',
  nut: 'nut-free',
}

const PANTRY_LABELS: Record<string, string> = {
  banana: 'banana',
  'peanut-butter': 'peanut butter',
  milk: 'milk',
  protein: 'protein',
  strawberry: 'strawberries',
  honey: 'honey',
}

const headline = {
  margin: 0,
  fontSize: 'clamp(36px, 4.4vw, 60px)',
  lineHeight: 1.05,
  letterSpacing: '-0.035em',
  fontWeight: 500,
  color: 'var(--ink-mute)',
} as const
