import { NextResponse } from 'next/server'
import { CreateRoomRequestSchema } from '@/lib/types'
import { generateRoomCode } from '@/lib/room-code'
import { expireAtTimestamp, roomRef, serverTimestamp } from '@/lib/server/rooms'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = CreateRoomRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const roomId = await createRoom()
    if (!roomId) {
      return NextResponse.json({ error: 'Failed to allocate room' }, { status: 500 })
    }

    return NextResponse.json({
      roomId,
      inviteUrl: `/r/${roomId}`
    })
  } catch (error) {
    console.error('rooms.create error', error)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}

async function createRoom(attempt = 0): Promise<string | null> {
  if (attempt > 5) return null
  const candidate = generateRoomCode()
  const ref = roomRef(candidate)
  const existing = await ref.get()
  if (existing.exists) {
    return createRoom(attempt + 1)
  }

  await ref.set({
    status: 'lobby',
    createdAt: serverTimestamp(),
    expireAt: expireAtTimestamp(),
    topic: null,
    players: {},
    ai: {
      active: false
    }
  })

  return candidate
}
