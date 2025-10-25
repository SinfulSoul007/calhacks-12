"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useRoomSubscription } from '@/lib/hooks/useRoomSubscription'
import type { RoomDoc } from '@/lib/types'

interface ResultsRedirectorProps {
  roomId: string
}

export function ResultsRedirector({ roomId }: ResultsRedirectorProps) {
  const router = useRouter()
  const { room } = useRoomSubscription(roomId)

  useEffect(() => {
    if (!room) return
    const segment = pickSegment(room)
    router.replace(`/r/${roomId}/results/${segment}`)
  }, [room, roomId, router])

  return (
    <div className="centered-card">
      <Card className="w-full max-w-md">
        <CardHeader className="text-lg font-semibold">Loading results</CardHeader>
        <CardContent className="text-sm text-muted-foreground">Preparing final screen…</CardContent>
      </Card>
    </div>
  )
}

function pickSegment(room: RoomDoc) {
  if (room?.guess?.outcome === 'DETECTOR_WINS') return 'correct'
  if (room?.guess?.outcome === 'TARGET_WINS') return 'wrong'
  return room?.ai?.aiActiveAt ? 'timeout-target' : 'timeout-detector'
}
