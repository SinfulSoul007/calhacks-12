import { customAlphabet } from 'nanoid'

const WORDS = [
  'GHOST',
  'ROBOT',
  'MIMIC',
  'SHADOW',
  'DECOY',
  'MASK',
  'PHANTOM',
  'SPECTER',
  'IMPOSTER',
  'CLONE'
]

const fourDigits = customAlphabet('0123456789', 4)

export function generateRoomCode() {
  const prefix = WORDS[Math.floor(Math.random() * WORDS.length)]
  return `${prefix}-${fourDigits()}`
}

export function normalizeRoomCode(input: string) {
  return input.replace(/\s+/g, '').toUpperCase()
}
