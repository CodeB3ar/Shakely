import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import { Chip, Screen, Sticker, RoundBtn } from '../components/Token'
import { RecipeCard } from '../components/RecipeCard'
import { useBlend, HOME_FILTERS, FILTER_LABELS } from '../state/store'
import { POPULAR_PICKS, levelOf, statsOf } from '../data/filter'
import { RECIPES } from '../data/recipes'

const HEADLINE: React.CSSProperties = {
  margin: 0,
  fontSize: 'clamp(40px, 5.6vw, 80px)',
  lineHeight: 1.04,
  letterSpacing: '-0.035em',
  fontWeight: 500,
  color: 'var(--ink-mute)',
}

export default function Home() {
  const navigate = useNavigate()
  const { level, setLevel, chips, toggleChip, saved } = useBlend()
  const [q, setQ] = useState('')
  const savedList = Object.keys(saved)
  const savedCount = savedList.length

  return (
    <Screen>
      <TopNav />

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 48, marginTop: 24 }}>
        <div style={{ flex: '1 1 520px', minWidth: 0, maxWidth: 660 }}>
          <h1 style={{ ...HEADLINE }}>
            <span style={{ display: 'block' }}>What are we</span>
            <span style={{ display: 'block', color: 'var(--ink)' }}>blending today?</span>
          </h1>
          <p style={{ margin: '20px 0 0', maxWidth: 460, fontSize: 20, lineHeight: 1.45, color: 'var(--ink-soft)' }}>
            Hundreds of protein shakes and smoothies, built from what's in your kitchen.
          </p>

          <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['Quick · 2m', 'Loaded · 5m', 'Athlete · 8m'].map((full, i) => {
              const [label, time] = full.split(' · ')
              const on = level === i
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setLevel(i as 0 | 1 | 2)}
                  aria-pressed={on}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    height: 48,
                    padding: '0 10px 0 20px',
                    border: 0,
                    borderRadius: 24,
                    fontSize: 17,
                    fontWeight: on ? 600 : 500,
                    background: on ? 'var(--card)' : 'transparent',
                    color: on ? 'var(--ink)' : 'var(--ink-soft)',
                    boxShadow: on ? '0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px var(--line)' : 'none',
                  }}
                >
                  <span>{label}</span>
                  <span style={badge(on ? 'var(--chip)' : '#ececec')}>{time}</span>
                </button>
              )
            })}
          </div>

          <div style={{ ...promptBar } as React.CSSProperties}>
            <input
              type="text"
              aria-label="Describe your shake"
              placeholder="Describe your shake…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/browse?q=${encodeURIComponent(q)}`)
              }}
              style={promptInput}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link to="/pantry" style={pantryLink}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 9h16l-1.6 9.2a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8L4 9z" />
                  <path d="M8 9l3-5M16 9l-3-5" />
                </svg>
                <span>Pantry</span>
              </Link>
              <Link to={`/browse?q=${encodeURIComponent(q)}`} aria-label="Find shakes" style={goBtn}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 19V5M6 11l6-6 6 6" />
                </svg>
              </Link>
            </div>
          </div>

          <div style={{ marginTop: 16, maxWidth: 600, display: 'flex', flexWrap: 'wrap', gap: 10 } as React.CSSProperties}>
            {HOME_FILTERS.map((id) => (
              <Chip key={id} label={FILTER_LABELS[id]} on={!!chips[id]} onClick={() => toggleChip(id)} />
            ))}
          </div>

          <p style={{ margin: '28px 0 0', maxWidth: 520, fontSize: 15, lineHeight: 1.5, color: 'var(--ink-soft)' } as React.CSSProperties}>
            Save any shake, then carry your whole cookbook anywhere with a profile code. No login.
          </p>
        </div>

        <div style={{ flex: '1 1 420px', minWidth: 0 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 560, margin: '0 auto', aspectRatio: '1 / 1' }}>
            <div aria-hidden="true" style={ring('100%')} />
            <div aria-hidden="true" style={{ position: 'absolute', left: '8%', top: '8%', width: '84%', height: '84%', borderRadius: '50%', background: 'var(--card)', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 30px 80px rgba(0,0,0,0.08)' }} />
            <Sticker emoji="🍓" size="clamp(48px, 6.4vw, 92px)" rotate={-12} delay={-0.8} style={{ left: '20%', top: '24%' }} />
            <Sticker emoji="🍌" size="clamp(64px, 8.4vw, 120px)" rotate={10} delay={-2.2} style={{ left: '40%', top: '14%' }} />
            <Sticker emoji="🫐" size="clamp(48px, 6vw, 88px)" rotate={8} delay={-3.4} style={{ left: '66%', top: '30%' }} />
            <Sticker emoji="🥛" size="clamp(56px, 7.6vw, 108px)" rotate={-7} delay={-1.5} style={{ left: '18%', top: '52%' }} />
            <Sticker emoji="🥜" size="clamp(48px, 6.2vw, 92px)" rotate={6} delay={-4} style={{ left: '44%', top: '66%' }} />
            <Sticker emoji="🥬" size="clamp(60px, 8vw, 116px)" rotate={9} delay={-2.9} style={{ left: '64%', top: '54%' }} />
            <RoundBtn label="Add an ingredient — go to search" size={56} style={fab('78%', '10%')} onClick={() => navigate('/search')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            </RoundBtn>
            <RoundBtn label="Add an ingredient — go to search" size={56} style={fab('3%', '40%')} onClick={() => navigate('/search')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            </RoundBtn>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 64, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 36, lineHeight: 1.1, letterSpacing: '-0.03em', fontWeight: 500, color: 'var(--ink-mute)' }}>
          <span style={{ display: 'block', color: 'var(--ink)' }}>Your saved shakes.</span>
          <span style={{ display: 'block' }}>Pick up where you left off.</span>
        </h2>
        <Link to="/saved" style={{ display: 'flex', alignItems: 'center', height: 44, padding: '0 20px', borderRadius: 22, background: 'var(--card)', boxShadow: '0 0 0 1px var(--line)', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
          {savedCount > 0 ? `${savedCount} shake${savedCount === 1 ? '' : 's'} · See all` : 'See all'}
        </Link>
      </div>

      {savedCount > 0 ? (
        <>
          <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {savedList.slice(0, 3).map((id) => {
              const rc = RECIPES.find((r) => r.id === id)
              if (!rc) return null
              return (
                <RecipeCard key={id} rc={rc} lv={levelOf(rc)} stats={statsOf(levelOf(rc), rc)} variant="panel" savedStamp={saved[id]} />
              )
            })}
          </div>
        </>
      ) : (
        <>
          <p style={{ margin: '28px 0 0', maxWidth: 520, fontSize: 15, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
            Popular picks to get started — tap the bookmark to save one.
          </p>
          <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {POPULAR_PICKS.map((rc) => (
              <RecipeCard key={rc.id} rc={rc} lv={levelOf(rc)} stats={statsOf(levelOf(rc), rc)} variant="panel" />
            ))}
          </div>
        </>
      )}
    </Screen>
  )
}

function badge(bg: string): React.CSSProperties {
  return { display: 'block', height: 30, lineHeight: '30px', padding: '0 10px', borderRadius: 15, fontSize: 14, fontWeight: 500, color: '#555555', background: bg }
}

const promptBar: React.CSSProperties = {
  marginTop: 24,
  maxWidth: 600,
  padding: '22px 20px 16px 26px',
  borderRadius: 'var(--r-lg)',
  background: 'var(--card)',
  boxShadow: 'var(--shadow-float)',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
}

const promptInput: React.CSSProperties = {
  width: '100%',
  height: 32,
  border: 0,
  padding: 0,
  background: 'transparent',
  fontSize: 20,
  color: 'var(--ink)',
}

const pantryLink: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  height: 48,
  padding: '0 20px 0 16px',
  borderRadius: 24,
  border: '1px solid var(--line)',
  background: 'var(--card)',
  color: 'var(--ink)',
  fontSize: 17,
  fontWeight: 500,
  textDecoration: 'none',
}

const goBtn: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: '50%',
  background: 'var(--ink)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

function ring(size: string): React.CSSProperties {
  return { position: 'absolute', left: 0, top: 0, width: size, height: size, borderRadius: '50%', border: '1px solid #e3e3e3' }
}

function fab(left: string, top: string): React.CSSProperties {
  return {
    position: 'absolute',
    left,
    top,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'var(--card)',
    boxShadow: 'var(--shadow-fab)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}
