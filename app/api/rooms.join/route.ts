import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { JoinRoomRequestSchema, type RoomDoc } from '@/lib/types'
import { roomRef } from '@/lib/server/rooms'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = JoinRoomRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const { roomId, uid, displayName } = parsed.data
    const ref = roomRef(roomId)

    await ref.firestore.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref)
      if (!snapshot.exists) {
        throw new Error('Room not found')
      }
      const data = snapshot.data() as RoomDoc
      const players = data.players ?? {}
      const playerIds = Object.keys(players).filter((id) => !!players[id])
      const alreadyJoined = playerIds.includes(uid)

      if (!alreadyJoined && playerIds.length >= 2) {
        throw new Error('Room is full')
      }

      const nextStatus =
        data.status === 'lobby' && (alreadyJoined ? playerIds.length : playerIds.length + 1) >= 2
          ? 'setup'
          : data.status

      const update: Record<string, any> = {
        [`players.${uid}`]: {
          name: displayName,
          joinedAt: FieldValue.serverTimestamp(),
          voiceReady: players[uid]?.voiceReady ?? false
        }
      }
      if (nextStatus !== data.status) {
        update.status = nextStatus
      }

      tx.set(ref, update, { merge: true })
    })

    return NextResponse.json({
      ok: true,
      playerId: uid,
      name: displayName
    })
  } catch (error) {
    console.error('rooms.join error', error)
    const message = (error as Error).message
    const status = message === 'Room not found' ? 404 : message === 'Room is full' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
