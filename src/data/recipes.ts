export interface Recipe {
  id: string
  name: string
  ing: string[]
}

const raw = [
  ['Peanut Butter Banana', ['banana', 'peanut', 'milk', 'protein']],
  ['Berry Blast', ['strawberry', 'blueberry', 'yogurt', 'honey', 'ice']],
  ['Green Machine', ['spinach', 'banana', 'avocado', 'protein', 'coconut']],
  ['Mocha Muscle', ['coffee', 'cacao', 'banana', 'milk', 'protein', 'oats']],
  ['Tropical Recovery', ['mango', 'pineapple', 'coconut', 'protein', 'yogurt']],
  ['Oat Power', ['oats', 'banana', 'peanut', 'honey', 'milk', 'protein']],
  ['Strawberry Shortcake', ['strawberry', 'oats', 'milk', 'honey', 'protein']],
  ['Choc Peanut Crunch', ['cacao', 'peanut', 'banana', 'milk', 'protein', 'ice']],
  ['Peach Cobbler', ['peach', 'oats', 'yogurt', 'honey', 'milk']],
  ['Blueberry Muffin', ['blueberry', 'oats', 'milk', 'honey', 'protein']],
  ['Avocado Cream', ['avocado', 'spinach', 'milk', 'honey', 'ice']],
  ['Mango Lassi', ['mango', 'yogurt', 'honey', 'milk', 'ice']],
  ['Iced Mocha', ['coffee', 'cacao', 'milk', 'ice', 'protein']],
]

export const RECIPES: Recipe[] = raw.map(([name, ing]) => ({
  id: (name as string).toLowerCase().replace(/[^a-z]+/g, '-'),
  name: name as string,
  ing: ing as string[],
}))
