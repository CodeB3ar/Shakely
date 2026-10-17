import type { CSSProperties, ReactNode } from 'react'
import { ING_BY_ID } from '../data/ingredients'
import { levelBadge, timeAgo, type RecipeStats } from '../data/filter'
import type { Recipe } from '../data/recipes'

export type CardVariant = 'panel' | 'grid'

export function RecipeCard({
  rc,
  lv,
  stats,
  variant,
  savedStamp,
  onToggleSave,
}: {
  rc: Recipe
  lv: number
  stats: RecipeStats
  variant: CardVariant
  savedStamp?: string | true
  onToggleSave?: () => void
}) {
  if (variant === 'grid') return <GridCard rc={rc} lv={lv} stats={stats} saved={!!savedStamp} onToggleSave={onToggleSave} />
  return <PanelCard rc={rc} lv={lv} stats={stats} savedStamp={savedStamp} />
}

const BOOKMARK = 'M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z'
const BASKET = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 9h16l-1.6 9.2a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8L4 9z" />
    <path d="M8 9l3-5M16 9l-3-5" />
  </svg>
)
const CLOCK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l2.5 2.5" />
  </svg>
)

function stickerRow(ids: string[], size: number): ReactNode {
  return ids.map((id) => (
    <span key={id} className="stk-s" style={{ fontSize: size, lineHeight: 1 }} aria-hidden="true">
      {ING_BY_ID[id]?.emoji ?? '🥤'}
    </span>
  ))
}

function GridCard({ rc, lv, stats, saved, onToggleSave }: { rc: Recipe; lv: number; stats: RecipeStats; saved: boolean; onToggleSave?: () => void }) {
  return (
    <div style={gridCard}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, color: '#6b6b6b' }}>{levelBadge(lv as 0 | 1 | 2)}</span>
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={(saved ? 'Remove ' : 'Save ') + rc.name}
          style={{ width: 44, height: 44, border: 0, borderRadius: '50%', background: saved ? '#111111' : '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? '#ffffff' : 'none'} stroke={saved ? '#ffffff' : '#111111'} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={BOOKMARK} />
          </svg>
        </button>
      </div>
      <div aria-hidden="true" style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 96, alignContent: 'flex-start' }}>
        {stickerRow(stats.ids, 38)}
      </div>
      <div style={{ marginTop: 14, fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em' }}>{rc.name}</div>
      <div style={{ marginTop: 4, fontSize: 15, color: '#6b6b6b' }}>{stats.protein}g protein · {stats.kcal} kcal</div>
      <div style={{ marginTop: 2, fontSize: 14, color: '#6b6b6b' }}>{stats.ids.length} ingredients</div>
    </div>
  )
}

function PanelCard({ rc, lv, stats, savedStamp }: { rc: Recipe; lv: number; stats: RecipeStats; savedStamp?: string | true }) {
  const saved = !!savedStamp
  return (
    <div style={panelCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: '#6b6b6b' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {saved && (
            <>
              {CLOCK}
              <span>{timeAgo(savedStamp)}</span>
            </>
          )}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {BASKET}
          <span>{stats.ids.length} ingredients</span>
        </span>
      </div>
      <div aria-hidden="true" style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, minHeight: 44 }}>
        {stickerRow(stats.ids, 44)}
      </div>
      <div style={{ marginTop: 16, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>{rc.name}</div>
      <div style={{ marginTop: 4, fontSize: 15, color: '#6b6b6b' }}>{levelBadge(lv as 0 | 1 | 2)}</div>
    </div>
  )
}

const gridCard: CSSProperties = {
  boxSizing: 'border-box',
  padding: '18px 18px 22px 22px',
  borderRadius: 'var(--r-lg)',
  background: 'var(--card)',
  boxShadow: 'var(--shadow-card)',
}

const panelCard: CSSProperties = {
  flex: '1 1 300px',
  minWidth: 0,
  boxSizing: 'border-box',
  padding: '22px 24px 24px',
  borderRadius: 'var(--r-lg)',
  background: 'var(--card)',
  boxShadow: 'var(--shadow-card)',
  textAlign: 'center',
}
