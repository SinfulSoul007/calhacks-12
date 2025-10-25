"use client"
import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase.client'
import type { TranscriptEntry } from '@/lib/types'

export function useTranscripts(roomId?: string, size = 20) {
  const [entries, setEntries] = useState<TranscriptEntry[]>([])

  useEffect(() => {
    if (!roomId) return
    const q = query(collection(db, 'rooms', roomId, 'transcripts'), orderBy('ts', 'desc'), limit(size))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<TranscriptEntry, 'id'>)
          }))
          .reverse()
        setEntries(next)
      },
      (error) => {
        console.error('useTranscripts error', error)
      }
    )
    return () => unsubscribe()
  }, [roomId, size])

  return entries
}
