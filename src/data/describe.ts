// Describe-your-shake tokeniser (spec section 5): keyword mapping only,
// no AI. Goal words, ingredient names, diet words and time words become
// chips the user can remove on Browse; anything unmapped stays free text.
//
// Deliberate limits (not silent filters):
//  - bare "protein" is NOT the 20g+ filter — every shake is a protein
//    shake, so only explicit phrases ("high protein", "30g protein") map it
//  - "peanut" is an ingredient chip (peanut butter), not a goal filter
import { INGREDIENTS, ING_BY_ID } from './ingredients'
import { FILTER_LABELS, GOAL_KEYS, DIET_KEYS, type FilterKey } from './browse'
import type { Level } from '../state/levels'

export type TokenKind = 'goal' | 'diet' | 'ingredient' | 'time' | 'text'

export interface Token {
  kind: TokenKind
  label: string
  chip?: FilterKey
  ing?: string
  level?: Level
  text?: string
}

export interface DescribeResult {
  tokens: Token[]
  chips: FilterKey[]
  ings: string[]
  levelHint: Level | null
  q: string
}

interface Phrase {
  text: string
  kind: TokenKind
  label: string
  chip?: FilterKey
  ing?: string
  level?: Level
}

const GOAL_PHRASES: Phrase[] = [
  { text: 'high protein', kind: 'goal', chip: 'p20', label: FILTER_LABELS.p20 },
  { text: 'green', kind: 'goal', chip: 'green', label: FILTER_LABELS.green },
  { text: 'post workout', kind: 'goal', chip: 'workout', label: FILTER_LABELS.workout },
  { text: 'postworkout', kind: 'goal', chip: 'workout', label: FILTER_LABELS.workout },
  { text: 'workout', kind: 'goal', chip: 'workout', label: FILTER_LABELS.workout },
  { text: 'under 300 kcal', kind: 'goal', chip: 'k300', label: FILTER_LABELS.k300 },
  { text: 'under 300', kind: 'goal', chip: 'k300', label: FILTER_LABELS.k300 },
  { text: 'low calorie', kind: 'goal', chip: 'k300', label: FILTER_LABELS.k300 },
  { text: 'light', kind: 'goal', chip: 'k300', label: FILTER_LABELS.k300 },
]

const DIET_PHRASES: Phrase[] = [
  { text: 'vegan', kind: 'diet', chip: 'vegan', label: FILTER_LABELS.vegan },
  { text: 'plant based', kind: 'diet', chip: 'vegan', label: FILTER_LABELS.vegan },
  { text: 'dairy free', kind: 'diet', chip: 'dairy', label: FILTER_LABELS.dairy },
  { text: 'no dairy', kind: 'diet', chip: 'dairy', label: FILTER_LABELS.dairy },
  { text: 'nut free', kind: 'diet', chip: 'nut', label: FILTER_LABELS.nut },
]

const TIME_PHRASES: Phrase[] = [
  { text: 'quick', kind: 'time', level: 0, label: 'Quick (2 min)' },
  { text: 'fast', kind: 'time', level: 0, label: 'Quick (2 min)' },
  { text: '2 min', kind: 'time', level: 0, label: 'Quick (2 min)' },
  { text: '2 minute', kind: 'time', level: 0, label: 'Quick (2 min)' },
  { text: 'two minute', kind: 'time', level: 0, label: 'Quick (2 min)' },
]

function cleanName(name: string): string {
  return name.toLowerCase().replace(/\([^)]*\)/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')
}

