"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useRoomSubscription } from '@/lib/hooks/useRoomSubscription'

interface RoomRedirectorProps {
  roomId: string
}

export function RoomRedirector({ roomId }: RoomRedirectorProps) {
  const router = useRouter()
  const { room, loading } = useRoomSubscription(roomId)

  useEffect(() => {
    if (!room) return
    const target = room.status === 'ended' ? `/r/${roomId}/results` : room.status === 'live' ? `/r/${roomId}/talk` : `/r/${roomId}/setup`
    router.replace(target)
  }, [room, roomId, router])

  return (
    <div className="centered-card">
      <Card className="w-full max-w-md">
        <CardHeader className="text-lg font-semibold">Joining room {roomId}</CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {loading ? 'Loading room state…' : room ? 'Redirecting…' : 'Room not found'}
        </CardContent>
      </Card>
    </div>
  )
}
