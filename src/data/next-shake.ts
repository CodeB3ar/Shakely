// Next shake: advance within the results list the user came from, only
// when the current recipe is in it. Anything else wraps the full recipe
// list the old way. The results list lives in the store (sessionStorage
// backed) — see store.tsx `results`.
import { RECIPES } from './recipes'

/**
 * Returns the next recipe id after `current`:
 *  - inside the caller's results list: the list's next entry, wrapping
 *  - current not in the list (stale or missing): the next id in RECIPES
 *    order, wrapping
 */
export function nextIdInList(list: number[] | null, current: number): number {
  if (list) {
    const idx = list.indexOf(current)
    if (idx >= 0 && list.length > 1) return list[(idx + 1) % list.length]
  }
  const i = RECIPES.findIndex((r) => r.id === current)
  return RECIPES[(i + 1) % RECIPES.length].id
}
