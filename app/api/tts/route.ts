import { NextResponse } from 'next/server'
import { TtsRequestSchema } from '@/lib/types'
import { voiceMapRef } from '@/lib/server/rooms'
import { synthesizeSpeech } from '@/lib/elevenlabs'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = TtsRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const { roomId, uid, text } = parsed.data
    const voiceDoc = await voiceMapRef(roomId).get()
    const voices = voiceDoc.data()?.voices ?? {}
    const assignment = voices[uid]
    if (!assignment?.voiceId) {
      return NextResponse.json({ error: 'Voice not ready' }, { status: 404 })
    }

    const buffer = await synthesizeSpeech({ voiceId: assignment.voiceId, text })
    return NextResponse.json({ audio: buffer.toString('base64') })
  } catch (error) {
    console.error('tts error', error)
    return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 500 })
  }
}
