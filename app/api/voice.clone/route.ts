import { NextResponse } from 'next/server'
import { VoiceCloneRequestSchema } from '@/lib/types'
import { cloneVoiceSample } from '@/lib/elevenlabs'
import { supabaseAdmin } from '@/lib/supabase.admin'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = VoiceCloneRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const { roomId, uid, audio } = parsed.data
    const buffer = decodeAudio(audio)
    if (!buffer.length) {
      return NextResponse.json({ error: 'Audio payload missing' }, { status: 400 })
    }
    const { data: player, error: playerError } = await supabaseAdmin
      .from('players')
      .select('name')
      .eq('room_id', roomId)
      .eq('player_id', uid)
      .maybeSingle()
    if (playerError) throw playerError
    if (!player) {
      return NextResponse.json({ error: 'Player not in room' }, { status: 403 })
    }

    const voiceId = await cloneVoiceSample({
      roomId,
      uid,
      displayName: player.name,
      audioBuffer: buffer
    })

    const [{ error: voiceError }, { error: updateError }] = await Promise.all([
      supabaseAdmin.from('private.voices').upsert({
        room_id: roomId,
        player_id: uid,
        voice_id: voiceId
      }),
      supabaseAdmin.from('players').update({ voice_ready: true }).eq('room_id', roomId).eq('player_id', uid)
    ])

    if (voiceError) throw voiceError
    if (updateError) throw updateError

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('voice.clone error', error)
    return NextResponse.json({ error: 'Failed to clone voice' }, { status: 500 })
  }
}

function decodeAudio(input: string) {
  const base64 = input.includes(',') ? input.split(',').pop()! : input
  return Buffer.from(base64, 'base64')
}
