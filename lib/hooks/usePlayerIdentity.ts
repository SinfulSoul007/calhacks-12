"use client"
import { useEffect, useState } from 'react'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 16)

export function usePlayerIdentity() {
  const [playerId, setPlayerId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const existing = window.localStorage.getItem('mimic-player-id')
    if (existing) {
      setPlayerId(existing)
      return
    }
    const next = nanoid()
    window.localStorage.setItem('mimic-player-id', next)
    setPlayerId(next)
  }, [])

  return playerId
}
