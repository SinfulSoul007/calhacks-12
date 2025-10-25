"use client"
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DetectorGuessCardProps {
  disabled?: boolean
  onGuess: () => Promise<void> | void
}

export function DetectorGuessCard({ disabled, onGuess }: DetectorGuessCardProps) {
  const [confirming, setConfirming] = useState(false)

  async function handleGuess() {
    if (disabled || confirming) return
    setConfirming(true)
    try {
      await onGuess()
    } finally {
      setConfirming(false)
    }
  }

  return (
    <Card className="max-w-md h-full">
      <CardHeader className="text-lg font-semibold">Think it&apos;s AI?</CardHeader>
      <CardContent className="space-y-3">
        <Button variant="secondary" onClick={handleGuess} className="w-full" disabled={disabled || confirming}>
          I&apos;m calling AI now
        </Button>
        <p className="text-xs text-muted-foreground">
          ⚠️ You only get one guess. Wrong guess hands the round to the target.
        </p>
      </CardContent>
    </Card>
  )
}
