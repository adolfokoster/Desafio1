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

async function getFirebaseApp() {
  const missingConfig = requiredConfig.filter((key) => !firebaseConfig[key])

  if (missingConfig.length > 0) {
    const error = new Error(`Faltan variables de Firebase: ${missingConfig.join(', ')}`)
    error.code = 'firebase/missing-config'
    throw error
  }

  const { getApp, getApps, initializeApp } = await import('firebase/app')
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
}

async function getDatabase() {
  const [app, { getFirestore }] = await Promise.all([
    getFirebaseApp(),
    import('firebase/firestore'),
  ])
  return getFirestore(app)
}

async function getAuthentication() {
  const [app, { getAuth }] = await Promise.all([
    getFirebaseApp(),
    import('firebase/auth'),
  ])
  return getAuth(app)
}

export async function observeAuthState(callback) {
  const [authentication, { onAuthStateChanged }] = await Promise.all([
    getAuthentication(),
    import('firebase/auth'),
  ])
  return onAuthStateChanged(authentication, callback)
}

export async function signInWithGoogle() {
  const [authentication, { GoogleAuthProvider, signInWithPopup }] = await Promise.all([
    getAuthentication(),
    import('firebase/auth'),
  ])
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return signInWithPopup(authentication, provider)
}

export async function signOutUser() {
  const [authentication, { signOut }] = await Promise.all([
    getAuthentication(),
    import('firebase/auth'),
  ])
  return signOut(authentication)
}

export async function saveTransferRecord(userId, record) {
  const [database, { doc, serverTimestamp, setDoc }] = await Promise.all([
    getDatabase(),
    import('firebase/firestore'),
  ])
  const reference = doc(database, 'users', userId, 'estimations', record.id)

  await setDoc(reference, {
    ...record,
    ownerId: userId,
    createdAtClient: record.createdAt,
    createdAt: serverTimestamp(),
  })

  return reference.id
}

export async function listTransferRecords(userId) {
  const [database, { collection, getDocs, limit, orderBy, query }] = await Promise.all([
    getDatabase(),
    import('firebase/firestore'),
  ])
  const recordsQuery = query(
    collection(database, 'users', userId, 'estimations'),
    orderBy('createdAt', 'desc'),
    limit(50),
  )
  const snapshot = await getDocs(recordsQuery)

  return snapshot.docs.map((recordDocument) => {
    const data = recordDocument.data()
    return {
      ...data,
      firestoreId: recordDocument.id,
      createdAt: data.createdAt?.toDate?.().toISOString() ?? data.createdAtClient,
    }
  })
}
