// Single source of ingredient emoji. Decision override (2026-10): stickers
// are native colour emoji, not bundled SVG sprites. Never paste emoji
// characters in page code — always import from here. Decorative and
// aria-hidden at render time; the ingredient's name must be visible or
// conveyed by an aria-label wherever these appear.
export const STICKERS: Record<string, string> = {
  banana: '🍌',
  strawberry: '🍓',
  blueberry: '🫐',
  mango: '🥭',
  pineapple: '🍍',
  peach: '🍑',
  spinach: '🥬',
  avocado: '🥑',
  milk: '🥛',
  'oat-milk': '🥛',
  'almond-milk': '🥛',
  protein: '🥤',
  'pea-protein': '🥤',
  yogurt: '🥣',
  'peanut-butter': '🥜',
  'almond-butter': '🌰',
  'sunflower-butter': '🌻',
  honey: '🍯',
  oats: '🌾',
  chia: '🌱',
  cacao: '🍫',
  coffee: '☕',
  ice: '🧊',
  'coconut-water': '🥥',
  'coconut-milk': '🥥',
  'coconut-flakes': '🥥',
  kale: '🥬',
  cucumber: '🥒',
  raspberry: '🍇',
  kiwi: '🥝',
  cherry: '🍒',
  orange: '🍊',
  dates: '🌴',
  'soy-milk': '🥛',
  collagen: '🥤',
  'cottage-cheese': '🥣',
  'maple-syrup': '🍁',
  flax: '🌱',
  'pumpkin-seeds': '🌰',
  almond: '🌰',
}

export function stickerOf(id: string): string {
  return STICKERS[id] ?? '🥤'
}

export function stickerExists(id: string): boolean {
  return id in STICKERS
}
