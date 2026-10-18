// One shared store. Every screen reads the same state; browser profile
// persists under src/state/profile.ts rules (try/catch, migrate on read).
// Filter chips are NOT in the store — Browse filters live in the URL.
// `results` is the current results list for Next shake: session scope
// (sessionStorage so a reload keeps it), never persisted to the profile.
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { importLegacyProfiles, migrateProfile, PROFILE_KEY, safeStorage, defaultProfile, type Profile, type Goal, type Saved, type Edit } from './profile'
import type { Level } from './levels'

export type { Level } from './levels'
export type { Goal, Saved, Profile, Edit } from './profile'

interface State {
  level: Level
  goal: Goal
  diet: string[]
  pantry: string[]
  saved: Saved[]
  results: number[] | null
  setLevel: (lv: Level) => void
  setResults: (ids: number[]) => void
  toggleSave: (recipeId: number) => void
  saveRecipe: (recipeId: number, patch: { level: Level; serves: number; edits?: Edit[] }) => void
  unsave: (recipeId: number) => void
  restoreSaved: (entry: Saved) => void
  setGoal: (g: Goal) => void
  toggleDiet: (tag: string) => void
  togglePantry: (id: string) => void
  clearPantry: () => void
}

// Import foreign-key legacy profiles once, before persist rehydrates.
export function initLegacyMigration(): void {
  importLegacyProfiles()
}

const persisted = (s: State): Pick<State, 'level' | 'goal' | 'diet' | 'pantry' | 'saved'> => ({
  level: s.level,
  goal: s.goal,
  diet: s.diet,
  pantry: s.pantry,
  saved: s.saved,
})

const RESULTS_KEY = 'shakely.results'

function loadResults(): number[] | null {
  try {
    const raw = sessionStorage.getItem(RESULTS_KEY)
    if (!raw) return null
    const arr = JSON.parse(raw)
    return Array.isArray(arr) && arr.every((n) => Number.isInteger(n)) ? (arr as number[]) : null
  } catch {
    return null
  }
}

function storeResults(ids: number[]): void {
  try {
    sessionStorage.setItem(RESULTS_KEY, JSON.stringify(ids))
  } catch {
    // session storage unavailable — results still live in memory
  }
}

export const useBlend = create<State>()(
  persist(
    (set) => ({
      level: 0,
      goal: 'build',
      diet: [],
      pantry: [],
      saved: [],
      results: loadResults(),
      setLevel: (level) => set({ level }),
      setResults: (results) => {
        storeResults(results)
        set({ results })
      },
      toggleSave: (recipeId) =>
        set((s) => {
          const found = s.saved.find((x) => x.recipeId === recipeId)
          return { saved: found ? s.saved.filter((x) => x.recipeId !== recipeId) : [...s.saved, { recipeId, level: s.level, serves: 1, savedAt: Date.now() }] }
        }),
      saveRecipe: (recipeId, patch) =>
        set((s) => {
          const rest = s.saved.filter((x) => x.recipeId !== recipeId)
          return {
            saved: [...rest, { recipeId, level: patch.level, serves: patch.serves, savedAt: Date.now(), ...(patch.edits && patch.edits.length ? { edits: patch.edits } : {}) }],
          }
        }),
      unsave: (recipeId) => set((s) => ({ saved: s.saved.filter((x) => x.recipeId !== recipeId) })),
      restoreSaved: (entry) =>
        set((s) => ({ saved: [...s.saved.filter((x) => x.recipeId !== entry.recipeId), entry] })),
      setGoal: (goal) => set({ goal }),
      toggleDiet: (tag) => set((s) => ({ diet: s.diet.includes(tag) ? s.diet.filter((t) => t !== tag) : [...s.diet, tag] })),
      togglePantry: (id) => set((s) => ({ pantry: s.pantry.includes(id) ? s.pantry.filter((x) => x !== id) : [...s.pantry, id] })),
      clearPantry: () => set({ pantry: [] }),
    }),
    {
      name: PROFILE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: persisted as unknown as (s: State) => Pick<State, 'level' | 'goal' | 'diet' | 'pantry' | 'saved'>,
      migrate: migrateProfile,
      merge: (persistedState, current) => ({
        ...current,
        ...migrateProfile(persistedState),
      }),
    },
  ),
)

export { defaultProfile }
export type { Profile as ProfileShape }
