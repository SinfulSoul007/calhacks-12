import { cn } from '@/lib/utils'

interface MicrophoneIndicatorProps {
  muted?: boolean
  level?: number
  label?: string
}

export function MicrophoneIndicator({ muted = false, level = 0, label = 'Your mic' }: MicrophoneIndicatorProps) {
  const width = Math.round(Math.min(1, Math.max(0, level)) * 100)
  return (
    <div className={cn('px-4 py-3 rounded-md border flex flex-col gap-2', muted ? 'border-border text-muted-foreground' : 'border-green-500 text-green-400')}>
      <div className="text-sm font-medium flex items-center justify-between">
        <span>{label}</span>
        <span>{muted ? 'Muted' : 'Live'}</span>
      </div>
      <div className="w-full h-2 rounded bg-muted overflow-hidden">
        <div className="h-2 rounded bg-green-500 transition-all" style={{ width: muted ? '0%' : `${width}%` }} />
      </div>
    </div>
  )
}
