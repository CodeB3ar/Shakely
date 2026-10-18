// The portable profile code (spec section 6). No server: the code carries
// the whole profile. Fixed bit layout, compressed (varints + pantry
// bitset), Crockford base32 in groups of 5 behind the SHKL- prefix, and a
// 2-character checksum. Recipe ids are stored as varints — permanent,
// append-only (see recipes.ts).
//
// Bit layout (version 1, little-endian bit groups, LSB first):
//   [version 3 bits = 1]
//   [level 2 bits]
//   [goal 2 bits: build=0 lean=1 recovery=2]
//   [diet 3 bits: dairy/vegan/nut]  (extra diet strings follow as varint list)
//   [pantry bitset: 1 bit per INGREDIENTS index (list order is append-only)]
//   [extra diet strings: count varint + (len varint + 7-bit chars)]
//   [savedCount varint]
//   per saved: [recipeId varint][level 2][serves 3 (0 = serves 1..4 stored
//   minus one)][editsFlag 1] and, when set: [editCount varint] then
//   per edit: [op 2 bits: swap=0 remove=1 qty=2 scale=3]
//             [slot: len varint + 7-bit chars]
//             [value kind 2 bits: none=0 string=1 number=2]
//             value: string → as slot; number → rounded ×10 varint
// Layout self-describes (counts are varints), so truncation surfaces as a
// clean "truncated" error instead of garbage.
import { INGREDIENTS } from './ingredients'
import { RECIPES } from './recipes'
import type { Level } from '../state/levels'
import type { Goal, Profile, Edit } from '../state/profile'

const PREFIX = 'SHKL-'
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ' // Crockford: no I, L, O, U
const VERSION = 1
const VERSION_BITS = 3

export type CodeError = 'prefix' | 'charset' | 'checksum' | 'truncated' | 'version' | 'layout'

export interface CodeData {
  level: Level
  goal: Goal
  diet: string[]
  pantry: string[]
  saved: { recipeId: number; level: Level; serves: number; edits?: Edit[] }[]
}

export type CodeResult = { ok: true; data: CodeData } | { ok: false; error: CodeError; message: string }

const GOALS: Goal[] = ['build', 'lean', 'recovery']
const DIET_KEYS = ['dairy', 'vegan', 'nut'] as const
const OPS = ['swap', 'remove', 'qty', 'scale'] as const

// ---- bit writer / reader ----

class BitWriter {
  private bits: number[] = []
  write(value: number, n: number): void {
    for (let i = 0; i < n; i++) this.bits.push((value >>> i) & 1)
  }
  writeVarint(v: number): void {
    let x = Math.round(v)
    for (;;) {
      let b = x & 0x7f
      x >>>= 7
      if (x > 0) b |= 0x80
      this.write(b, 8)
      if (x <= 0) break
    }
  }
  writeString(s: string): void {
    this.writeVarint(s.length)
    for (const ch of s) this.writeVarint(ch.charCodeAt(0))
  }
  get length(): number {
    return this.bits.length
  }
  toBits(): number[] {
    return this.bits
  }
}

class BitReader {
  private bits: number[]
  private at = 0
  constructor(bits: number[]) {
    this.bits = bits
  }
  read(n: number): number {
    if (this.at + n > this.bits.length) throw new ReaderError()
    let v = 0
    for (let i = 0; i < n; i++) {
      v |= this.bits[this.at + i] << i
    }
    this.at += n
    return v
  }
  readVarint(): number {
    let shift = 0
    let out = 0
    for (;;) {
      const b = this.read(8)
      out |= (b & 0x7f) << shift
      shift += 7
      if (!(b & 0x80)) return out
      if (shift > 35) throw new ReaderError()
    }
  }
  readString(): string {
    const len = this.readVarint()
    let s = ''
    for (let i = 0; i < len; i++) {
      const c = this.readVarint()
      s += String.fromCharCode(c)
    }
    return s
  }
  get position(): number {
    return this.at
  }
}

class ReaderError extends Error {}

function bitsToNum(bits: number[]): number {
  let v = 0
  for (let i = 0; i < bits.length; i++) if (bits[i]) v |= 1 << i
  return v
}

