"use client"
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, signInAnonymously, updateProfile, type User } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

if (process.env.NODE_ENV !== 'production') {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key)
  if (missing.length) {
    console.warn('[firebase] Missing client config values:', missing.join(', '))
  }
}

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

let pendingSignIn: Promise<User> | null = null

export async function signInAnonymouslyIfNeeded(displayName?: string) {
  if (auth.currentUser) {
    if (displayName && auth.currentUser.displayName !== displayName) {
      await safeUpdateProfile(auth.currentUser, displayName)
    }
    return auth.currentUser
  }

  if (!pendingSignIn) {
    pendingSignIn = (async () => {
      const credential = await signInAnonymously(auth)
      const user = credential.user
      if (displayName) {
        await safeUpdateProfile(user, displayName)
      }
      pendingSignIn = null
      return user
    })()
  }

  return pendingSignIn
}

async function safeUpdateProfile(user: User, displayName: string) {
  try {
    await updateProfile(user, { displayName: displayName.slice(0, 50) })
  } catch (error) {
    console.warn('[firebase] Failed to update display name', error)
  }
}
