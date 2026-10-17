export interface Ingredient {
  id: string
  name: string
  emoji: string
  protein: number
  kcal: number
}

export const INGREDIENTS: Ingredient[] = [
  { id: 'banana', name: 'Banana', emoji: '🍌', protein: 1, kcal: 105 },
  { id: 'strawberry', name: 'Strawberries', emoji: '🍓', protein: 1, kcal: 50 },
  { id: 'blueberry', name: 'Blueberries', emoji: '🫐', protein: 1, kcal: 85 },
  { id: 'spinach', name: 'Spinach', emoji: '🥬', protein: 1, kcal: 10 },
  { id: 'milk', name: 'Milk', emoji: '🥛', protein: 8, kcal: 120 },
  { id: 'peanut', name: 'Peanut butter', emoji: '🥜', protein: 8, kcal: 190 },
  { id: 'honey', name: 'Honey', emoji: '🍯', protein: 0, kcal: 60 },
  { id: 'avocado', name: 'Avocado', emoji: '🥑', protein: 2, kcal: 120 },
  { id: 'oats', name: 'Oats', emoji: '🌾', protein: 5, kcal: 150 },
  { id: 'protein', name: 'Protein powder', emoji: '🥤', protein: 24, kcal: 120 },
  { id: 'coffee', name: 'Coffee', emoji: '☕', protein: 0, kcal: 5 },
  { id: 'mango', name: 'Mango', emoji: '🥭', protein: 1, kcal: 100 },
  { id: 'cacao', name: 'Cacao', emoji: '🍫', protein: 2, kcal: 50 },
  { id: 'yogurt', name: 'Greek yogurt', emoji: '🥣', protein: 10, kcal: 100 },
  { id: 'pineapple', name: 'Pineapple', emoji: '🍍', protein: 1, kcal: 80 },
  { id: 'peach', name: 'Peach', emoji: '🍑', protein: 1, kcal: 60 },
  { id: 'coconut', name: 'Coconut', emoji: '🥥', protein: 1, kcal: 90 },
  { id: 'ice', name: 'Ice', emoji: '🧊', protein: 0, kcal: 0 },
]

export const ING_BY_ID: Record<string, Ingredient> = Object.fromEntries(
  INGREDIENTS.map((i) => [i.id, i]),
)
