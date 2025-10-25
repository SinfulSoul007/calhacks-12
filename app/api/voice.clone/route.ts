import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { VoiceCloneRequestSchema, type RoomDoc } from '@/lib/types'
import { cloneVoiceSample } from '@/lib/elevenlabs'
import { roomRef, voiceMapRef } from '@/lib/server/rooms'

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

    const ref = roomRef(roomId)
    const snapshot = await ref.get()
    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    const data = snapshot.data() as RoomDoc
    const player = data.players?.[uid]
    if (!player) {
      return NextResponse.json({ error: 'Player not in room' }, { status: 403 })
    }

    const voiceId = await cloneVoiceSample({
      roomId,
      uid,
      displayName: player.name,
      audioBuffer: buffer
    })

    await Promise.all([
      voiceMapRef(roomId).set(
        {
          voices: {
            [uid]: {
              voiceId,
              createdAt: FieldValue.serverTimestamp()
            }
          }
        },
        { merge: true }
      ),
      ref.update({
        [`players.${uid}.voiceReady`]: true
      })
    ])

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
