import { NextResponse } from 'next/server'
import { AnalysisRequestSchema } from '@/lib/types'
import { supabaseAdmin } from '@/lib/supabase.admin'

const SUSPECT_WORDS = ['certainly', 'indeed', 'actually', 'fascinating', 'undoubtedly', 'precisely']

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const parsed = AnalysisRequestSchema.safeParse({ roomId })
    if (!parsed.success) {
      return NextResponse.json({ error: 'Missing roomId' }, { status: 400 })
    }

    const roomIdValue = parsed.data.roomId
    const [{ data: roomData, error: roomError }, { data: transcripts, error: transcriptError }] = await Promise.all([
      supabaseAdmin
        .from('rooms')
        .select('ai_active_at, ai_off_at, guess_at')
        .eq('room_id', roomIdValue)
        .maybeSingle(),
      supabaseAdmin
        .from('transcripts')
        .select('text')
        .eq('room_id', roomIdValue)
        .order('ts', { ascending: false })
        .limit(50)
    ])

    if (roomError) throw roomError
    if (!roomData) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    if (transcriptError) throw transcriptError

    const aiActiveAt = roomData.ai_active_at
    const aiOffAt = roomData.ai_off_at
    const guessAt = roomData.guess_at

    const aiDurationSec = calcDuration(aiActiveAt, aiOffAt ?? guessAt)
    const detectionDelaySec = calcDuration(aiActiveAt, guessAt)

    const tells = findWordTells((transcripts ?? []).map((row) => row.text ?? ''))

    return NextResponse.json({
      timeline: {
        aiActiveAt,
        aiOffAt,
        guessAt
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

function calcDuration(start?: string | null, end?: string | null) {
  if (!start || !end) return 0
  const startMs = Date.parse(start)
  const endMs = Date.parse(end)
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return 0
  return Math.max(0, (endMs - startMs) / 1000)
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