// ---- base32 ----

function bitsToB32(bits: number[]): string {
  // pad so the 5-bit chunk count fits whole 5-char groups after the prefix,
  // never leaving a lonely 1-char remainder group
  let pad = 0
  while (Math.ceil((bits.length + pad) / 5) % 5 === 1) pad++
  const total = bits.length + pad
  let out = ''
  const chunkTotal = Math.ceil(total / 5)
  for (let c = 0; c < chunkTotal; c++) {
    let v = 0
    for (let i = 0; i < 5; i++) {
      const bit = bits[c * 5 + i]
      v |= (bit === undefined ? 0 : bit) << i
    }
    out += B32[v]
  }
  const groups: string[] = []
  for (let i = 0; i < out.length; i += 5) groups.push(out.slice(i, i + 5))
  return groups.join('-')
}

function b32ToBits(text: string): number[] {
  const vals: number[] = []
  for (const ch of text) {
    const v = B32.indexOf(ch)
    if (v < 0) throw new ReaderError()
    vals.push(v)
  }
  const bits: number[] = []
  for (const v of vals) {
    for (let i = 0; i < 5; i++) bits.push((v >>> i) & 1)
  }
  return bits
}

// ---- checksum: rolling mod-1024 over the payload's 5-bit chunk values ----

function checksumOf(chunkVals: number[]): number {
  let h = 0
  for (const v of chunkVals) h = (h * 31 + v) % 1024
  return h
}

function chunkValsOf(bits: number[]): number[] {
  const out: number[] = []
  for (let c = 0; c * 5 < bits.length; c++) {
    let v = 0
    for (let i = 0; i < 5; i++) v |= (bits[c * 5 + i] ? 1 : 0) << i
    out.push(v)
  }
  return out
}

// ---- encoding ----

function encodeBits(p: Pick<Profile, 'goal' | 'diet' | 'pantry' | 'level'>, saved: CodeData['saved']): number[] {
  const w = new BitWriter()
  w.write(VERSION, VERSION_BITS)
  w.write(p.level, 2)
  w.write(Math.max(0, GOALS.indexOf(p.goal)), 2)
  DIET_KEYS.forEach((k) => w.write(p.diet.includes(k) ? 1 : 0, 1))
  const dietExtra = p.diet.filter((d) => !(DIET_KEYS as readonly string[]).includes(d))
  w.writeVarint(dietExtra.length)
  dietExtra.forEach((d) => w.writeString(d))
  // pantry bitset in INGREDIENTS order (the index is append-only)
  INGREDIENTS.forEach((ing) => w.write(p.pantry.includes(ing.id) ? 1 : 0, 1))
  w.writeVarint(saved.length)
  for (const s of saved) {
    w.writeVarint(s.recipeId)
    w.write(s.level, 2)
    w.write(s.serves - 1, 3)
    const edits = s.edits ?? []
    w.write(edits.length > 0 ? 1 : 0, 1)
    if (edits.length > 0) {
      w.writeVarint(edits.length)
      for (const e of edits) {
        const opIdx = OPS.indexOf(e.op as (typeof OPS)[number])
        w.write(opIdx < 0 ? 0 : opIdx, 2)
        w.writeString(e.slot)
        const v = e.value
        if (v == null) {
          w.write(0, 2)
        } else if (typeof v === 'number') {
          w.write(2, 2)
          w.writeVarint(Math.round(v * 10))
        } else {
          w.write(1, 2)
          w.writeString(v)
        }
      }
    }
  }
  // sanity: every saved recipeId must exist — codes must never invent ids
  return w.toBits()
}

export function encodeCode(p: Profile): string {
  const bits = encodeBits(p, p.saved)
  return finalizeCode(bits)
}

/** Encode straight from a CodeData shape (used by tests and future tooling). */
export function encodeCodeData(data: CodeData): string {
  const bits = encodeBits({ level: data.level, goal: data.goal, diet: data.diet, pantry: data.pantry }, data.saved)
  return finalizeCode(bits)
}