// Phrases over and above the ingredient list names.
const ING_ALIASES: [string, string][] = [
  ['whey protein', 'protein'],
  ['protein powder', 'protein'],
  ['whey', 'protein'],
  ['pea protein', 'pea-protein'],
  ['greek yogurt', 'yogurt'],
  ['yogurt', 'yogurt'],
  ['rolled oats', 'oats'],
  ['oats', 'oats'],
  ['oat', 'oats'],
  ['cocoa', 'cacao'],
  ['cacao', 'cacao'],
  ['peanut', 'peanut-butter'],
  ['strawberry', 'strawberry'],
  ['blueberries', 'blueberry'],
  ['blueberry', 'blueberry'],
  ['mangoes', 'mango'],
  ['mangos', 'mango'],
  ['peaches', 'peach'],
  ['avocados', 'avocado'],
  ['bananas', 'banana'],
  ['chia', 'chia'],
  ['coffee', 'coffee'],
  ['milk', 'milk'],
  ['ice', 'ice'],
  ['honey', 'honey'],
  // milestone-5 expansion: new names and the words people really type
  ['raspberry', 'raspberry'],
  ['cherry', 'cherry'],
  ['cherries', 'cherry'],
  ['collagen', 'collagen'],
  ['cottage cheese', 'cottage-cheese'],
  ['soy milk', 'soy-milk'],
  ['maple', 'maple-syrup'],
  ['maple syrup', 'maple-syrup'],
  ['medjool', 'dates'],
  ['medjool dates', 'dates'],
  ['dates', 'dates'],
  ['flaxseed', 'flax'],
  ['flax', 'flax'],
  ['almond milk', 'almond-milk'],
  ['coconut water', 'coconut-water'],
  ['coconut milk', 'coconut-milk'],
  ['coconut flakes', 'coconut-flakes'],
  ['pea protein powder', 'pea-protein'],
]

const ING_PHRASES: Phrase[] = (() => {
  const seen = new Set<string>()
  const out: Phrase[] = []
  const push = (text: string, ingId: string) => {
    if (!text || seen.has(text) || !ING_BY_ID[ingId]) return
    seen.add(text)
    out.push({ text, kind: 'ingredient', ing: ingId, label: ING_BY_ID[ingId].name })
  }
  INGREDIENTS.forEach((i) => push(cleanName(i.name), i.id))
  ING_ALIASES.forEach(([text, ingId]) => push(text, ingId))
  return out
})()

// longest phrase wins — try 3-word, then 2-word, then 1-word at each point
const PHRASES: Phrase[] = [...GOAL_PHRASES, ...DIET_PHRASES, ...TIME_PHRASES, ...ING_PHRASES].sort(
  (a, b) => b.text.split(' ').length - a.text.split(' ').length || b.text.length - a.text.length,
)

export function tokeniseDescribe(raw: string): DescribeResult {
  const tokens: Token[] = []
  const chips: FilterKey[] = []
  const ings: string[] = []
  let levelHint: Level | null = null

  let text = raw.toLowerCase().replace(/[^a-z0-9]+/g, ' ')
  if (raw.trim() === '') return { tokens, chips, ings, levelHint, q: '' }

  // "20g protein" / "30 g protein" -> the protein filter (explicit only)
  text = text.replace(/\b(\d{1,3})\s*g(?:rams)?\s+protein\b/g, (_whole, digits) => {
    tokens.push({ kind: 'goal', chip: 'p20', label: `${digits}g protein` })
    if (!chips.includes('p20')) chips.push('p20')
    return ' '
  })

  const used: boolean[] = new Array(text.length).fill(false)
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  for (const phrase of PHRASES) {
    const re = new RegExp(`(^| )${esc(phrase.text)}(?=$| )`, 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      const at = m[1] ? m.index + 1 : m.index
      const len = phrase.text.length
      let free = true
      for (let i = at; i < at + len; i++) {
        if (used[i]) {
          free = false
          break
        }
      }
      if (!free) continue
      for (let i = at; i < at + len; i++) used[i] = true
      tokens.push(phrase)
      if (phrase.chip && !chips.includes(phrase.chip)) chips.push(phrase.chip)
      if (phrase.ing && !ings.includes(phrase.ing)) ings.push(phrase.ing)
      if (phrase.level != null && levelHint == null) levelHint = phrase.level
    }
  }

  // everything still unmarked is free text
  const leftover = text
    .split('')
    .map((ch, i) => (used[i] ? ' ' : ch))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
  if (leftover) {
    tokens.push({ kind: 'text', label: `\u201c${leftover}\u201d`, text: leftover })
  }
  return { tokens, chips, ings, levelHint, q: leftover }
}

export function describeParams(text: string): URLSearchParams {
  const d = tokeniseDescribe(text)
  const goal = d.chips.filter((k) => (GOAL_KEYS as string[]).includes(k))
  const diet = d.chips.filter((k) => (DIET_KEYS as string[]).includes(k))
  const p = new URLSearchParams()
  if (goal.length) p.set('goal', goal.join(','))
  if (diet.length) p.set('diet', diet.join(','))
  if (d.ings.length) p.set('ing', d.ings.join(','))
  if (d.q) p.set('q', d.q)
  if (d.levelHint != null) p.set('level', String(d.levelHint))
  return p
}
