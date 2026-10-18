// Shared nav: Home, Explore, Pantry, Saved + bookmark to Saved.
// Profile button returns in milestone 4 (hidden until then by decision).
import { NavLink, Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { BRAND } from '../lib/brand'

export function Logo({ size = 44, mark = '#FFFFFF' }: { size?: number; mark?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
    >
      <svg width={size / 2} height={size / 2} viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="9" r="1.8" fill={mark} />
        <circle cx="15" cy="9" r="1.8" fill={mark} />
        <circle cx="9" cy="15" r="1.8" fill={mark} />
        <circle cx="15" cy="15" r="1.8" fill={mark} />
      </svg>
    </span>
  )
}

const navItem: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: 44,
  padding: '0 18px',
  borderRadius: 'var(--r-pill)',
  fontSize: 16,
  fontWeight: 500,
  textDecoration: 'none',
}

export default function Nav() {
  return (
    <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 88 }}>
      <Link to="/app" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'var(--ink)' }}>
        <Logo />
        <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>{BRAND}</span>
      </Link>
      <nav aria-label="Main" style={{ display: 'flex', gap: 4 }}>
        <NavLink to="/app" end className="navlink" style={navItem}>Home</NavLink>
        <NavLink to="/explore" className="navlink" style={navItem}>Explore</NavLink>
        <NavLink to="/pantry" className="navlink" style={navItem}>Pantry</NavLink>
        <NavLink to="/saved" className="navlink" style={navItem}>Saved</NavLink>
        <NavLink to="/profile" className="navlink" style={navItem}>Profile code</NavLink>
      </nav>
      <div style={{ display: 'flex', gap: 10 }}>
        <NavLink
          to="/saved"
          aria-label="Saved shakes"
          style={{ width: 48, height: 48, border: 0, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow-fab)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z" />
          </svg>
        </NavLink>
      </div>
    </header>
  )
}
