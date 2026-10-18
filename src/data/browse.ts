// Minimal working matcher for Browse and Pantry, running on the real
// per-level macros from data/macros.ts. Filters also come as URL params
// (paramsToFilters / filtersToParams); unknown or junk params are ignored.
import { RECIPES, RECIPE_ID_BY_SLUG, type Recipe } from './recipes'
import { levelMacros, type Macros } from './macros'
import { ing, ING_BY_ID } from './ingredients'
import { GREENS, THRESHOLDS } from './constants'
import type { Level } from '../state/levels'

// Thresholds and greens live once in constants.ts; re-exported here so
// every chip consumer keeps a single import path.
export { GREENS, THRESHOLDS } from './constants'

export type FilterKey = 'p20' | 'k300' | 'green' | 'dairy' | 'vegan' | 'nut' | 'workout'

export const GOAL_FILTERS: { id: FilterKey; label: string }[] = [
  { id: 'p20', label: '20g protein' },
  { id: 'k300', label: 'Under 300 kcal' },
  { id: 'green', label: 'Green' },
  { id: 'workout', label: 'Post-workout' },
]

export const DIET_FILTERS: { id: FilterKey; label: string }[] = [
  { id: 'dairy', label: 'Dairy-free' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'nut', label: 'Nut-free' },
]

export const GOAL_KEYS: FilterKey[] = ['p20', 'k300', 'green', 'workout']
export const DIET_KEYS: FilterKey[] = ['dairy', 'vegan', 'nut']

export const FILTER_LABELS: Record<FilterKey, string> = {
  p20: '20g protein',
  k300: 'Under 300 kcal',
  green: 'Green',
  dairy: 'Dairy-free',
  vegan: 'Vegan',
  nut: 'Nut-free',
  workout: 'Post-workout',
}

export interface RecipeStats {
  macros: Macros
  count: number
}

export function statsFor(rc: Recipe, level: Level): RecipeStats {
  return { macros: levelMacros(rc, level), count: rcItems(rc, level) }
}

function rcItems(rc: Recipe, level: Level): number {
  return level === 0 ? rc.core.length : level === 1 ? rc.core.length + rc.extras.length : rc.core.length + rc.extras.length + rc.boosters.length
}

export function matches(
  rc: Recipe,
  level: Level,
  chips: Record<string, boolean>,
  q: string,
  ings: string[] = [],
): boolean {
  const { macros } = statsFor(rc, level)
  const has = (id: string) => rcHas(rc, level, id)
  const tagSet = tagsFor(rc, level)
  const ok =
    (!chips.p20 || macros.p >= THRESHOLDS.proteinMin) &&
    (!chips.k300 || macros.kcal <= THRESHOLDS.kcalMax) &&
    (!chips.green || GREENS.some(has)) &&
    (!chips.dairy || !tagSet.has('dairy')) &&
    (!chips.vegan || !(tagSet.has('animal') || tagSet.has('honey'))) &&
    (!chips.nut || !(tagSet.has('nut') || tagSet.has('peanut'))) && // coconut has its own tag, not excluded by nut-free
    (!chips.workout || macros.p >= THRESHOLDS.postWorkoutProtein)
  if (!ok) return false
  if (!ings.every(has)) return false
  const query = q.trim().toLowerCase()
  if (!query) return true
  const hay = (rc.name + ' ' + namesFor(rc, level)).toLowerCase()
  return hay.includes(query)
}

function rcHas(rc: Recipe, level: Level, id: string): boolean {
  const items =
    level === 0 ? rc.core : level === 1 ? [...rc.core, ...rc.extras] : [...rc.core, ...rc.extras, ...rc.boosters]
  return items.some((it) => it.ing === id)
}

function tagsFor(rc: Recipe, level: Level): Set<string> {
  const set = new Set<string>()
  const items =
    level === 0 ? rc.core : level === 1 ? [...rc.core, ...rc.extras] : [...rc.core, ...rc.extras, ...rc.boosters]
  items.forEach((it) => ing(it.ing).tags.forEach((t) => set.add(t)))
  return set
}

function namesFor(rc: Recipe, level: Level): string {
  const items =
    level === 0 ? rc.core : level === 1 ? [...rc.core, ...rc.extras] : [...rc.core, ...rc.extras, ...rc.boosters]
  return items.map((it) => ing(it.ing).name).join(' ')
}

