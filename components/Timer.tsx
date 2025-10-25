"use client"
import * as React from 'react'

export function Timer({ start = 0 }: { start?: number }) {
  const [seconds, setSeconds] = React.useState(start)
  React.useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const mm = Math.floor(seconds / 60)
  const ss = (seconds % 60).toString().padStart(2, '0')
  return <span className="font-mono">{mm}:{ss}</span>
}

