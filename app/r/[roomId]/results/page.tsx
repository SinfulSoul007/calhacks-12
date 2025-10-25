import { ResultsRedirector } from '@/components/room/ResultsRedirector'

export default function ResultsEntry({ params }: { params: { roomId: string } }) {
  return <ResultsRedirector roomId={params.roomId} />
}
