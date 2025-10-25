import { NextResponse } from 'next/server'
import { SttRequestSchema } from '@/lib/types'
import { transcribe } from '@/lib/groq'
import { supabaseAdmin } from '@/lib/supabase.admin'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = SttRequestSchema.safeParse(payload)
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
      .select('player_id')
      .eq('room_id', roomId)
      .eq('player_id', uid)
      .maybeSingle()
    if (playerError) throw playerError
    if (!player) {
      return NextResponse.json({ error: 'Player not in room' }, { status: 403 })
    }

    const transcription = await transcribe(buffer, 'mic_chunk.wav')

    const { error: insertError } = await supabaseAdmin.from('transcripts').insert({
      room_id: roomId,
      speaker_id: uid,
      text: transcription.text
    })
    if (insertError) throw insertError

    return NextResponse.json(transcription)
  } catch (error) {
    console.error('stt error', error)
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 })
  }
}

function decodeAudio(input: string) {
  const base64 = input.includes(',') ? input.split(',').pop()! : input
  return Buffer.from(base64, 'base64')
}
