import type { PlayerRecord, RoomDoc, RoomRecord } from '@/lib/types'

export function mapRoom(record: RoomRecord | null, players: PlayerRecord[]): RoomDoc | null {
  if (!record) return null
  const playersMap = players.reduce<RoomDoc['players']>((acc, row) => {
    acc[row.player_id] = {
      name: row.name,
      voiceReady: row.voice_ready,
      joinedAt: row.joined_at
    }
    return acc
  }, {})

  return {
    roomId: record.room_id,
    status: record.status,
    topic: record.topic,
    createdAt: record.created_at,
    expireAt: record.expire_at,
    ai: {
      active: record.ai_active,
      aiActiveAt: record.ai_active_at ?? undefined,
      aiOffAt: record.ai_off_at ?? undefined
    },
    guess: {
      by: record.guess_by ?? undefined,
      at: record.guess_at ?? undefined,
      outcome: record.outcome ?? undefined
    },
    players: playersMap
  }
}
