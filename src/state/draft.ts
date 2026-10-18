// One-slot scratch state for opening a saved entry (Saved → recipe).
// sessionStorage scope, never persisted to the profile: a card click
// drops the entry snapshot here; the recipe page consumes it once.
import type { Edit } from './profile'
import type { Level } from './levels'

export interface Draft {
  recipeId: number
  level: Level
  serves: number
  edits?: Edit[]
}

const DRAFT_KEY = 'shakely.draft'

export function setDraft(draft: Draft): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // no storage — the recipe page falls back to the saved entry
  }
}

/** Take the draft if it is for this recipe, clearing it from storage. */
export function takeDraft(recipeId: number): Draft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    sessionStorage.removeItem(DRAFT_KEY)
    const d = JSON.parse(raw) as Draft
    return d && Number.isInteger(d.recipeId) && [0, 1, 2].includes(d.level) && d.recipeId === recipeId ? d : null
  } catch {
    return null
  }
}

export function clearDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // nothing to clear
  }
}
