import { cn } from '@/lib/utils'

export function MicrophoneIndicator({ active = false }: { active?: boolean }) {
  return (
    <div className={cn('text-sm px-3 py-2 rounded-md inline-flex items-center gap-2 border', active ? 'border-green-500 text-green-400' : 'border-border text-muted-foreground')}>
      <span>🎙️</span>
      <span>Your mic is {active ? 'active' : 'muted'}</span>
    </div>
  )
}