export function searchRecipes(
  level: Level,
  chips: Record<string, boolean>,
  q = '',
  ings: string[] = [],
): { rc: Recipe; stats: RecipeStats }[] {
  const out: { rc: Recipe; stats: RecipeStats }[] = []
  RECIPES.forEach((rc) => {
    if (matches(rc, level, chips, q, ings)) out.push({ rc, stats: statsFor(rc, level) })
  })
  return out
}

export const POPULAR_PICKS: Recipe[] = (
  ['peanut-butter-banana', 'berry-blast', 'choc-peanut-crunch'] as const
).map((slugId) => RECIPES.find((r) => r.id === RECIPE_ID_BY_SLUG[slugId])!)

// ---- URL filter state (milestone 3) ----
// goal= and diet= carry comma-separated filter ids, ing= a comma-separated
// list of ingredient ids, q= the free-text search and level= the level the
// results were filtered on. Unknown params, unknown filter ids, unknown
// ingredient ids and out-of-range levels are ignored.

export interface BrowseFilters {
  level: Level
  levelExplicit: boolean // the URL carried a level param
  chips: Record<string, boolean>
  ings: string[]
  q: string
}

const csv = (s: string | null): string[] => (s ?? '').split(',').map((x) => x.trim()).filter(Boolean)

export function paramsToFilters(params: URLSearchParams, fallbackLevel: Level): BrowseFilters {
  const rawLevel = params.get('level')
  const parsed = rawLevel == null ? NaN : Number(rawLevel)
  const levelExplicit = Number.isInteger(parsed) && parsed >= 0 && parsed <= 2
  const chips: Record<string, boolean> = {}
  csv(params.get('goal')).forEach((id) => {
    if ((GOAL_KEYS as string[]).includes(id)) chips[id] = true
  })
  csv(params.get('diet')).forEach((id) => {
    if ((DIET_KEYS as string[]).includes(id)) chips[id] = true
  })
  return {
    level: levelExplicit ? (parsed as Level) : fallbackLevel,
    levelExplicit,
    chips,
    ings: csv(params.get('ing')).filter((id) => !!ING_BY_ID[id]),
    q: params.get('q') ?? '',
  }
}

export function filtersToParams(f: { level?: Level; chips?: Record<string, boolean>; ings?: string[]; q?: string }): URLSearchParams {
  const p = new URLSearchParams()
  const chips = f.chips ?? {}
  const goal = GOAL_KEYS.filter((k) => chips[k])
  const diet = DIET_KEYS.filter((k) => chips[k])
  if (goal.length) p.set('goal', goal.join(','))
  if (diet.length) p.set('diet', diet.join(','))
  if (f.ings?.length) p.set('ing', f.ings.join(','))
  if (f.q) p.set('q', f.q)
  if (f.level != null) p.set('level', String(f.level))
  return p
}

// ---- Pantry matching ----

export interface PantryHit {
  rc: Recipe
  stats: RecipeStats
  have: string[]
  missing: string[]
}

export function pantryHits(level: Level, pantry: string[], extraChips: Record<string, boolean> = {}, q = '', ings: string[] = []): {
  ready: PantryHit[]
  missingOne: PantryHit[]
  missingMore: PantryHit[]
} {
  const pantrySet = new Set(pantry)
  const hits: PantryHit[] = RECIPES.map((rc) => {
    const items =
      level === 0 ? rc.core : level === 1 ? [...rc.core, ...rc.extras] : [...rc.core, ...rc.extras, ...rc.boosters]
    const have = items.filter((it) => pantrySet.has(it.ing)).map((it) => it.ing)
    const missing = items.filter((it) => !pantrySet.has(it.ing)).map((it) => it.ing)
    return { rc, stats: statsFor(rc, level), have, missing }
  }).filter((hit) => matches(hit.rc, level, extraChips, q, ings))
  const byMissing = (a: PantryHit, b: PantryHit) => a.missing.length - b.missing.length || b.have.length - a.have.length
  hits.sort(byMissing)
  return {
    ready: hits.filter((h) => h.missing.length === 0),
    missingOne: hits.filter((h) => h.missing.length === 1),
    missingMore: hits.filter((h) => h.missing.length >= 2),
  }
}
