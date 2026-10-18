// Recipe generator v1 — FROZEN. The seed, pools, sizes, quotas, naming
// scheme and method templates below all belong to the v1 freeze: recipe
// id N must always reproduce the same recipe (profile codes carry those
// ids too). Any change to this formula is generator v2 — v1 stays.
//
// Determinism contract: this module never reads the clock, never uses
// Math.random, and walks only fixed literal pools and the append-only
// ingredient index. Same seed + same authored block → same id list →
// same names and macros.
//
// Cycle discipline: this module must NOT dereference recipes.ts at
// import time (recipes.ts calls generateRecipes during its own module
// init). All pool data therefore lives inside generateRecipes, and the
// authored block arrives as a parameter — only hoisted function
// declarations and leaf constants are touched, whichever module the
// bundler enters first.
import type { Goal, Item, Recipe } from './recipes'
import { ing } from './ingredients'
// No runtime import of macros.ts: generateRecipes first runs during
// recipes' module init, and in bundler entry orders that start at
// generator.ts (or macros.ts) the macros import binding is still
// uninitialised at that moment. The scale-1 macro math is mirrored
// inline below; validate.test.ts holds generated declared goals against
// the real macros/chip path, so drift there fails the suite.
import { CARB_MIN, GREENS, LEAN_KCAL_MAX, LEAN_PROTEIN_MIN, THRESHOLDS } from './constants'

export const GENERATOR_SEED = 58692

/** Mulberry32 — small, fast, deterministic. The frozen v1 PRNG choice. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function multisetKey(items: Item[]): string {
  return items.map((it) => it.ing).sort().join(',')
}

// Inline mirror of macros.itemsForLevel (which level the items belong to).
function inlineItems(rc: { core: Item[]; extras: Item[]; boosters: Item[] }, level: number): Item[] {
  return level === 0 ? rc.core : level === 1 ? [...rc.core, ...rc.extras] : [...rc.core, ...rc.extras, ...rc.boosters]
}

// Inline mirror of macros.lineFor + macros.levelMacros at scale 1.
function inlineMacros(items: Item[]): { p: number; c: number; f: number; kcal: number } {
  const m = { p: 0, c: 0, f: 0, kcal: 0 }
  for (const it of items) {
    const dossier = ing(it.ing)
    const qty = Math.max(dossier.step, Math.round(it.qty / dossier.step) * dossier.step)
    const g = (qty * dossier.gramsPerUnit) / 100
    m.p += dossier.per100g.p * g
    m.c += dossier.per100g.c * g
    m.f += dossier.per100g.f * g
    m.kcal += dossier.per100g.kcal * g
  }
  return m
}

/** Which goals does this recipe meet at every level? The declared list. */
function achievedGoals(rc: Pick<Recipe, 'core' | 'extras' | 'boosters'>): Goal[] {
  const out: Goal[] = []
  let pre = true, post = true, hiPro = true, lean = true, green = true
  for (const level of [0, 1, 2] as const) {
    const items = inlineItems({ core: rc.core, extras: rc.extras, boosters: rc.boosters }, level)
    const m = inlineMacros(items)
    const greens = items
      .filter((it) => (GREENS as string[]).includes(it.ing))
      .reduce((t, it) => t + it.qty, 0)
    if (m.c < CARB_MIN) pre = false
    // one constant: the post-workout chip threshold IS the post goal floor
    if (m.p < THRESHOLDS.postWorkoutProtein) post = false
    if (m.p < THRESHOLDS.proteinMin) hiPro = false
    if (m.kcal > LEAN_KCAL_MAX || m.p < LEAN_PROTEIN_MIN) lean = false
    if (greens < 1) green = false
  }
  if (pre) out.push('pre')
  if (post) out.push('post')
  if (green) out.push('green')
  if (lean) out.push('lean')
  if (hiPro) out.push('high-protein')
  return out
}

/**
 * Build the deterministic v1 generated block: ids start right after the
 * authored block and are contiguous. The default seed is inlined (not a
 * reference to the exported constant): with a generator-first import
 * cycle the module body would not yet have run when recipes.ts calls
 * this. Passing `authored` keeps the cycle one-way and lets tests call
 * this twice for the determinism contract.
 */
