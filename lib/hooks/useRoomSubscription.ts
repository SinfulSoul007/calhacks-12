"use client"
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase.client'
import type { PlayerRecord, RoomDoc, RoomRecord } from '@/lib/types'
import { mapRoom } from '@/lib/supabase.mapper'

export function useRoomSubscription(roomId?: string) {
  const [roomRecord, setRoomRecord] = useState<RoomRecord | null>(null)
  const [playerRecords, setPlayerRecords] = useState<PlayerRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) return
    let active = true
    setLoading(true)
    ;(async () => {
      try {
        const [{ data: roomData, error: roomError }, { data: playerData, error: playerError }] = await Promise.all([
          supabase.from('rooms').select('*').eq('room_id', roomId).maybeSingle(),
          supabase.from('players').select('*').eq('room_id', roomId)
        ])
        if (roomError) throw roomError
        if (playerError) throw playerError
        if (!active) return
        setRoomRecord(roomData ?? null)
        setPlayerRecords(playerData ?? [])
      } catch (error) {
        console.error('useRoomSubscription fetch error', error)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [roomId])

  useEffect(() => {
    if (!roomId) return
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setRoomRecord(null)
        } else {
          setRoomRecord(payload.new as RoomRecord)
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, (payload) => {
        setPlayerRecords((current) => {
          const next = [...current]
          const record = payload.new as PlayerRecord
          switch (payload.eventType) {
            case 'INSERT':
              if (!next.find((row) => row.player_id === record.player_id)) {
                next.push(record)
              }
              break
            case 'UPDATE':
              return next.map((row) => (row.player_id === record.player_id ? record : row))
            case 'DELETE':
              return next.filter((row) => row.player_id !== (payload.old as PlayerRecord).player_id)
          }
          return next
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  const room = useMemo<RoomDoc | null>(() => mapRoom(roomRecord, playerRecords), [roomRecord, playerRecords])

  return { room, loading }
}
