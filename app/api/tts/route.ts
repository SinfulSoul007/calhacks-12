import { NextResponse } from 'next/server'
import { TtsRequestSchema } from '@/lib/types'
import { supabaseAdmin } from '@/lib/supabase.admin'
import { synthesizeSpeech } from '@/lib/elevenlabs'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = TtsRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const { roomId, uid, text } = parsed.data
    const { data: voice, error } = await supabaseAdmin
      .from('private.voices')
      .select('voice_id')
      .eq('room_id', roomId)
      .eq('player_id', uid)
      .maybeSingle()
    if (error) throw error
    if (!voice) {
      return NextResponse.json({ error: 'Voice not ready' }, { status: 404 })
    }

    const buffer = await synthesizeSpeech({ voiceId: voice.voice_id, text })
    return NextResponse.json({ audio: buffer.toString('base64') })
  } catch (error) {
    console.error('tts error', error)
    return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 500 })
  }
}
