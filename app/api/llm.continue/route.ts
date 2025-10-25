import { NextResponse } from 'next/server'
import { LlmContinueRequestSchema } from '@/lib/types'
import { completeReply, generateSuggestions } from '@/lib/groq'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = LlmContinueRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const { context, styleHints } = parsed.data
    const [reply, suggestions] = await Promise.all([
      completeReply(context, styleHints ?? []),
      generateSuggestions(context)
    ])

    return NextResponse.json({
      reply,
      suggestions
    })
  } catch (error) {
    console.error('llm.continue error', error)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
