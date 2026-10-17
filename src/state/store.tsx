import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Level = 0 | 1 | 2

export const LEVELS: { label: string; time: string }[] = [
  { label: 'Quick', time: '2m' },
  { label: 'Loaded', time: '5m' },
  { label: 'Athlete', time: '8m' },
]

interface BlendState {
  level: Level
  chips: Record<string, boolean>
  pantry: string[]
  saved: Record<string, true> | Record<string, string>
  setLevel: (l: Level) => void
  toggleChip: (c: string) => void
  clearChips: () => void
  toggleSave: (id: string) => void
}

export type FilterKey = 'p20' | 'k300' | 'green' | 'dairy' | 'vegan' | 'nut' | 'workout' | 'peanut'

// Home chips + Browse sidebar filters, one shared source of truth
export const GOAL_FILTERS: { id: FilterKey; label: string }[] = [
  { id: 'p20', label: '20g protein' },
  { id: 'k300', label: 'Under 300 kcal' },
  { id: 'green', label: 'Green' },
]

export const DIET_FILTERS: { id: FilterKey; label: string }[] = [
  { id: 'dairy', label: 'Dairy-free' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'nut', label: 'Nut-free' },
]

export const HOME_FILTERS: FilterKey[] = ['p20', 'k300', 'green', 'dairy', 'workout', 'peanut']

export const FILTER_LABELS: Record<FilterKey, string> = {
  p20: '20g protein',
  k300: 'Under 300 kcal',
  green: 'Green',
  dairy: 'Dairy-free',
  vegan: 'Vegan',
  nut: 'Nut-free',
  workout: 'Post-workout',
  peanut: 'Peanut butter',
}

export function migrateLegacyPersistence(): void {
  if (typeof window === 'undefined') return
  if (window.localStorage.getItem('shakely-v1')) return
  const legacy = window.localStorage.getItem('blendr-v1')
  if (!legacy) return
  window.localStorage.removeItem('blendr-v1')
  try {
    window.localStorage.setItem('shakely-v1', legacy)
  } catch { /* storage unavailable — legacy key is removed either way */ }
}
migrateLegacyPersistence()

export const useBlend = create<BlendState>()(
  persist(
    (set) => ({
      level: 0,
      chips: {},
      pantry: [],
      saved: {},
      setLevel: (level) => set({ level }),
      toggleChip: (c) => set((s) => ({ chips: { ...s.chips, [c]: !s.chips[c] } })),
      clearChips: () => set({ chips: {} }),
      toggleSave: (id) =>
        set((s) => {
          const next = { ...s.saved }
          if (next[id]) delete next[id]
          else next[id] = new Date().toISOString()
          return { saved: next }
        }),
    }),
    { name: 'shakely-v1' },
  ),
)