export function generateRecipes(authored: Recipe[], seed: number = 58692): Recipe[] {
  // v1 pools (frozen). Seed data inside the function so a mid-cycle call
  // never touches uninitialised module state.
  const GENERATE_TARGET = 270
  const MAX_TRIES = 20000
  const ROTATION: Goal[] = ['post', 'pre', 'green', 'lean', 'high-protein']
  const LIQUID_POOL = ['milk', 'oat-milk', 'almond-milk', 'soy-milk', 'coconut-water', 'coffee', 'coconut-milk']
  const PROTEIN_POOL = ['protein', 'pea-protein', 'collagen', 'yogurt', 'cottage-cheese']
  const FRUIT_POOL = ['banana', 'strawberry', 'blueberry', 'mango', 'pineapple', 'peach', 'raspberry', 'kiwi', 'cherry', 'orange', 'dates']
  const BASE_POOL = ['ice', 'oats']
  const EXTRA_POOL = ['ice', 'oats', 'honey', 'maple-syrup', 'banana', 'strawberry', 'blueberry', 'mango', 'peach', 'raspberry', 'cherry', 'kiwi', 'orange', 'pineapple', 'yogurt', 'cacao', 'peanut-butter', 'almond-butter', 'sunflower-butter', 'coconut-flakes', 'spinach', 'kale', 'cucumber', 'dates', 'avocado']
  const BOOSTER_POOL = ['chia', 'flax', 'pumpkin-seeds', 'cacao', 'honey', 'maple-syrup', 'peanut-butter', 'almond-butter', 'sunflower-butter', 'coconut-flakes', 'avocado', 'oats', 'protein']
  // slim booster/extra pools for lean quotas (the 350 kcal cap bites hard)
  const LEAN_EXTRA_POOL = ['cucumber', 'spinach', 'kale', 'strawberry', 'blueberry', 'raspberry', 'cherry', 'kiwi', 'orange', 'peach', 'ice']
  const LEAN_BOOSTER_POOL = ['flax', 'chia', 'cucumber', 'spinach', 'kale']
  const QTY: Record<string, number> = { dates: 60, yogurt: 0.5, 'cottage-cheese': 0.25, 'coconut-milk': 0.25, oats: 3, avocado: 0.5 }
  const ADJECTIVES = ['Ruby', 'Velvet', 'Sunlit', 'Emerald', 'Golden', 'Frosted', 'Wild', 'Twin', 'Silver', 'Copper', 'Amber', 'Midnight', 'Coral', 'Sunny', 'Zesty', 'Cool']
  const MIDDLES = ['', 'Berry', 'Citrus', 'Garden', 'Orchard', 'Morning']
  const NOUNS = ['Shake', 'Refuel', 'Boost', 'Glow', 'Charge', 'Smoothie', 'Fuel', 'Lift', 'Rush', 'Feast', 'Start']
  const BLEND_LINES = ['Blend 30 to 45 seconds until smooth.', 'Blend 45 seconds until smooth.', 'Blend a full minute until smooth.']

  const rand = mulberry32(seed)
  const usedNames = new Set(authored.map((rc) => rc.name))
  const seen = new Set(authored.map((rc) => multisetKey([...rc.core, ...rc.extras, ...rc.boosters])))
  const out: Recipe[] = []
  let tries = 0

  const qtyOf = (id: string): number => QTY[id] ?? 1
  const pickOf = (pool: string[], used: Set<string>): string => {
    for (;;) {
      const id = pool[Math.floor(rand() * pool.length)]
      if (!used.has(id)) return id
    }
  }
  /** Accepts fewer items instead of spinning when the pool runs dry. */
  const pickSome = (pool: string[], used: Set<string>, count: number): Item[] => {
    const out: Item[] = []
    let attempts = 0
    while (out.length < count && attempts < count * 20) {
      attempts++
      const id = pool[Math.floor(rand() * pool.length)]
      if (!used.has(id)) {
        used.add(id)
        out.push({ ing: id, qty: qtyOf(id) })
      }
    }
    return out
  }
  const nextName = (): string => {
    for (;;) {
      const mid = MIDDLES[Math.floor(rand() * MIDDLES.length)]
      const name = [
        ADJECTIVES[Math.floor(rand() * ADJECTIVES.length)],
        mid,
        NOUNS[Math.floor(rand() * NOUNS.length)],
      ].filter(Boolean).join(' ')
      if (!usedNames.has(name)) {
        usedNames.add(name)
        return name
      }
    }
  }

  /** One candidate draw: sizes valid by construction, goals checked. */
  const sample = (target: Goal): { core: Item[]; extras: Item[]; boosters: Item[] } => {
    const used = new Set<string>()
    const lean = target === 'lean'
    const liquid = pickOf(lean ? ['almond-milk', 'almond-milk', 'soy-milk', 'oat-milk'] : LIQUID_POOL, used)
    const protein = pickOf(PROTEIN_POOL, used)
    const fruitPool = target === 'green' ? (GREENS as string[]) : rand() < 0.85 ? FRUIT_POOL : (GREENS as string[])
    const fruit = pickOf(fruitPool, used)
    const coreIds = [liquid, protein, fruit]
    if (rand() < 0.85) coreIds.push(pickOf(lean ? ['ice'] : BASE_POOL, used))
    const coreItems = coreIds.map((id) => ({ ing: id, qty: qtyOf(id) }))
    const usedIds = new Set(coreIds)

    const extrasFrom = lean ? LEAN_EXTRA_POOL : EXTRA_POOL
    const boostersFrom = lean ? LEAN_BOOSTER_POOL : BOOSTER_POOL
    const extrasCount = Math.min(7 - coreIds.length, 6 - coreIds.length + Math.floor(rand() * 2)) // L1 = 6 or 7
    const l1 = coreIds.length + extrasCount
    const boostersCount = Math.max(0, Math.min(9 - l1, 7 - l1 + Math.floor(rand() * 3))) // L2 = 7-9
    const extras = pickSome(extrasFrom, usedIds, extrasCount)
    const boosters = pickSome(boostersFrom, usedIds, boostersCount)
    return { core: coreItems, extras, boosters }
  }

  while (out.length < GENERATE_TARGET && tries < MAX_TRIES) {
    tries++
    const target = ROTATION[out.length % ROTATION.length]
    const parts = sample(target)
    const key = multisetKey([...parts.core, ...parts.extras, ...parts.boosters])
    if (seen.has(key)) continue
    const goals = achievedGoals(parts)
    if (!goals.includes(target)) continue
    seen.add(key)
    out.push({
      id: authored.length + 1 + out.length,
      name: nextName(),
      goal: goals,
      core: parts.core,
      extras: parts.extras,
      boosters: parts.boosters,
      method: methodFor(parts, rand, BLEND_LINES),
    })
  }
  return out
}

/** Method prose: liquid → dry/dairy → blend, following the Recipe page. */
function methodFor(parts: { core: Item[]; extras: Item[]; boosters: Item[] }, rand: () => number, blendLines: string[]): string[] {
  const proseName = (id: string) =>
    ing(id).name.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim().toLowerCase()
  const list = (items: Item[]) => {
    const names = items.map((it) => proseName(it.ing))
    if (names.length <= 1) return names.join('')
    return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  }
  const coffee = parts.core.find((it) => it.ing === 'coffee')
  const lines: string[] = []
  lines.push(coffee ? 'Brew the coffee and let it cool a few minutes.' : `Pour the ${proseName(parts.core[0].ing)} in.`)
  lines.push(`Add the ${list(parts.core.slice(1))}${parts.extras.length ? ` plus the ${list(parts.extras)}` : ''}.`)
  lines.push(blendLines[Math.floor(rand() * blendLines.length)])
  if (parts.boosters.length) lines.push(`Finish with the ${list(parts.boosters)} for the Athlete build.`)
  return lines
}
