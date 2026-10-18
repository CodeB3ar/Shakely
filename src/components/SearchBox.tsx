// Search box with local typing state; Enter or the arrow commits via
// onSubmit. Callers `key=` it per committed value, so no effect is
// needed to resync the draft when the URL changes elsewhere.
import { useState } from 'react'

export function SearchBox({ initial, onSubmit }: { initial: string; onSubmit: (draft: string) => void }) {
  const [draft, setDraft] = useState(initial)
  return (
    <div style={{ flex: '1 1 320px', maxWidth: 460, boxSizing: 'border-box', height: 64, padding: '0 20px', borderRadius: 32, background: 'var(--card)', boxShadow: 'var(--shadow-float)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
      <input
        type="text"
        aria-label="Search shakes"
        placeholder="Search by name or ingredient"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(draft) }}
        style={{ flex: 1, minWidth: 0, height: 44, border: 0, padding: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 17, color: 'var(--ink)' }}
      />
      {draft !== initial && (
        <button type="button" onClick={() => onSubmit(draft)} aria-label="Run search" style={{ width: 44, height: 44, flex: 'none', borderRadius: 22, border: 0, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      )}
    </div>
  )
}
