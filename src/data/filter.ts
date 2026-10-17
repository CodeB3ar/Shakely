import { RECIPES, type Recipe } from './recipes'
import { ING_BY_ID } from './ingredients'
import { LEVELS, type Level } from '../state/store'

export interface RecipeStats {
  ids: string[]
  protein: number
  kcal: number
}

export function levelOf(rc: Recipe, savedLevel?: Level): Level {
  if (savedLevel != null) return savedLevel
  const n = rc.ing.length
  return (n <= 4 ? 0 : n <= 6 ? 1 : 2) as Level
}

export function shown(level: Level, rc: Recipe): string[] {
  if (level === 0) return rc.ing.slice(0, 4)
  if (level === 1) return rc.ing.slice(0, 6)
  const extra = ['protein', 'oats'].filter((x) => rc.ing.indexOf(x) < 0)
  return rc.ing.concat(extra).slice(0, 9)
}

export function statsOf(level: Level, rc: Recipe): RecipeStats {
  const ids = shown(level, rc)
  let p = 0
  let k = 0
  ids.forEach((id) => {
    const ing = ING_BY_ID[id]
    if (ing) {
      p += ing.protein
      k += ing.kcal
    }
  })
  return { ids, protein: p, kcal: k }
}

export function matches(
  rc: Recipe,
  level: Level,
  chips: Record<string, boolean>,
  q: string,
): boolean {
  const { ids, protein, kcal } = statsOf(level, rc)
  const has = (x: string) => ids.indexOf(x) > -1
  const ok =
    (!chips.p20 || protein >= 20) &&
    (!chips.k300 || kcal <= 300) &&
    (!chips.green || has('spinach') || has('avocado')) &&
    (!chips.dairy || !(has('milk') || has('yogurt'))) &&
    (!chips.vegan || !(has('milk') || has('yogurt') || has('honey'))) &&
    (!chips.nut || !(has('peanut') || has('coconut'))) &&
    (!chips.workout || protein >= 24) &&
    (!chips.peanut || has('peanut'))
  if (!ok) return false
  const query = q.trim().toLowerCase()
  if (!query) return true
  const hay = (rc.name + ' ' + ids.map((id) => ING_BY_ID[id]?.name ?? id).join(' ')).toLowerCase()
  return hay.indexOf(query) > -1
}

export function searchRecipes(
  level: Level,
  chips: Record<string, boolean>,
  q = '',
): { rc: Recipe; lv: Level; stats: RecipeStats }[] {
  const out: { rc: Recipe; lv: Level; stats: RecipeStats }[] = []
  RECIPES.forEach((rc) => {
    const lv = levelOf(rc, level)
    if (matches(rc, level, chips, q)) out.push({ rc, lv, stats: statsOf(level, rc) })
  })
  return out
}

export function levelBadge(lv: Level): string {
  return `${LEVELS[lv].label} · ${LEVELS[lv].time}`
}

export const POPULAR_PICKS = ['peanut-butter-banana', 'berry-blast', 'choc-peanut-crunch'].map(
  (id) => RECIPES.find((r) => r.id === id)!,
)

export function timeAgo(stamp?: string | true): string {
  if (!stamp) return 'saved'
  if (stamp === true) return 'saved'
  const s = new Date(stamp).getTime()
  if (Number.isNaN(s)) return 'saved'
  const min = Math.max(1, Math.round((Date.now() - s) / 60000))
  if (min < 60) return `${min}m ago`
  const h = Math.round(min / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  return d === 1 ? '1 day ago' : `${d} days ago`
}
