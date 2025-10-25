"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase.client'
import type { TranscriptEntry, TranscriptRecord } from '@/lib/types'

export function useTranscripts(roomId?: string, size = 20) {
  const [entries, setEntries] = useState<TranscriptEntry[]>([])

  useEffect(() => {
    if (!roomId) return
    let active = true
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('transcripts')
          .select('*')
          .eq('room_id', roomId)
          .order('ts', { ascending: true })
          .limit(size)
        if (error) throw error
        if (!active) return
        setEntries((data ?? []).map(mapTranscript))
      } catch (error) {
        console.error('useTranscripts fetch error', error)
      }
    })()
    return () => {
      active = false
    }
  }, [roomId, size])

  useEffect(() => {
    if (!roomId) return
    const channel = supabase
      .channel(`transcripts-${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transcripts', filter: `room_id=eq.${roomId}` }, (payload) => {
        const record = payload.new as TranscriptRecord
        setEntries((current) => {
          const next = [...current, mapTranscript(record)]
          if (next.length > size) {
            return next.slice(next.length - size)
          }
          return next
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, size])

  return entries
}

function mapTranscript(record: TranscriptRecord): TranscriptEntry {
  return {
    id: record.id,
    speakerId: record.speaker_id,
    text: record.text,
    ts: record.ts
  }
}
