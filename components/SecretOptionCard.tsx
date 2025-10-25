import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function SecretOptionCard({ onClick }: { onClick?: () => void }) {
  return (
    <Card className="max-w-md">
      <CardHeader className="text-lg font-semibold">🎭 SECRET OPTION</CardHeader>
      <CardContent className="space-y-4">
        <p>You can let AI take over your voice at any time!</p>
        <p>Click when you want to test if the other player can detect it.</p>
        <Button onClick={onClick} className="w-full">LET AI TAKE OVER</Button>
      </CardContent>
    </Card>
  )
}

