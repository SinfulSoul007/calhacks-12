"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function VoiceRecorder({ label = 'START RECORDING', seconds = 10 }: { label?: string; seconds?: number }) {
  const [recording, setRecording] = useState(false)
  const [timeLeft, setTimeLeft] = useState(seconds)

  function handleClick() {
    if (recording) return
    setRecording(true)
    setTimeLeft(seconds)
    const start = Date.now()
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000)
      const left = Math.max(0, seconds - elapsed)
      setTimeLeft(left)
      if (left === 0) {
        clearInterval(id)
        setRecording(false)
      }
    }, 250)
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleClick} disabled={recording}>{label}</Button>
      <div className="text-sm">⏱️ {timeLeft}s</div>
    </div>
  )
}

