import { NextResponse } from 'next/server'
import { GuessRequestSchema, type GuessOutcome } from '@/lib/types'
import { supabaseAdmin } from '@/lib/supabase.admin'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = GuessRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const { roomId, uid } = parsed.data

    const [{ data: player, error: playerError }, { data: secret, error: secretError }] = await Promise.all([
      supabaseAdmin.from('players').select('player_id').eq('room_id', roomId).eq('player_id', uid).maybeSingle(),
      supabaseAdmin.from('private.room_secrets').select('target_player_id').eq('room_id', roomId).maybeSingle()
    ])
    if (playerError) throw playerError
    if (!player) {
      return NextResponse.json({ error: 'Player not in room' }, { status: 403 })
    }
    if (secretError) throw secretError
    if (secret?.target_player_id === uid) {
      return NextResponse.json({ error: 'Target cannot guess' }, { status: 400 })
    }

    const { data: roomData, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('ai_active_at, ai_off_at, guess_by')
      .eq('room_id', roomId)
      .maybeSingle()
    if (roomError) throw roomError
    if (!roomData) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    if (roomData.guess_by) {
      return NextResponse.json({ error: 'Guess already recorded' }, { status: 409 })
    }

    const guessAt = new Date().toISOString()
    const aiActiveDuringGuess = isWithinWindow(guessAt, roomData.ai_active_at, roomData.ai_off_at)
    const outcome: GuessOutcome = aiActiveDuringGuess ? 'DETECTOR_WINS' : 'TARGET_WINS'

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('rooms')
      .update({
        guess_by: uid,
        guess_at: guessAt,
        outcome,
        status: 'ended'
      })
      .eq('room_id', roomId)
      .is('guess_by', null)
      .select('ai_active_at, ai_off_at, guess_at')
      .maybeSingle()
    if (updateError) throw updateError
    if (!updated) {
      return NextResponse.json({ error: 'Guess already recorded' }, { status: 409 })
    }

    return NextResponse.json({
      outcome,
      timeline: {
        aiActiveAt: updated.ai_active_at,
        aiOffAt: updated.ai_off_at,
        guessAt: updated.guess_at ?? guessAt
      }
    })
  } catch (error) {
    console.error('guess error', error)
    return NextResponse.json({ error: 'Failed to submit guess' }, { status: 500 })
  }
}

function isWithinWindow(guessAt: string, aiActiveAt?: string | null, aiOffAt?: string | null) {
  if (!aiActiveAt) return false
  const guessMs = Date.parse(guessAt)
  const start = Date.parse(aiActiveAt)
  if (Number.isNaN(guessMs) || Number.isNaN(start)) return false
  const withinStart = guessMs >= start
  if (!withinStart) return false
  if (!aiOffAt) return true
  const end = Date.parse(aiOffAt)
  if (Number.isNaN(end)) return true
  return guessMs <= end
}
