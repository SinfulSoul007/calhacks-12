import { NextResponse } from 'next/server'
import { RtcTokenRequestSchema, type RoomDoc } from '@/lib/types'
import { roomRef } from '@/lib/server/rooms'
import { mintLiveKitToken } from '@/lib/livekit'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = RtcTokenRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const { roomId, uid, name } = parsed.data
    const snapshot = await roomRef(roomId).get()
    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    const data = snapshot.data() as RoomDoc
    if (!data.players?.[uid]) {
      return NextResponse.json({ error: 'Player not in room' }, { status: 403 })
    }

    const tokenPayload = mintLiveKitToken({
      roomId,
      identity: uid,
      name,
      role: 'unknown'
    })

    return NextResponse.json({ token: tokenPayload.token, serverUrl: tokenPayload.serverUrl })
  } catch (error) {
    console.error('rtc-token error', error)
    return NextResponse.json({ error: 'Failed to mint token' }, { status: 500 })
  }
}
