import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let adminApp: App | null = null
let adminDb: Firestore | null = null
let adminAuth: Auth | null = null

function assertFirebaseEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin environment variables')
  }

  return { projectId, clientEmail, privateKey }
}

function getAppInstance() {
  if (adminApp) return adminApp

  if (!getApps().length) {
    const { projectId, clientEmail, privateKey } = assertFirebaseEnv()
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      })
    })
  } else {
    adminApp = getApps()[0]
  }

  return adminApp
}

export function getFirebaseAdminDb() {
  if (!adminDb) {
    adminDb = getFirestore(getAppInstance())
  }
  return adminDb
}

export function getFirebaseAdminAuth() {
  if (!adminAuth) {
    adminAuth = getAuth(getAppInstance())
  }
  return adminAuth
}
