"use client"
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRoomSubscription } from '@/lib/hooks/useRoomSubscription'
import type { RoomDoc } from '@/lib/types'

export default function ResultTimeoutDetector({ params }: { params: { roomId: string } }) {
  const { roomId } = params
  const { room } = useRoomSubscription(roomId)
  const detector = getDetectorName(room)

  return (
    <div className="centered-card">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-lg font-semibold">⏰ Target never flipped</CardHeader>
        <CardContent className="space-y-4">
          <div>The AI never took over, so {detector} wins by default.</div>
          <div className="text-sm text-muted-foreground">🏆 Detector victory.</div>
          <div className="flex gap-3">
            <Link href="/"><Button>Play again</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getDetectorName(room?: RoomDoc | null) {
  const players = room?.players ?? {}
  const guesser = room?.guess?.by
  if (guesser && players[guesser]) {
    return players[guesser].name
  }
  const ids = Object.keys(players)
  return players[ids[0] ?? '']?.name || 'Detector'
}
