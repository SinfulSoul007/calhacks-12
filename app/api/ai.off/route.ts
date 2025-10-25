import { NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { AiToggleRequestSchema, type RoomDoc } from '@/lib/types'
import { roomRef, timestampToIso } from '@/lib/server/rooms'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = AiToggleRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const { roomId, uid } = parsed.data
    const ref = roomRef(roomId)
    const offAt = Timestamp.now()

    await ref.firestore.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref)
      if (!snapshot.exists) {
        throw new Error('Room not found')
      }
      const data = snapshot.data() as RoomDoc
      if (data.targetPlayerId !== uid) {
        throw new Error('Only the target can deactivate AI')
      }
      if (!data.ai?.active) {
        throw new Error('AI is not active')
      }

      tx.update(ref, {
        'ai.active': false,
        'ai.aiOffAt': offAt
      })
    })

    return NextResponse.json({
      ok: true,
      aiOffAt: timestampToIso(offAt)
    })
  } catch (error) {
    console.error('ai.off error', error)
    const message = (error as Error).message
    const status = message === 'Room not found' ? 404 : message === 'Only the target can deactivate AI' ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
