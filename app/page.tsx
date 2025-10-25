import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="centered-card">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">🎭 THE MIMIC GAME</h1>
            <p className="text-muted-foreground">1v1 AI Detection Challenge</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/r/new"><Button size="lg">CREATE ROOM</Button></Link>
          <Link href="/join"><Button size="lg" variant="secondary">JOIN ROOM</Button></Link>
        </CardContent>
      </Card>
    </div>
  )
}

