
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, inMemoryPersistence } from 'firebase/auth';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  enableNetwork,
  type Firestore,
  FirestoreSettings
} from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// This function ensures that we initialize the app only once.
function initializeFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  } else {
    return getApp();
  }
}

// Initialize the app and export it as a singleton.
const app: FirebaseApp = initializeFirebaseApp();

// Initialize services and export them as singletons.
const auth: Auth = getAuth(app);

let firestore: Firestore;

// Universal Initialization for Firestore
if (typeof window === 'undefined') {
  // Server-side: Use basic initialization
  firestore = initializeFirestore(app, {});
} else {
  // Client-side: Initialize with persistence
  // Force in-memory persistence for Auth to avoid storage-related issues
  // in sandboxed environments like Cloud Workstations.
  setPersistence(auth, inMemoryPersistence).catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

  const settings: FirestoreSettings = {
    preferRest: true,
    useFetchStreams: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  };

  firestore = initializeFirestore(app, settings);
  
  // Ensure network is on (client-side only)
  enableNetwork(firestore).catch(() => {});
}

export { app, auth, firestore };
