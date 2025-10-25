import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function RoomLobby({ params }: { params: { roomId: string } }) {
  const roomId = params.roomId
  return (
    <div className="centered-card">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="text-xl font-semibold">Room: {roomId}</div>
          <div className="text-sm text-muted-foreground">mimic.game/r/{roomId}</div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Players (2/2):</div>
            <div className="flex flex-col gap-1">
              <div>🟢 Player A</div>
              <div>🟢 Player B</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/r/${roomId}/setup`}><Button>START GAME</Button></Link>
            <Button variant="outline">COPY LINK</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

