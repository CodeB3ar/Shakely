// Every macro number in the app comes from here: per100g x grams.
// Never store totals, never hand-type them.
import { RECIPES_BY_ID, type Item, type Recipe } from './recipes'
import { ing, type Ingredient } from './ingredients'
import type { Level } from '../state/levels'

// Canonical liquid set: chip, validator and tests share this one list.
export { LIQUIDS } from './constants'

export interface Macros {
  p: number
  c: number
  f: number
  kcal: number
}

export interface Line {
  ing: Ingredient
  qty: number // authored quantity in the ingredient's unit
  grams: number
}

// Hoisted function declaration, not an arrow const: recipes.ts builds its
// RECIPES array by calling generateRecipes, which reaches levelMacros ->
// sumMacros before this module's body has finished running (import-cycle
// entry orders). Function declarations survive that; consts do not.
function EMPTY_MACROS(): Macros {
  return { p: 0, c: 0, f: 0, kcal: 0 }
}

/** Quantity after Dial-it-in scale, quantised to the ingredient's step. */
export function scaledQty(ingId: string, qty: number, scale = 1): number {
  const dossier = ing(ingId)
  return Math.max(dossier.step, Math.round((qty * scale) / dossier.step) * dossier.step)
}

export function lineFor(item: Item, scale = 1): Line {
  const dossier = ing(item.ing)
  const qty = scaledQty(item.ing, item.qty, scale)
  return { ing: dossier, qty, grams: qty * dossier.gramsPerUnit }
}

export function computeMacros(line: Line): Macros {
  const g = line.grams / 100
  return {
    p: line.ing.per100g.p * g,
    c: line.ing.per100g.c * g,
    f: line.ing.per100g.f * g,
    kcal: line.ing.per100g.kcal * g,
  }
}

export function sumMacros(macrosList: Macros[]): Macros {
  return macrosList.reduce(
    (t, m) => ({ p: t.p + m.p, c: t.c + m.c, f: t.f + m.f, kcal: t.kcal + m.kcal }),
    EMPTY_MACROS(),
  )
}

export function itemsForLevel(rc: Recipe, level: Level): Item[] {
  return level === 0 ? rc.core : level === 1 ? [...rc.core, ...rc.extras] : [...rc.core, ...rc.extras, ...rc.boosters]
}

export function linesFor(rc: Recipe, level: Level, scale = 1): Line[] {
  return itemsForLevel(rc, level).map((it) => lineFor(it, scale))
}

/** Macros per serve of the given level. Recipe quantities are authored per serve. */
export function levelMacros(rc: Recipe, level: Level, scale = 1): Macros {
  return sumMacros(linesFor(rc, level, scale).map(computeMacros))
}

export function recipeOf(id: number): Recipe | undefined {
  return RECIPES_BY_ID[id]
}

/** Count of distinct ingredients used at the given level. */
export function levelIngredientCount(rc: Recipe, level: Level): number {
  return itemsForLevel(rc, level).length
}
