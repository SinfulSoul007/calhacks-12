import { NextResponse } from 'next/server'
import { JoinRoomRequestSchema } from '@/lib/types'
import { supabaseAdmin } from '@/lib/supabase.admin'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = JoinRoomRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const { roomId, uid, displayName } = parsed.data

    const [{ data: roomData, error: roomError }, { data: playerRows, error: playersError }] = await Promise.all([
      supabaseAdmin.from('rooms').select('status').eq('room_id', roomId).maybeSingle(),
      supabaseAdmin.from('players').select('player_id, voice_ready').eq('room_id', roomId)
    ])

    if (roomError) throw roomError
    if (!roomData) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    if (playersError) throw playersError

    const players = playerRows ?? []
    const existingPlayer = players.find((row) => row.player_id === uid)
    if (!existingPlayer && players.length >= 2) {
      return NextResponse.json({ error: 'Room is full' }, { status: 403 })
    }

    if (existingPlayer) {
      const { error } = await supabaseAdmin
        .from('players')
        .update({ name: displayName })
        .eq('room_id', roomId)
        .eq('player_id', uid)
      if (error) throw error
    } else {
      const { error } = await supabaseAdmin.from('players').insert({
        room_id: roomId,
        player_id: uid,
        name: displayName,
        voice_ready: false
      })
      if (error) throw error
    }

    const nextCount = existingPlayer ? players.length : players.length + 1
    if (roomData.status === 'lobby' && nextCount >= 2) {
      const { error } = await supabaseAdmin
        .from('rooms')
        .update({ status: 'setup' })
        .eq('room_id', roomId)
      if (error) throw error
    }

    return NextResponse.json({
      ok: true,
      playerId: uid,
      name: displayName
    })
  } catch (error) {
    console.error('rooms.join error', error)
    const message = (error as Error).message
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
