import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'


export default function Landing() {
  const [protein, setProtein] = useState(30)
  const [kcal, setKcal] = useState(340)
  const [serves, setServes] = useState(2)
  const servesLabel = serves === 1 ? '1 serve' : `${serves} serves`

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', boxSizing: 'border-box', padding: '0 24px 56px', background: 'var(--bg)', color: 'var(--ink)' }}>
      <div aria-hidden="true" style={{ position: 'absolute', left: -300, top: 700, width: 800, height: 800, borderRadius: '50%', border: '1px solid #e8e8e8' }} />
      <div aria-hidden="true" style={{ position: 'absolute', right: -260, top: -360, width: 840, height: 840, borderRadius: '50%', border: '1px solid #e8e8e8' }} />
      <div aria-hidden="true" style={{ position: 'absolute', right: -320, top: 1500, width: 760, height: 760, borderRadius: '50%', border: '1px solid #e8e8e8' }} />

      <div style={{ position: 'relative', maxWidth: 1240, margin: '0 auto' }}>
        <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 88 }}>
          <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'var(--ink)' }}>
            <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="9" cy="9" r="1.8" fill="#fff" /><circle cx="15" cy="9" r="1.8" fill="#fff" />
                <circle cx="9" cy="15" r="1.8" fill="#fff" /><circle cx="15" cy="15" r="1.8" fill="#fff" />
              </svg>
            </span>
            <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Shakley</span>
          </Link>
          <nav aria-label="Main" style={{ display: 'flex', gap: 4 }}>
            <a href="#how" className="navlink" style={landNav}>How it works</a>
            <a href="#levels" className="navlink" style={landNav}>Levels</a>
            <a href="#features" className="navlink" style={landNav}>Features</a>
          </nav>
          <Link to="/home" style={{ display: 'flex', alignItems: 'center', height: 48, padding: '0 24px', borderRadius: 24, background: 'var(--ink)', color: '#ffffff', fontSize: 16, fontWeight: 500, textDecoration: 'none' }}>Open Shakley</Link>
        </header>

        <section style={{ textAlign: 'center', paddingTop: 56 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 36, padding: '0 16px', borderRadius: 18, background: 'var(--card)', boxShadow: '0 0 0 1px var(--line)', fontSize: 14, fontWeight: 500, color: '#444444' }}>
            Protein shakes and smoothies
          </span>
          <h1 style={{ margin: '24px auto 0', maxWidth: 1100, fontSize: 'clamp(44px, 6vw, 92px)', lineHeight: 1.02, letterSpacing: '-0.04em', fontWeight: 500, color: 'var(--ink-mute)' }}>
            <span style={{ display: 'block' }}>Hundreds of shakes.</span>
            <span style={{ display: 'block', color: 'var(--ink)' }}>Built from your kitchen.</span>
          </h1>
          <p style={{ margin: '24px auto 0', maxWidth: 560, fontSize: 20, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
            Tell Shakley what you have, dial in your protein and serves, and save your favourites with a short code. No login.
          </p>
          <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, height: 56, padding: '0 32px', borderRadius: 28, background: 'var(--ink)', color: '#ffffff', fontSize: 17, fontWeight: 500, textDecoration: 'none' }}>
              Open Shakley
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <a href="#how" style={{ display: 'flex', alignItems: 'center', height: 56, padding: '0 32px', borderRadius: 28, background: 'var(--card)', boxShadow: '0 0 0 1px var(--line)', color: 'var(--ink)', fontSize: 17, fontWeight: 500, textDecoration: 'none' }}>
              See how it works
            </a>
          </div>
        </section>

        <section style={{ position: 'relative', margin: '64px auto 0', maxWidth: 1000, minHeight: 700, display: 'flex', justifyContent: 'center' }}>
          <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: 700, height: 700, transform: 'translate(-50%, -50%)', borderRadius: '50%', border: '1px solid #e3e3e3' }} />
          <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: 940, height: 940, transform: 'translate(-50%, -50%)', borderRadius: '50%', border: '1px solid #ececec' }} />
          <span className="sticker" aria-hidden="true" style={{ left: '5%', top: 60, fontSize: 96, ['--r' as string]: '-12deg', animationDelay: '-0.8s' }}>🍓</span>
          <span className="sticker" aria-hidden="true" style={{ left: '11%', top: 300, fontSize: 112, ['--r' as string]: '8deg', animationDelay: '-2.4s' }}>🥬</span>
          <span className="sticker" aria-hidden="true" style={{ left: '3%', top: 520, fontSize: 84, ['--r' as string]: '-6deg', animationDelay: '-1.6s' }}>🥭</span>
          <span className="sticker" aria-hidden="true" style={{ right: '6%', top: 40, fontSize: 120, ['--r' as string]: '10deg', animationDelay: '-3.2s' }}>🍌</span>
          <span className="sticker" aria-hidden="true" style={{ right: '12%', top: 330, fontSize: 92, ['--r' as string]: '7deg', animationDelay: '-4s' }}>🫐</span>
          <span className="sticker" aria-hidden="true" style={{ right: '4%', top: 520, fontSize: 88, ['--r' as string]: '-9deg', animationDelay: '-2s' }}>🥜</span>

          <div style={{ position: 'relative', alignSelf: 'flex-start', width: '100%', maxWidth: 440, boxSizing: 'border-box', padding: 28, borderRadius: 36, background: 'var(--card)', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 30px 80px rgba(0,0,0,0.1)', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>Peanut Butter Banana</div>
              <span style={{ flex: 'none', height: 28, lineHeight: '28px', padding: '0 12px', borderRadius: 14, background: 'var(--chip)', fontSize: 13, fontWeight: 500, color: '#555555' }}>Quick · 2m</span>
            </div>
            <div aria-hidden="true" style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <span className="stk-s" style={{ fontSize: 44, lineHeight: 1 }}>🍌</span>
              <span className="stk-s" style={{ fontSize: 44, lineHeight: 1 }}>🥜</span>
              <span className="stk-s" style={{ fontSize: 44, lineHeight: 1 }}>🥛</span>
              <span className="stk-s" style={{ fontSize: 44, lineHeight: 1 }}>🥤</span>
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <label htmlFor="lp-protein" style={{ fontSize: 15, fontWeight: 500 }}>Protein</label>
                <span style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>{protein}g</span>
              </div>
              <input id="lp-protein" type="range" min={15} max={50} step={1} value={protein} onChange={(e) => setProtein(Number(e.target.value))} />
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{protein * serves}g total for {servesLabel}</div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <label htmlFor="lp-kcal" style={{ fontSize: 15, fontWeight: 500 }}>Calories</label>
                <span style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>{kcal} kcal</span>
              </div>
              <input id="lp-kcal" type="range" min={200} max={500} step={10} value={kcal} onChange={(e) => setKcal(Number(e.target.value))} />
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{kcal * serves} kcal total for {servesLabel}</div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 500 }}>Serves</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button type="button" onClick={() => setServes(Math.max(1, serves - 1))} aria-label="Fewer serves" style={{ width: 44, height: 44, border: 0, borderRadius: '50%', background: 'var(--chip)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
                </button>
                <span style={{ minWidth: 24, textAlign: 'center', fontSize: 20, fontWeight: 500 }}>{serves}</span>
                <button type="button" onClick={() => setServes(Math.min(8, serves + 1))} aria-label="More serves" style={{ width: 44, height: 44, border: 0, borderRadius: '50%', background: 'var(--chip)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                </button>
              </div>
            </div>

            <Link to="/search" style={{ marginTop: 24, width: '100%', height: 56, borderRadius: 28, background: 'var(--ink)', color: '#ffffff', fontSize: 17, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Save to my cookbook
            </Link>
          </div>
        </section>

        <section id="how" style={{ marginTop: 120 }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 36, padding: '0 16px', borderRadius: 18, background: 'var(--card)', boxShadow: '0 0 0 1px var(--line)', fontSize: 14, fontWeight: 500, color: '#444444' }}>How it works</span>
            <h2 style={{ margin: '20px 0 0', fontSize: 'clamp(36px, 4.6vw, 64px)', lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 500, color: 'var(--ink-mute)' }}>
              <span style={{ display: 'block' }}>Three steps,</span>
              <span style={{ display: 'block', color: 'var(--ink)' }}>one great shake.</span>
            </h2>
          </div>
          <div style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <Step n={1} title="Add what you have" text="Tap the ingredients in your kitchen and watch the circle fill. Shakes you can make appear straight away.">
              <div aria-hidden="true" style={{ marginTop: 20, height: 160, borderRadius: 24, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="stk-s" style={{ fontSize: 48, lineHeight: 1 }}>🍌</span>
                <span className="stk-s" style={{ fontSize: 48, lineHeight: 1 }}>🥜</span>
                <span className="stk-s" style={{ fontSize: 48, lineHeight: 1 }}>🥛</span>
                <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow-fab)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                </span>
              </div>
            </Step>
            <Step n={2} title="Dial it in" text="Slide protein and calories up or down, and set how many serves. Every amount rescales with you.">
              <div aria-hidden="true" style={{ marginTop: 20, height: 160, borderRadius: 24, background: 'var(--bg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, padding: '0 32px' }}>
                <SliderArt pct={64} />
                <SliderArt pct={38} />
              </div>
            </Step>
            <Step n={3} title="Save it with a code" text="Your whole cookbook fits in one short code. Enter it on any device to pick up where you left off.">
              <div aria-hidden="true" style={{ marginTop: 20, height: 160, borderRadius: 24, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ display: 'block', height: 52, lineHeight: '52px', padding: '0 24px', borderRadius: 26, background: 'var(--card)', boxShadow: '0 0 0 1px var(--line)', fontSize: 20, fontWeight: 500, letterSpacing: '0.06em' }}>BLND-7K2-9QX</span>
              </div>
            </Step>
          </div>
        </section>

        <section id="levels" style={{ marginTop: 120 }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 36, padding: '0 16px', borderRadius: 18, background: 'var(--card)', boxShadow: '0 0 0 1px var(--line)', fontSize: 14, fontWeight: 500, color: '#444444' }}>Levels</span>
            <h2 style={{ margin: '20px 0 0', fontSize: 'clamp(36px, 4.6vw, 64px)', lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 500, color: 'var(--ink-mute)' }}>
              <span style={{ display: 'block' }}>Every shake comes in three levels.</span>
              <span style={{ display: 'block', color: 'var(--ink)' }}>Quick, Loaded or Athlete.</span>
            </h2>
          </div>
          <div style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {[
              { label: 'Quick', time: 'About 2 min', count: '3–4 ingredients', text: 'Pour, blend, go. The fastest version of every shake.', stickers: '🍌🥜🥛' },
              { label: 'Loaded', time: 'About 5 min', count: '6–7 ingredients', text: 'The full, tasty version with better flavour and texture.', stickers: '🍌🥜🥛🥤🍯🧊' },
              { label: 'Athlete', time: '5–8 min', count: '7–9 ingredients', text: 'Macro-tuned, with boosters like oats, seeds and extra protein.', stickers: '🍌🥜🥛🥤🌾🍯🧊' },
            ].map((lv) => (
              <div key={lv.label} style={landCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.03em' }}>{lv.label}</span>
                  <span style={{ height: 30, lineHeight: '30px', padding: '0 12px', borderRadius: 15, background: 'var(--chip)', fontSize: 14, fontWeight: 500, color: '#555555' }}>{lv.time}</span>
                </div>
                <div aria-hidden="true" style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 52 }}>
                  {Array.from(lv.stickers).map((e, i) => (
                    <span key={i} className="stk-s" style={{ fontSize: 40, lineHeight: 1 }}>{e}</span>
                  ))}
                </div>
                <div style={{ marginTop: 20, fontSize: 15, fontWeight: 500 }}>{lv.count}</div>
                <p style={{ margin: '6px 0 0', fontSize: 16, lineHeight: 1.5, color: 'var(--ink-soft)' }}>{lv.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" style={{ marginTop: 120, display: 'flex', flexWrap: 'wrap', gap: 20 }}>
          {[
            { title: 'Swap anything', text: 'Tap an ingredient to swap, resize or remove it. Macros update live.', icon: 'M7 7h11l-3-3M17 17H6l3 3' },
            { title: 'Diet toggles', text: 'Vegan, dairy-free, nut-free: one tap filters every shake.', icon: 'M5 19c0-9 5-14 14-14 0 9-5 14-14 14zM5 19l7-7' },
            { title: 'Undo every edit', text: 'Experiment freely. Nothing is permanent until you save it.', icon: 'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3' },
            { title: 'Profile code', text: 'Move your cookbook between devices with a short code, no login.', icon: 'M4 9h16M4 15h16M10 4L8 20M16 4l-2 16' },
          ].map((ft) => (
            <div key={ft.title} style={{ flex: '1 1 250px', minWidth: 0, boxSizing: 'border-box', padding: '8px 8px 8px 0' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow-fab)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ft.icon} /></svg>
              </span>
              <h3 style={{ margin: '18px 0 0', fontSize: 20, fontWeight: 500, letterSpacing: '-0.015em' }}>{ft.title}</h3>
              <p style={{ margin: '6px 0 0', fontSize: 15, lineHeight: 1.5, color: 'var(--ink-soft)' }}>{ft.text}</p>
            </div>
          ))}
        </section>

        <section style={{ position: 'relative', overflow: 'hidden', marginTop: 120, padding: '88px 32px', borderRadius: 48, background: 'var(--ink)', textAlign: 'center' }}>
          <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: 640, height: 640, transform: 'translate(-50%, -50%)', borderRadius: '50%', border: '1px solid #2a2a2a' }} />
          <span className="sticker" aria-hidden="true" style={{ left: '6%', top: 40, fontSize: 76, ['--r' as string]: '-10deg', animationDelay: '-1s' }}>🍓</span>
          <span className="sticker" aria-hidden="true" style={{ right: '7%', top: 56, fontSize: 84, ['--r' as string]: '9deg', animationDelay: '-2.6s' }}>🍌</span>
          <span className="sticker" aria-hidden="true" style={{ left: '10%', bottom: 40, fontSize: 80, ['--r' as string]: '7deg', animationDelay: '-3.3s' }}>🥬</span>
          <span className="sticker" aria-hidden="true" style={{ right: '9%', bottom: 36, fontSize: 72, ['--r' as string]: '-8deg', animationDelay: '-4.1s' }}>🥜</span>
          <h2 style={{ position: 'relative', margin: 0, fontSize: 'clamp(40px, 5.6vw, 80px)', lineHeight: 1.04, letterSpacing: '-0.035em', fontWeight: 500, color: '#8e8e8e' }}>
            <span style={{ display: 'block' }}>What are we</span>
            <span style={{ display: 'block', color: '#ffffff' }}>blending today?</span>
          </h2>
          <Link to="/home" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 36, height: 56, padding: '0 32px', borderRadius: 28, background: '#ffffff', color: 'var(--ink)', fontSize: 17, fontWeight: 500, textDecoration: 'none' }}>
            Open Shakley
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </section>

        <footer style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 14, color: 'var(--ink-soft)' }}>
          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Shakley</span>
          <span>Protein shakes and smoothies, built from your kitchen.</span>
        </footer>
      </div>
    </div>
  )
}

function Step({ n, title, text, children }: { n: number; title: string; text: string; children: ReactNode }) {
  return (
    <div style={landCard}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: 'var(--ink)', color: '#ffffff', fontSize: 16, fontWeight: 500 }}>{n}</span>
      {children}
      <h3 style={{ margin: '24px 0 0', fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em' }}>{title}</h3>
      <p style={{ margin: '8px 0 0', fontSize: 16, lineHeight: 1.5, color: 'var(--ink-soft)' }}>{text}</p>
    </div>
  )
}

function SliderArt({ pct }: { pct: number }) {
  return (
    <div style={{ position: 'relative', height: 6, borderRadius: 3, background: '#e4e4e4' }}>
      <div style={{ width: `${pct}%`, height: 6, borderRadius: 3, background: 'var(--ink)' }} />
      <div style={{ position: 'absolute', left: `${pct}%`, top: -9, width: 24, height: 24, marginLeft: -12, borderRadius: '50%', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
    </div>
  )
}

const landCard: CSSProperties = {
  flex: '1 1 320px',
  minWidth: 0,
  boxSizing: 'border-box',
  padding: 28,
  borderRadius: 36,
  background: 'var(--card)',
  boxShadow: 'var(--shadow-card)',
}

const landNav: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: 44,
  padding: '0 18px',
  borderRadius: 'var(--r-pill)',
  fontSize: 16,
  fontWeight: 500,
  textDecoration: 'none',
}