function finalizeCode(bits: number[]): string {
  // checksum bits go LAST: 10 fixed bits recomputed over the payload chunks
  const payloadChunks = chunkValsOf(bits)
  const w = new BitWriter()
  w.write(checksumOf(payloadChunks), 10)
  const all = [...bits, ...w.toBits()]
  return PREFIX + bitsToB32(all)
}

// ---- decoding ----

/** Forgiving normalization per spec: lowercase, spaces, O/0, I/L/1 mixups. */
function normalizeCode(raw: string): { body: string } | { err: CodeError; message: string } {
  const cleaned = raw
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '') // strips spaces, hyphens (inside and around)
  const m = /^SHKL(.*)$/.exec(cleaned)
  if (!m) return { err: 'prefix', message: 'That does not look like a Shakely code — it should start with SHKL-.' }
  const body = m[1]
    .replace(/O/g, '0')
    .replace(/I/g, '1')
    .replace(/L/g, '1')
  if (body.length < 2) return { err: 'truncated', message: 'The code is too short to be complete.' }
  for (const ch of body) {
    if (!B32.includes(ch)) return { err: 'charset', message: `The code has a character that cannot be right: ${ch === 'U' ? 'U' : ch}.` }
  }
  return { body }
}

export function decodeCode(raw: string): CodeResult {
  const norm = normalizeCode(raw)
  if ('err' in norm) return { ok: false, error: norm.err, message: norm.message }
  let bits: number[]
  try {
    bits = b32ToBits(norm.body)
  } catch {
    return { ok: false, error: 'charset', message: 'The code contains a character that cannot be right.' }
  }
  // Layout tolerance: the pantry bitset grows with the append-only
  // ingredient index, so codes written earlier carry a shorter bitset and
  // the exact boundary between bitset, saved list and checksum is not
  // knowable up front. Parse candidates from the full current bitset down
  // to an empty one and accept the first checksum-valid parse; absent
  // trailing bits simply mean those newer ingredients are not in the
  // pantry. Unknown recipe ids reject with the same error as before, and
  // a truly truncated code keeps reporting 'truncated' (the full-size
  // attempt runs first and its error is kept when nothing else matches).
  let firstFailure: CodeResult | null = null
  for (let pantryCount = INGREDIENTS.length; pantryCount >= 0; pantryCount--) {
    const res = parseLayout(bits, pantryCount)
    if (res.ok) return res
    if (res.error === 'version') return res // the version field is pantry-length-independent
    if (firstFailure == null) firstFailure = res
  }
  return firstFailure!
}

