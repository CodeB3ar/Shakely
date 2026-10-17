import { NavLink } from 'react-router-dom'

export default function TopNav() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 88 }}>
      <NavLink to="/home" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'var(--ink)' }}>
        <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="9" cy="9" r="1.8" fill="#fff" />
            <circle cx="15" cy="9" r="1.8" fill="#fff" />
            <circle cx="9" cy="15" r="1.8" fill="#fff" />
            <circle cx="15" cy="15" r="1.8" fill="#fff" />
          </svg>
        </span>
        <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Shakley</span>
      </NavLink>
      <nav aria-label="Main" style={{ display: 'flex', gap: 4 }}>
        <NavLink to="/browse" className="navlink" style={navStyle}>Browse</NavLink>
        <NavLink to="/pantry" className="navlink" style={navStyle}>Pantry</NavLink>
        <NavLink to="/saved" className="navlink" style={navStyle}>Saved</NavLink>
      </nav>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" aria-label="Open saved shakes" style={circleBtn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4.5V8h3.5" />
          </svg>
        </button>
        <button type="button" style={codeBtn}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="9" cy="9" r="1.8" fill="var(--ink)" />
            <circle cx="15" cy="9" r="1.8" fill="var(--ink)" />
            <circle cx="9" cy="15" r="1.8" fill="var(--ink)" />
            <circle cx="15" cy="15" r="1.8" fill="var(--ink)" />
          </svg>
          <span>Profile code</span>
        </button>
      </div>
    </div>
  )
}

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  height: 44,
  padding: '0 18px',
  borderRadius: 'var(--r-pill)',
  fontSize: 16,
  fontWeight: 500,
  textDecoration: 'none',
} as const

const circleBtn = {
  width: 48,
  height: 48,
  border: 0,
  borderRadius: '50%',
  background: 'var(--card)',
  boxShadow: 'var(--shadow-fab)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
} as const

const codeBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  height: 48,
  padding: '0 20px 0 16px',
  border: 0,
  borderRadius: 24,
  background: 'var(--card)',
  boxShadow: 'var(--shadow-fab)',
  color: 'var(--ink)',
  fontSize: 16,
  fontWeight: 500,
} as const
