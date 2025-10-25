import { RoomRedirector } from '@/components/room/RoomRedirector'

export default function RoomEntry({ params }: { params: { roomId: string } }) {
  return <RoomRedirector roomId={params.roomId} />
}
