import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function DetectorGuessCard({ onGuess }: { onGuess?: () => void }) {
  return (
    <Card className="max-w-md">
      <CardHeader className="text-lg font-semibold">Think the other player is AI?</CardHeader>
      <CardContent className="space-y-3">
        <Button variant="secondary" onClick={onGuess} className="w-full">I THINK IT'S AI TALKING NOW</Button>
        <p className="text-sm text-muted-foreground">⚠️ Only click when you're sure! Wrong guess = you lose</p>
      </CardContent>
    </Card>
  )
}

