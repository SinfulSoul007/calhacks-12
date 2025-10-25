"use client"
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface SecretOptionCardProps {
  enabled: boolean
  aiActive: boolean
  busy?: boolean
  suggestions: string[]
  onActivate: () => Promise<void> | void
  onDeactivate: () => Promise<void> | void
  onSuggestClick: (suggestion: string) => Promise<void> | void
  onFreeTextSubmit: (text: string) => Promise<void> | void
}

export function SecretOptionCard({
  enabled,
  aiActive,
  busy,
  suggestions,
  onActivate,
  onDeactivate,
  onSuggestClick,
  onFreeTextSubmit
}: SecretOptionCardProps) {
  const [prompt, setPrompt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const disabled = !enabled || busy || submitting

  async function handleSubmit() {
    if (!prompt.trim()) return
    setSubmitting(true)
    try {
      await onFreeTextSubmit(prompt.trim())
      setPrompt('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="max-w-md h-full">
      <CardHeader className="text-lg font-semibold">🎭 Secret Control</CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {enabled
            ? 'Trigger your AI voice when you feel confident.'
            : 'Waiting for the server to confirm you are the target.'}
        </p>
        <Button
          disabled={disabled}
          onClick={aiActive ? onDeactivate : onActivate}
          className="w-full"
          variant={aiActive ? 'destructive' : 'default'}
        >
          {aiActive ? 'Back to Mic' : 'Let AI Take Over'}
        </Button>
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">Quick replies</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                onClick={() => onSuggestClick(suggestion)}
                size="sm"
                variant="outline"
                disabled={disabled}
              >
                {suggestion}
              </Button>
            ))}
            {!suggestions.length && (
              <span className="text-xs text-muted-foreground">No suggestions yet.</span>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Type a custom idea"
            disabled={disabled}
          />
          <Button onClick={handleSubmit} size="sm" disabled={disabled || !prompt.trim()}>
            Send to AI
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
