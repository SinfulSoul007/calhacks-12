import { NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { SttRequestSchema, type RoomDoc } from '@/lib/types'
import { transcribe } from '@/lib/groq'
import { roomRef, transcriptsCollection } from '@/lib/server/rooms'

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

    const ref = roomRef(roomId)
    const snapshot = await ref.get()
    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    const data = snapshot.data() as RoomDoc
    if (!data.players?.[uid]) {
      return NextResponse.json({ error: 'Player not in room' }, { status: 403 })
    }

    const transcription = await transcribe(buffer, 'mic_chunk.wav')

    await transcriptsCollection(roomId).add({
      speakerId: uid,
      text: transcription.text,
      ts: Timestamp.now()
    })

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
