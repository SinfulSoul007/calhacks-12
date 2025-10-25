import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ResultWrong() {
  return (
    <div className="centered-card">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-lg font-semibold">⚠️ WRONG!</CardHeader>
        <CardContent className="space-y-4">
          <div>Detector guessed AI, but Target was still human.</div>
          <div className="text-sm text-muted-foreground">🏆 TARGET WINS!</div>
          <div className="flex gap-3">
            <Link href="../../.."><Button>PLAY AGAIN</Button></Link>
            <Link href="../../../talk"><Button variant="secondary">REJOIN</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

