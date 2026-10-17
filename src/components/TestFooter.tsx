import { Link } from 'react-router-dom'

const PAGES = [
  { to: '/', label: 'Landing' },
  { to: '/app', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/browse', label: 'Browse' },
  { to: '/recipe/1', label: 'Recipe' },
  { to: '/pantry', label: 'Pantry' },
  { to: '/saved', label: 'Saved' },
]

export default function TestFooter() {
  return (
    <div style={{ position: 'fixed', left: 12, right: 12, bottom: 10, zIndex: 50, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10, borderRadius: 24, background: 'rgba(17,17,17,0.85)', color: '#fff', backdropFilter: 'blur(6px)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
      <span style={{ fontSize: 12, opacity: 0.7, letterSpacing: '0.06em' }}>TEST PAGES</span>
      {PAGES.map((p) => (
        <Link
          key={p.to}
          to={p.to}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 32,
            padding: '0 14px',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.12)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          {p.label}
        </Link>
      ))}
    </div>
  )
}
