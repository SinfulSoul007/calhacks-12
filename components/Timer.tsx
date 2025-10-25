"use client"
import { useEffect, useRef, useState } from 'react'

interface TimerProps {
  durationSec?: number
  isRunning?: boolean
  onElapsed?: () => void
}

export function Timer({ durationSec = 300, isRunning = true, onElapsed }: TimerProps) {
  const [remaining, setRemaining] = useState(durationSec)
  const notifiedRef = useRef(false)

  useEffect(() => {
    setRemaining(durationSec)
    notifiedRef.current = false
  }, [durationSec])

  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => {
      setRemaining((prev) => {
        const next = Math.max(0, prev - 1)
        if (next === 0 && !notifiedRef.current) {
          notifiedRef.current = true
          onElapsed?.()
        }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning, onElapsed])

  const minutes = Math.floor(remaining / 60)
  const seconds = (remaining % 60).toString().padStart(2, '0')
  return <span className="font-mono text-lg">{minutes}:{seconds}</span>
}
