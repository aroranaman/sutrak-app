
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, inMemoryPersistence } from 'firebase/auth';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  enableNetwork,
  type Firestore,
  FirestoreSettings,
  memoryLocalCache
} from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

if (typeof window === 'undefined') {
  // Server-side environment
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  firestore = initializeFirestore(app, {
    // Use memory cache for server-side rendering
    localCache: memoryLocalCache(),
  });
} else {
  // Client-side environment
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  
  // Set auth persistence for the client
  setPersistence(auth, inMemoryPersistence).catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

  // Configure Firestore with persistence for the client
  const settings: FirestoreSettings = {
    preferRest: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  };

  try {
    firestore = initializeFirestore(app, settings);
    enableNetwork(firestore).catch(() => {});
  } catch (e) {
    // This can happen if initializeFirestore was already called.
    // We can try to get the existing instance.
    firestore = initializeFirestore(app, {
        ...settings,
        // If re-initializing, it might be safer to fall back to memory cache
        localCache: memoryLocalCache(),
    });
  }
}

export { app, auth, firestore };
