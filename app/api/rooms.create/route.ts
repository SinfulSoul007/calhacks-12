import { NextResponse } from 'next/server'
import { CreateRoomRequestSchema } from '@/lib/types'
import { generateRoomCode } from '@/lib/room-code'
import { supabaseAdmin } from '@/lib/supabase.admin'

const TTL_MS = 30 * 60 * 1000

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
  const expireAt = new Date(Date.now() + TTL_MS).toISOString()
  const { error } = await supabaseAdmin.from('rooms').insert({
    room_id: candidate,
    status: 'lobby',
    topic: null,
    expire_at: expireAt,
    ai_active: false
  })

  if (error) {
    if (error.code === '23505') {
      return createRoom(attempt + 1)
    }
    throw error
  }

  return candidate
}
