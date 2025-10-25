import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { VoiceCloneStatus } from '@/components/elevenlabs/VoiceCloneStatus'

export default function ProcessingPage() {
  return (
    <div className="centered-card">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-lg font-semibold">Creating voice clones...</CardHeader>
        <CardContent>
          <VoiceCloneStatus progress={100} />
          <div className="mt-4 text-sm text-muted-foreground">Ready to play!</div>
        </CardContent>
      </Card>
    </div>
  )
}