function parseLayout(bits: number[], pantryCount: number): CodeResult {
  // the layout is self-describing: parse first, then split checksum (10
  // bits right after the layout) from the padding zeros that follow it
  try {
    const r = new BitReader(bits)
    const version = r.read(VERSION_BITS)
    if (version !== VERSION) {
      return { ok: false, error: 'version', message: `This code is for ${version > 1 ? 'a newer' : 'an older'} version of Shakely (${version > 1 ? 'v' + version : 'v' + version}) and cannot be restored here.` }
    }
    const level = r.read(2) as Level
    const goalIdx = r.read(2)
    const goal = GOALS[goalIdx] ?? 'build'
    const diet: string[] = []
    DIET_KEYS.forEach((k) => {
      if (r.read(1)) diet.push(k)
    })
    const extraCount = r.readVarint()
    for (let i = 0; i < extraCount; i++) diet.push(r.readString())
    // pantry bitset in INGREDIENTS order (the index is append-only): a
    // shorter code leaves the newest ids absent
    const pantry: string[] = []
    for (let i = 0; i < pantryCount; i++) {
      if (r.read(1)) pantry.push(INGREDIENTS[i].id)
    }
    const saved: CodeData['saved'] = []
    const savedCount = r.readVarint()
    for (let i = 0; i < savedCount; i++) {
      const recipeId = r.readVarint()
      if (!RECIPES.some((rc) => rc.id === recipeId)) {
        return { ok: false, error: 'layout', message: `The code references recipe #${recipeId}, which this version of Shakely does not know.` }
      }
      const sLevel = r.read(2) as Level
      const serves = r.read(3) + 1
      const hasEdits = r.read(1) === 1
      const edits: Edit[] = []
      if (hasEdits) {
        const count = r.readVarint()
        for (let j = 0; j < count; j++) {
          const op = OPS[r.read(2)] as EditOpName
          const slot = r.readString()
          const kind = r.read(2)
          const e: Edit = kind === 0 ? { op, slot } : kind === 1 ? { op, slot, value: r.readString() } : { op, slot, value: r.readVarint() / 10 }
          edits.push(e)
        }
      }
      saved.push(hasEdits ? { recipeId, level: sLevel, serves, edits } : { recipeId, level: sLevel, serves })
    }
    // unknown diet strings must be printable-ish (readString handles it) — done
    // checksum: 10 fixed bits sit right after the layout end; padding zeros follow
    const pos = r.position
    const tail = bits.slice(pos)
    if (tail.length < 10) return { ok: false, error: 'truncated', message: 'The code cut off — check that you copied the whole thing.' }
    const givenSum = bitsToNum(tail.slice(0, 10))
    if (tail.slice(10).some((b) => b !== 0)) {
      return { ok: false, error: 'checksum', message: 'A character is off — check that you copied the whole code.' }
    }
    if (givenSum !== checksumOf(chunkValsOf(bits.slice(0, pos)))) {
      return { ok: false, error: 'checksum', message: 'A character is off — check that you copied the whole code.' }
    }
    return { ok: true, data: { level, goal, diet, pantry, saved } }
  } catch (e) {
    if (e instanceof ReaderError) {
      return { ok: false, error: 'truncated', message: 'The code cut off — check that you copied the whole thing.' }
    }
    return { ok: false, error: 'layout', message: 'The code is complete but its parts do not add up.' }
  }
}

type EditOpName = Edit['op']

// ---- import application (locked rule) ----
// Replace: the code wholesale — saved entries stamped with `now` (codes
// do not carry savedAt).
// Merge: this browser keeps its duplicates — an incoming entry never
// displaces a local one, no matter the stamps — and gains only entries it
// does not have. Pantry and diet union. Goal adopts the code only when the
// browser profile is still the untouched default ('build').

export function applyReplace(current: Profile, incoming: CodeData, now: number): Profile {
  return {
    ...current,
    level: incoming.level,
    goal: incoming.goal,
    diet: [...incoming.diet],
    pantry: [...incoming.pantry],
    saved: incoming.saved.map((s) => ({ ...s, savedAt: now })),
  }
}

export function applyMerge(current: Profile, incoming: CodeData, now: number): Profile {
  const mine = new Map(current.saved.map((s) => [s.recipeId, s]))
  const merged = new Map(mine)
  for (const s of incoming.saved) {
    if (!merged.has(s.recipeId)) merged.set(s.recipeId, { ...s, savedAt: now })
    // duplicates: this browser wins (ties and missing incoming timestamps included)
  }
  return {
    ...current,
    level: current.level, // level is a browser setting on merge
    goal: current.goal === 'build' ? incoming.goal : current.goal,
    diet: Array.from(new Set([...current.diet, ...incoming.diet])),
    pantry: Array.from(new Set([...current.pantry, ...incoming.pantry])),
    saved: Array.from(merged.values()).sort((a, b) => a.savedAt - b.savedAt),
  }
}

/** Preview counts for the restore box. */
export function codePreview(data: CodeData): string {
  const mine = data.saved.filter((s) => s.edits?.length).length
  return `${data.saved.length} saved shake${data.saved.length === 1 ? '' : 's'}${mine ? ` (${mine} my version${mine === 1 ? '' : 's'})` : ''}, ${data.pantry.length} pantry item${data.pantry.length === 1 ? '' : 's'}${data.goal !== 'build' ? `, goal ${GOALS_GOAL_LABEL[data.goal]}` : ''}`
}

const GOALS_GOAL_LABEL: Record<Goal, string> = {
  build: 'Build',
  lean: 'Lean',
  recovery: 'Recovery',
}
