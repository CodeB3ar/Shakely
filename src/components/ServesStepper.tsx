// Serves stepper from the Recipe mock-up. Targets stay per serve; totals
// scale. Handles are real buttons with a min of 1 and max of 8.
export default function ServesStepper({
  serves,
  onChange,
  min = 1,
  max = 8,
  size = 44,
}: {
  serves: number
  onChange: (next: number) => void
  min?: number
  max?: number
  size?: number
}) {
  const btn = {
    width: size,
    height: size,
    border: 0,
    borderRadius: '50%',
    background: 'var(--chip)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flex: 'none',
  } as const
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }} role="group" aria-label="Serves">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, serves - 1))}
        disabled={serves <= min}
        aria-label="Fewer serves"
        style={btn}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M5 12h14" />
        </svg>
      </button>
      <span aria-live="polite" style={{ minWidth: 24, textAlign: 'center', fontSize: 20, fontWeight: 500 }}>
        {serves === 1 ? '1 serve' : `${serves} serves`}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, serves + 1))}
        disabled={serves >= max}
        aria-label="More serves"
        style={btn}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  )
}
