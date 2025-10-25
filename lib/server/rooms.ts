import { FieldValue, Timestamp, type DocumentReference } from 'firebase-admin/firestore'
import { getFirebaseAdminDb } from '@/lib/firebase.admin'
import type { RoomDoc } from '@/lib/types'

const TTL_MS = 30 * 60 * 1000

export function roomsCollection() {
  return getFirebaseAdminDb().collection('rooms')
}

export function roomRef(roomId: string) {
  return roomsCollection().doc(roomId)
}

export function transcriptsCollection(roomId: string) {
  return roomRef(roomId).collection('transcripts')
}

export function voiceMapRef(roomId: string) {
  return getFirebaseAdminDb().collection('roomVoices').doc(roomId)
}

export function expireAtTimestamp() {
  return Timestamp.fromMillis(Date.now() + TTL_MS)
}

export function serverTimestamp() {
  return FieldValue.serverTimestamp()
}

export async function fetchRoom(roomId: string) {
  const snapshot = await roomRef(roomId).get()
  if (!snapshot.exists) {
    return null
  }
  return snapshot.data() as RoomDoc
}

export function timestampToIso(value?: FirebaseFirestore.Timestamp | Timestamp | Date | null) {
  if (!value) return null
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof (value as any).toDate === 'function') {
    return (value as FirebaseFirestore.Timestamp).toDate().toISOString()
  }
  return null
}

export async function ensureRoomExists(roomId: string) {
  const doc = await roomRef(roomId).get()
  if (!doc.exists) {
    throw new Error('Room not found')
  }
  return doc
}

export type RoomRef = DocumentReference<RoomDoc>
