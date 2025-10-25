import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { VoiceRecorder } from '@/components/elevenlabs/VoiceRecorder'

export default function VoiceSetupPage({ params }: { params: { roomId: string } }) {
  const { roomId } = params
  return (
    <div className="centered-card">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="text-lg font-semibold">🎙️ VOICE SETUP</div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="font-medium">Player 1, read this:</div>
            <div className="text-muted-foreground">"Hello, I\'m Sarah and I love playing games online."</div>
            <VoiceRecorder />
          </div>
          <div className="space-y-2">
            <div className="font-medium">Now Player 2\'s turn!</div>
            <div className="text-muted-foreground">"Hello, I\'m Mike and I love playing games online."</div>
            <VoiceRecorder />
          </div>
          <div className="text-sm text-muted-foreground">Room: {roomId}</div>
        </CardContent>
      </Card>
    </div>
  )
}

