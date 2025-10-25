"use client"
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRoomSubscription } from '@/lib/hooks/useRoomSubscription'
import type { RoomDoc } from '@/lib/types'

export default function ResultCorrect({ params }: { params: { roomId: string } }) {
  const { roomId } = params
  const { room } = useRoomSubscription(roomId)
  const detectorName = getDetectorName(room)

  return (
    <div className="centered-card">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-lg font-semibold">✅ Detector nailed it!</CardHeader>
        <CardContent className="space-y-4">
          <div>{detectorName} called out the AI takeover.</div>
          <div className="text-sm text-muted-foreground">🏆 {detectorName} wins the round.</div>
          <div className="flex gap-3 flex-wrap">
            <Link href={`/r/${roomId}/analysis`}><Button variant="secondary">View analysis</Button></Link>
            <Link href="/"><Button>Play again</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getDetectorName(room?: RoomDoc | null) {
  const players = room?.players ?? {}
  const target = room?.targetPlayerId
  const otherId = Object.keys(players).find((id) => id !== target)
  return players[otherId ?? '']?.name || 'Detector'
}
