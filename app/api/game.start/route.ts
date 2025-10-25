import { NextResponse } from 'next/server'
import { GameStartRequestSchema } from '@/lib/types'
import { supabaseAdmin } from '@/lib/supabase.admin'
import { randomTopic } from '@/lib/topics'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = GameStartRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const { roomId, uid } = parsed.data

    const [{ data: roomData, error: roomError }, { data: players, error: playersError }] = await Promise.all([
      supabaseAdmin.from('rooms').select('room_id, topic').eq('room_id', roomId).maybeSingle(),
      supabaseAdmin.from('players').select('player_id, voice_ready').eq('room_id', roomId)
    ])

    if (roomError) throw roomError
    if (!roomData) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    if (playersError) throw playersError
    if (!players || players.length < 2) {
      return NextResponse.json({ error: 'Need two players' }, { status: 400 })
    }
    const allReady = players.every((player) => player.voice_ready)
    if (!allReady) {
      return NextResponse.json({ error: 'Voices not ready' }, { status: 400 })
    }

    const topic = roomData.topic ?? randomTopic()

    const { data: secret, error: secretError } = await supabaseAdmin
      .from('private.room_secrets')
      .select('target_player_id')
      .eq('room_id', roomId)
      .maybeSingle()
    if (secretError) throw secretError
    let targetPlayerId = secret?.target_player_id
    if (!targetPlayerId) {
      const shuffled = players[Math.floor(Math.random() * players.length)]
      targetPlayerId = shuffled.player_id
      const { error } = await supabaseAdmin.from('private.room_secrets').upsert({
        room_id: roomId,
        target_player_id: targetPlayerId
      })
      if (error) throw error
    }

    const { error: updateError } = await supabaseAdmin
      .from('rooms')
      .update({
        status: 'live',
        topic,
        ai_active: false,
        ai_active_at: null,
        ai_off_at: null
      })
      .eq('room_id', roomId)
    if (updateError) throw updateError

    return NextResponse.json({
      ok: true,
      topic,
      canActivateAI: targetPlayerId === uid
    })
  } catch (error) {
    console.error('game.start error', error)
    console.error('game.start error', error)
    return NextResponse.json({ error: 'Failed to start game' }, { status: 500 })
  }
}
