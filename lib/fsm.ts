import type { RoomStatus } from './types'

const TRANSITIONS: Record<RoomStatus, RoomStatus[]> = {
  lobby: ['setup', 'ended'],
  setup: ['live', 'ended'],
  live: ['ended'],
  ended: []
}

export function canTransition(from: RoomStatus, to: RoomStatus) {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function assertTransition(from: RoomStatus, to: RoomStatus) {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid room transition from ${from} to ${to}`)
  }
}
