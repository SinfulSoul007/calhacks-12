import { NextResponse } from 'next/server'
import { RoleRequestSchema } from '@/lib/types'
import { supabaseAdmin } from '@/lib/supabase.admin'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = RoleRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const { roomId, uid } = parsed.data
    const { data, error } = await supabaseAdmin
      .from('private.room_secrets')
      .select('target_player_id')
      .eq('room_id', roomId)
      .maybeSingle()
    if (error) throw error
    return NextResponse.json({ isTarget: data?.target_player_id === uid })
  } catch (error) {
    console.error('role lookup error', error)
    return NextResponse.json({ error: 'Failed to resolve role' }, { status: 500 })
  }
}
