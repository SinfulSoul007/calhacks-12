"use client"
import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase.client'
import type { RoomDoc } from '@/lib/types'

export function useRoomSubscription(roomId?: string) {
  const [room, setRoom] = useState<RoomDoc | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) return
    setLoading(true)
    const unsubscribe = onSnapshot(
      doc(db, 'rooms', roomId),
      (snapshot) => {
        if (snapshot.exists()) {
          setRoom(snapshot.data() as RoomDoc)
        } else {
          setRoom(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('useRoomSubscription error', error)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [roomId])

  return { room, loading }
}
