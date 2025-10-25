"use client"
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MicrophoneIndicator } from '@/components/MicrophoneIndicator'
import { Timer } from '@/components/Timer'
import { SecretOptionCard } from '@/components/SecretOptionCard'
import { DetectorGuessCard } from '@/components/DetectorGuessCard'

export default function TalkPage({ params }: { params: { roomId: string } }) {
  const search = useSearchParams()
  const role = search.get('role') || 'detector' // 'target' or 'detector'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="text-lg font-semibold">💬 CONVERSATION MODE</div>
          <div className="text-sm text-muted-foreground">Topic: "What\'s your favorite food and why?"</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">🔴 Speaker • ⚪ You</div>
            <div className="text-sm">⏱️ Time: <Timer /></div>
          </div>
          <MicrophoneIndicator active />
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            {role === 'target' ? (
              <SecretOptionCard onClick={() => { /* stub */ }} />
            ) : (
              <div />
            )}
            <DetectorGuessCard onGuess={() => { /* stub */ }} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Mute</Button>
            <Button variant="outline">Leave</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

