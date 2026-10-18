// Levels are authored recipe variants, not filters.
// Quick = core (3-4), Loaded = core + extras (6-7), Athlete = + boosters (7-9).

export type Level = 0 | 1 | 2

export const LEVEL_COUNT = 3

export interface LevelMeta {
  label: string
  time: string
  long: string
}

export const LEVELS: LevelMeta[] = [
  { label: 'Quick', time: '2m', long: 'About 2 min' },
  { label: 'Loaded', time: '5m', long: 'About 5 min' },
  { label: 'Athlete', time: '8m', long: '5-8 min' },
]

export function levelMeta(level: Level): LevelMeta {
  return LEVELS[level]
}

export function levelBadge(level: Level): string {
  return `${LEVELS[level].label} · ${LEVELS[level].time}`
}

export function clampLevel(n: unknown): Level {
  return n === 1 || n === 2 ? (n as Level) : 0
}
