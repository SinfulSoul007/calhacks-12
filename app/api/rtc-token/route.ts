import { NextResponse } from 'next/server'
import { RtcTokenRequestSchema } from '@/lib/types'
import { mintLiveKitToken } from '@/lib/livekit'
import { supabaseAdmin } from '@/lib/supabase.admin'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = RtcTokenRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const { roomId, uid, name } = parsed.data
    const { data: player, error } = await supabaseAdmin
      .from('players')
      .select('player_id')
      .eq('room_id', roomId)
      .eq('player_id', uid)
      .maybeSingle()
    if (error) throw error
    if (!player) {
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
