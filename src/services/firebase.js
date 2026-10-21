const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const requiredConfig = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
]

async function getDatabase() {
  const missingConfig = requiredConfig.filter((key) => !firebaseConfig[key])

  if (missingConfig.length > 0) {
    const error = new Error(`Faltan variables de Firebase: ${missingConfig.join(', ')}`)
    error.code = 'firebase/missing-config'
    throw error
  }

  const [{ getApp, getApps, initializeApp }, { getFirestore }] = await Promise.all([
    import('firebase/app'),
    import('firebase/firestore'),
  ])
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  return getFirestore(app)
}

export async function saveTransferRecord(record) {
  const [database, { doc, serverTimestamp, setDoc }] = await Promise.all([
    getDatabase(),
    import('firebase/firestore'),
  ])
  const reference = doc(database, 'traslados', record.id)

  await setDoc(reference, {
    ...record,
    createdAtClient: record.createdAt,
    createdAt: serverTimestamp(),
  })

  return reference.id
}
