import { NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { AnalysisRequestSchema, type RoomDoc } from '@/lib/types'
import { roomRef, timestampToIso, transcriptsCollection } from '@/lib/server/rooms'

const SUSPECT_WORDS = ['certainly', 'indeed', 'actually', 'fascinating', 'undoubtedly', 'precisely']

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const parsed = AnalysisRequestSchema.safeParse({ roomId })
    if (!parsed.success) {
      return NextResponse.json({ error: 'Missing roomId' }, { status: 400 })
    }

    const snapshot = await roomRef(parsed.data.roomId).get()
    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    const data = snapshot.data() as RoomDoc

    const aiActiveAt = data.ai?.aiActiveAt as Timestamp | undefined
    const aiOffAt = data.ai?.aiOffAt as Timestamp | undefined
    const guessAt = data.guess?.at as Timestamp | undefined

    const aiDurationSec = calcDuration(aiActiveAt, aiOffAt ?? guessAt)
    const detectionDelaySec = calcDuration(aiActiveAt, guessAt)

    const transcriptsSnap = await transcriptsCollection(parsed.data.roomId)
      .orderBy('ts', 'desc')
      .limit(50)
      .get()

    const tells = findWordTells(transcriptsSnap.docs.map((doc) => doc.data()?.text ?? ''))

    return NextResponse.json({
      timeline: {
        aiActiveAt: timestampToIso(aiActiveAt ?? null),
        aiOffAt: timestampToIso(aiOffAt ?? null),
        guessAt: timestampToIso(guessAt ?? null)
      },
      metrics: {
        aiDurationSec,
        detectionDelaySec,
        responseDelayHumanMs: 320,
        responseDelayAiMs: 1100,
        wordTells: tells
      }
    })
  } catch (error) {
    console.error('analysis error', error)
    return NextResponse.json({ error: 'Failed to build analysis' }, { status: 500 })
  }
}

function calcDuration(start?: Timestamp, end?: Timestamp) {
  if (!start || !end) return 0
  return Math.max(0, (end.toMillis() - start.toMillis()) / 1000)
}

function findWordTells(entries: string[]) {
  const counts: Record<string, number> = {}
  for (const text of entries) {
    const normalized = text.toLowerCase()
    for (const word of SUSPECT_WORDS) {
      if (normalized.includes(word)) {
        counts[word] = (counts[word] ?? 0) + 1
      }
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 3)
}
