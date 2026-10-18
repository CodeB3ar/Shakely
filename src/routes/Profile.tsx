// Profile & code (mock-up: Profile-Web). The code carries the whole
// profile (spec section 6): Copy (clipboard with textarea fallback),
// Download as shakely-profile.txt, paste → preview → Restore with
// Replace or Merge (locked merge rule in code.ts), goal + diet
// preferences, and a two-step Clear this browser.
import { useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { Screen } from '../components/Screen'
import { useBlend, type Goal, type Saved } from '../state/store'
import { PROFILE_KEY, type Profile } from '../state/profile'
import { encodeCode, decodeCode, applyReplace, applyMerge, codePreview, type CodeData, type CodeResult } from '../data/code'
import { levelBadge } from '../state/levels'
import { BRAND } from '../lib/brand'

const DIET_KEYS = ['dairy', 'vegan', 'nut'] as const

const GOALS: { value: Goal; label: string }[] = [
  { value: 'build', label: 'Build' },
  { value: 'lean', label: 'Lean' },
  { value: 'recovery', label: 'Recovery' },
]

export default function Profile() {
  const { level, goal, setGoal, diet, toggleDiet, pantry, saved } = useBlend()

  const myVersions = saved.filter((e) => e.edits?.length).length
  const [copied, setCopied] = useState(false)
  const [paste, setPaste] = useState('')
  const [result, setResult] = useState<CodeResult | null>(null)
  const [restored, setRestored] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

  const code = useMemo(
    () => encodeCode({ v: 1, level, goal, diet, pantry, saved } as Profile),
    [level, goal, diet, pantry, saved],
  )

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      try {
        const ta = document.createElement('textarea')
        ta.value = code
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        setCopied(true)
      } catch {
        setCopied(false) // the code is selectable text anyway
      }
    }
  }

  const downloadCode = () => {
    try {
      const blob = new Blob(['Shakely profile code\n\n' + code + '\n\nPaste this on any device: Shakely > Profile > Restore.'], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'shakely-profile.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // download is a nicety; Copy remains the path
    }
  }

  const applyResult = (mode: 'replace' | 'merge') => {
    if (!result || !result.ok) return
    const now = Date.now()
    const cur = useBlend.getState() as unknown as Profile
    const next = mode === 'replace' ? applyReplace(cur, result.data, now) : applyMerge(cur, result.data, now)
    const patch = { level: next.level, goal: next.goal, diet: next.diet, pantry: next.pantry, saved: next.saved as Saved[] }
    useBlend.setState(patch)
    useBlend.setState({ results: patch.saved.map((s) => s.recipeId) })
    setRestored(mode === 'replace' ? 'Cookbook replaced.' : codePreviewText(result.data))
    setPaste('')
    setResult(null)
  }

  const clearBrowser = () => {
    if (!clearing) {
      setClearing(true)
      return
    }
    try {
      localStorage.removeItem(PROFILE_KEY)
      sessionStorage.removeItem('shakely.results')
      sessionStorage.removeItem('shakely.draft')
    } catch {
      // storage unavailable — still reset the memory state
    }
    useBlend.setState({ level: 0, goal: 'build', diet: [], pantry: [], saved: [], results: null })
    setClearing(false)
  }

  const extraDiets = diet.filter((d) => !(DIET_KEYS as readonly string[]).includes(d))

  return (
    <Screen>
      <Nav />

      <h1 style={headline}>
        <span style={{ display: 'block', color: 'var(--ink)' }}>Your profile.</span>
        <span style={{ display: 'block' }}>One code carries it all.</span>
      </h1>

      <p aria-live="polite" style={int}>
        {saved.length === 0 && pantry.length === 0
          ? 'Nothing in your cookbook yet — the code lights up as you save shakes and stock your pantry.'
          : `${saved.length} saved shake${saved.length === 1 ? '' : 's'}${myVersions ? ` (${myVersions} my version${myVersions === 1 ? '' : 's'})` : ''} · ${pantry.length} pantry item${pantry.length === 1 ? '' : 's'} · level ${levelBadge(level)}.`}
      </p>

      {/* ---- the code ---- */}
      <div style={panel}>
        <div style={panelTitle}>{BRAND} code</div>
        <div style={codeBox}>
          <span style={codeText}>{code}</span>
        </div>
        <div style={row}>
          <button type="button" onClick={copyCode} style={primaryBtn}>
            {copied ? 'Copied' : 'Copy code'}
          </button>
          <button type="button" onClick={downloadCode} style={secondaryBtn}>
            Download
          </button>
          <span style={hint}>Copies as text. A plain-text file works too.</span>
        </div>
      </div>

      {/* ---- restore ---- */}
      <div style={{ ...panel, marginTop: 20 }}>
        <div style={panelTitle}>Restore from a code</div>
        <input
          value={paste}
          onChange={(e) => {
            setPaste(e.target.value)
            setResult(null)
            setRestored(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setResult(decodeCode(paste))
          }}
          placeholder="Paste a SHKL- code"
          aria-label="Paste a code to restore"
          style={pasteInput}
        />
        {restored && <div role="status" style={okNote}>{restored}</div>}
        {result && !result.ok && (
          <div role="alert" style={errorNote}>
            {result.message} Nothing has changed.
          </div>
        )}
        {result && result.ok && (
          <div style={previewBox}>
            <div style={statLine}>This code holds {codePreview(result.data)}.</div>
            <div style={row}>
              <button type="button" onClick={() => applyResult('merge')} style={secondaryBtn}>
                Merge
              </button>
              <button type="button" onClick={() => applyResult('replace')} style={primaryBtn}>
                Replace
              </button>
            </div>
            <p style={note}>Merge keeps this browser's saved shakes and adds the code's new ones. Replace swaps this browser's cookbook for the code's.</p>
          </div>
        )}
      </div>

      {/* ---- preferences ---- */}
      <div style={{ ...panel, marginTop: 20 }}>
        <div style={panelTitle}>Main goal</div>
        <div style={{ ...row, gap: 10 }}>
          {GOALS.map((g) => (
            <button key={g.value} type="button" aria-pressed={goal === g.value} onClick={() => setGoal(g.value)} style={goal === g.value ? chipOn : chipOff}>
              {g.label}
            </button>
          ))}
        </div>
        <div style={{ ...panelTitle, marginTop: 28 }}>Always filter by</div>
        <div style={{ ...row, flexWrap: 'wrap' }}>
          {DIET_KEYS.map((k) => (
            <button key={k} type="button" aria-pressed={diet.includes(k)} onClick={() => toggleDiet(k)} style={diet.includes(k) ? chipOn : chipOff}>
              {k}
            </button>
          ))}
          {extraDiets.map((d) => (
            <button key={d} type="button" aria-pressed onClick={() => toggleDiet(d)} style={chipOn}>
              {d}
            </button>
          ))}
        </div>
        <CustomDiet onAdd={toggleDiet} />
      </div>

      {/* ---- clear ---- */}
      <div style={{ ...panel, marginTop: 20 }}>
        <div style={panelTitle}>Clear this browser</div>
        <p style={{ ...note, marginTop: 8 }}>
          {clearing
            ? 'This wipes the cookbook, the pantry, level and goal on this device. It cannot be undone — everything is local.'
            : `Removes everything ${BRAND} keeps on this device: cookbook, pantry, level and goal.`}
        </p>
        <button type="button" onClick={clearBrowser} style={clearing ? primaryBtn : secondaryBtn}>
          {clearing ? 'Yes, clear everything' : 'Clear this browser'}
        </button>
      </div>

      <div style={{ marginTop: 44, textAlign: 'center' }}>
        <Link to="/saved" style={plainLink}>
          Back to your cookbook
        </Link>
      </div>
    </Screen>
  )
}

function codePreviewText(_data: CodeData): string {
  return 'Restored.' // codePreview already shown in the preview box
}

function CustomDiet({ onAdd }: { onAdd: (tag: string) => void }) {
  const [tag, setTag] = useState('')
  return (
    <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
      <input
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        placeholder="Add your own filter"
        aria-label="Add your own diet filter"
        style={{ ...pasteInput, maxWidth: 280 }}
      />
      <button type="button" onClick={() => { const t = tag.trim().toLowerCase(); if (t) onAdd(t); setTag('') }} style={secondaryBtn}>
        Add
      </button>
    </div>
  )
}

const headline: CSSProperties = {
  margin: '40px 0 0',
  textAlign: 'center',
  fontSize: 'clamp(36px, 4.4vw, 60px)',
  lineHeight: 1.05,
  letterSpacing: '-0.035em',
  fontWeight: 500,
  color: 'var(--ink-mute)',
}
const int: CSSProperties = {
  margin: '14px auto 0',
  maxWidth: 560,
  fontSize: 16,
  lineHeight: 1.6,
  color: 'var(--ink-soft)',
  textAlign: 'center',
}
const panel: CSSProperties = {
  display: 'block',
  margin: '36px auto 0',
  maxWidth: 640,
  boxSizing: 'border-box',
  padding: '26px 28px 28px',
  borderRadius: 'var(--r-lg)',
  background: 'var(--card)',
  boxShadow: 'var(--shadow-card)',
}
const panelTitle: CSSProperties = { fontSize: 14, fontWeight: 500, color: 'var(--ink-soft)' }
const codeBox: CSSProperties = {
  marginTop: 14,
  padding: '18px 20px',
  borderRadius: 16,
  background: 'var(--bg)',
  border: '1px solid var(--line)',
}
const codeText: CSSProperties = {
  fontSize: 16,
  fontWeight: 500,
  letterSpacing: '0.04em',
  color: 'var(--ink)',
  overflowWrap: 'anywhere',
  userSelect: 'all',
}
const row: CSSProperties = { marginTop: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }
const hint: CSSProperties = { fontSize: 13.5, color: 'var(--ink-soft)' }
const primaryBtn: CSSProperties = {
  height: 44,
  padding: '0 22px',
  borderRadius: 22,
  border: 0,
  background: 'var(--ink)',
  color: '#fff',
  fontSize: 15,
  fontWeight: 500,
  cursor: 'pointer',
}
const secondaryBtn: CSSProperties = {
  height: 44,
  padding: '0 22px',
  borderRadius: 22,
  border: '1px solid var(--line)',
  background: 'var(--card)',
  color: 'var(--ink)',
  fontSize: 15,
  fontWeight: 500,
  cursor: 'pointer',
}
const chipOn: CSSProperties = {
  height: 40,
  padding: '0 18px',
  borderRadius: 20,
  border: 0,
  background: 'var(--ink)',
  color: '#fff',
  fontSize: 14.5,
  fontWeight: 500,
  cursor: 'pointer',
}
const chipOff: CSSProperties = {
  height: 40,
  padding: '0 18px',
  borderRadius: 20,
  border: '1px solid var(--line)',
  background: 'var(--card)',
  color: 'var(--ink)',
  fontSize: 14.5,
  fontWeight: 500,
  cursor: 'pointer',
}
const pasteInput: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  marginTop: 14,
  height: 52,
  padding: '0 18px',
  borderRadius: 14,
  border: '1px solid var(--line)',
  background: 'var(--bg)',
  fontFamily: 'inherit',
  fontSize: 16,
  color: 'var(--ink)',
}
const okNote: CSSProperties = {
  marginTop: 12,
  padding: '10px 14px',
  borderRadius: 12,
  background: 'var(--bg)',
  border: '1px solid var(--line)',
  fontSize: 14,
  color: 'var(--ink)',
}
const errorNote: CSSProperties = okNote
const previewBox: CSSProperties = {
  marginTop: 12,
  padding: '14px 16px 16px',
  borderRadius: 12,
  background: 'var(--bg)',
  border: '1px solid var(--line)',
}
const statLine: CSSProperties = { fontSize: 15, color: 'var(--ink)' }
const note: CSSProperties = { margin: '12px 0 0', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-soft)' }
const plainLink: CSSProperties = { color: 'var(--ink-soft)', textDecoration: 'none', fontSize: 15, fontWeight: 500 }
