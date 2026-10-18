// Profile persistence: one browser profile, portable via a code (milestone 4).
// All localStorage access is in try/catch. Migration runs on read.
import type { Level } from './levels'
import { ING_BY_ID } from '../data/ingredients'
import { RECIPE_ID_BY_SLUG } from '../data/recipes'

export const PROFILE_KEY = 'shakely.profile.v1'

export type EditOp = 'swap' | 'remove' | 'qty' | 'scale'

export interface Edit {
  op: EditOp
  slot: string
  value?: string | number
}

export type Goal = 'build' | 'lean' | 'recovery'

export interface Saved {
  recipeId: number
  level: Level
  serves: number
  savedAt: number
  edits?: Edit[]
}

export interface Profile {
  v: 1
  goal: Goal
  diet: string[]
  pantry: string[]
  saved: Saved[]
  level: Level
}

export function defaultProfile(): Profile {
  return { v: 1, goal: 'build', diet: [], pantry: [], saved: [], level: 0 }
}

// ---- safe storage (never throws) ----

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      /* storage unavailable (private mode, quota) — app stays in-memory */
    }
  },
  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}

// ---- migration on read ----

const KNOWN_GOALS: Goal[] = ['build', 'lean', 'recovery']

/** Accepts the current shape or any earlier layout and returns a valid Profile. */
export function migrateProfile(raw: unknown): Profile {
  const base = defaultProfile()
  if (!raw || typeof raw !== 'object') return base
  const src = (raw as { state?: unknown } & Record<string, unknown>)
  const s = (typeof src.state === 'object' && src.state !== null ? src.state : raw) as Record<string, unknown>
  const out: Profile = { ...base }
  if (KNOWN_GOALS.includes(s.goal as Goal)) out.goal = s.goal as Goal
  if (Array.isArray(s.diet)) out.diet = s.diet.filter((d) => typeof d === 'string')
  if (Array.isArray(s.pantry)) out.pantry = s.pantry.filter((i) => typeof i === 'string' && !!ING_BY_ID[i])
  out.level = s.level === 1 || s.level === 2 ? (s.level as Level) : 0
  const legacySaved = s.saved
  if (Array.isArray(legacySaved)) {
    out.saved = legacySaved
      .filter((e): e is Saved => !!e && typeof e === 'object' && typeof (e as Saved).recipeId === 'number')
      .map((e) => ({
        recipeId: e.recipeId,
        level: e.level === 1 || e.level === 2 ? e.level : 0,
        serves: typeof e.serves === 'number' && e.serves >= 1 ? Math.min(e.serves, 8) : 1,
        savedAt: typeof e.savedAt === 'number' ? e.savedAt : Date.now(),
        ...(e.edits ? { edits: e.edits } : {}),
      }))
  } else if (legacySaved && typeof legacySaved === 'object') {
    // Legacy pre-foundation shape: Record<slugId, ISO-date-string | true>.
    const map = legacySaved as Record<string, unknown>
    out.saved = Object.entries(map)
      .map(([slugId, stamp]) => {
        const recipeId = RECIPE_ID_BY_SLUG[slugId]
        if (recipeId == null) return null
        const t = typeof stamp === 'string' ? Date.parse(stamp) : NaN
        return { recipeId, level: 0 as Level, serves: 1, savedAt: Number.isNaN(t) ? Date.now() : t }
      })
      .filter((e): e is Saved => e !== null)
  }
  return out
}

/** True when a foreign-key legacy profile exists and has been imported. */
export function importLegacyProfiles(): boolean {
  if (typeof window === 'undefined') return false
  const legacy = safeStorage.getItem('shakely-v1') ?? safeStorage.getItem('blendr-v1')
  if (!legacy) return false
  // Remove foreign keys either way; the read path decides if we keep the data.
  safeStorage.removeItem('shakely-v1')
  safeStorage.removeItem('blendr-v1')
  if (safeStorage.getItem(PROFILE_KEY)) return false // current profile wins
  try {
    const parsed: unknown = JSON.parse(legacy)
    const migrated = migrateProfile(parsed)
    safeStorage.setItem(PROFILE_KEY, JSON.stringify({ state: migrated, version: 1 }))
    return migrated.saved.length > 0
  } catch {
    return false
  }
}

export function readRawProfileState(): unknown {
  const raw = safeStorage.getItem(PROFILE_KEY)
  if (!raw) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}
