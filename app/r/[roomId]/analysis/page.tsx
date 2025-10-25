import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function AnalysisPage() {
  return (
    <div className="centered-card">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-lg font-semibold">GAME ANALYSIS</CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">Timeline and tells (placeholder)</div>
          <div className="rounded border border-border p-4">
            <div className="mb-2 font-medium">TIMELINE:</div>
            <div className="text-sm">0:00 — 1:23 [HUMAN] • 1:23 — 3:15 [AI]</div>
          </div>
          <div className="rounded border border-border p-4">
            <div className="mb-2 font-medium">WHAT GAVE IT AWAY:</div>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Response delay</li>
              <li>Unusual word choice</li>
              <li>Background noise disappeared</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

