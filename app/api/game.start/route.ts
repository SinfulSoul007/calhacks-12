import { NextResponse } from 'next/server'
import { GameStartRequestSchema, type RoomDoc } from '@/lib/types'
import { roomRef } from '@/lib/server/rooms'
import { randomTopic } from '@/lib/topics'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = GameStartRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const { roomId, uid } = parsed.data
    const ref = roomRef(roomId)

    const { topic, targetPlayerId } = await ref.firestore.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref)
      if (!snapshot.exists) {
        throw new Error('Room not found')
      }
      const data = snapshot.data() as RoomDoc
      const players = Object.keys(data.players ?? {})
      if (players.length < 2) {
        throw new Error('Need two players')
      }
      const allReady = players.every((playerId) => data.players[playerId]?.voiceReady)
      if (!allReady) {
        throw new Error('Voices not ready')
      }

      const topicValue = data.topic || randomTopic()
      const target =
        data.targetPlayerId ?? players[Math.floor(Math.random() * players.length)]

      tx.set(
        ref,
        {
          status: 'live',
          topic: topicValue,
          targetPlayerId: target,
          ai: {
            active: false
          }
        },
        { merge: true }
      )

      return { topic: topicValue, targetPlayerId: target }
    })

    return NextResponse.json({
      ok: true,
      topic,
      canActivateAI: targetPlayerId === uid
    })
  } catch (error) {
    console.error('game.start error', error)
    const message = (error as Error).message
    const status =
      message === 'Room not found' ? 404 : message === 'Need two players' || message === 'Voices not ready' ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
