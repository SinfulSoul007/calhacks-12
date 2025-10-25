import { NextResponse } from 'next/server'
import { AiToggleRequestSchema } from '@/lib/types'
import { supabaseAdmin } from '@/lib/supabase.admin'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = AiToggleRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const { roomId, uid } = parsed.data
    const { data: secret, error } = await supabaseAdmin
      .from('private.room_secrets')
      .select('target_player_id')
      .eq('room_id', roomId)
      .maybeSingle()
    if (error) throw error
    if (!secret || secret.target_player_id !== uid) {
      return NextResponse.json({ error: 'Only the target can deactivate AI' }, { status: 403 })
    }
    const offAt = new Date().toISOString()
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('rooms')
      .update({ ai_active: false, ai_off_at: offAt })
      .eq('room_id', roomId)
      .eq('ai_active', true)
      .select('room_id')
      .maybeSingle()
    if (updateError) throw updateError
    if (!updated) {
      return NextResponse.json({ error: 'AI is not active' }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      aiOffAt: offAt
    })
  } catch (error) {
    console.error('ai.off error', error)
    return NextResponse.json({ error: 'Failed to deactivate AI' }, { status: 500 })
  }
}
