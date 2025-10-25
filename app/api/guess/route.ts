import { NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { GuessRequestSchema, type GuessOutcome, type RoomDoc } from '@/lib/types'
import { roomRef, timestampToIso } from '@/lib/server/rooms'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = GuessRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const { roomId, uid } = parsed.data
    const ref = roomRef(roomId)

    const result = await ref.firestore.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref)
      if (!snapshot.exists) {
        throw new Error('Room not found')
      }
      const data = snapshot.data() as RoomDoc
      if (!data.players?.[uid]) {
        throw new Error('Player not in room')
      }
      if (data.targetPlayerId === uid) {
        throw new Error('Target cannot guess')
      }
      if (data.guess?.by) {
        throw new Error('Guess already recorded')
      }

      const guessAt = Timestamp.now()
      const aiActiveAt = data.ai?.aiActiveAt as Timestamp | undefined
      const aiOffAt = data.ai?.aiOffAt as Timestamp | undefined
      const aiStarted = !!aiActiveAt
      const aiActiveDuringGuess =
        aiStarted &&
        guessAt.toMillis() >= aiActiveAt!.toMillis() &&
        (!aiOffAt || guessAt.toMillis() <= aiOffAt.toMillis())

      const outcome: GuessOutcome = aiActiveDuringGuess ? 'DETECTOR_WINS' : 'TARGET_WINS'

      tx.update(ref, {
        'guess.by': uid,
        'guess.at': guessAt,
        'guess.outcome': outcome,
        status: 'ended'
      })

      return { outcome, guessAt, aiActiveAt, aiOffAt }
    })

    return NextResponse.json({
      outcome: result.outcome,
      timeline: {
        aiActiveAt: timestampToIso(result.aiActiveAt ?? null),
        aiOffAt: timestampToIso(result.aiOffAt ?? null),
        guessAt: timestampToIso(result.guessAt)
      }
    })
  } catch (error) {
    console.error('guess error', error)
    const message = (error as Error).message
    const status =
      message === 'Room not found'
        ? 404
        : message === 'Player not in room'
        ? 403
        : message === 'Target cannot guess'
        ? 400
        : message === 'Guess already recorded'
        ? 409
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
