import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, inMemoryPersistence } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  enableNetwork,
  experimentalForceLongPolling,
  type Firestore 
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

// Force in-memory persistence for Auth to avoid storage-related issues
// in sandboxed environments like Cloud Workstations.
setPersistence(auth, inMemoryPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});


const firestore: Firestore = initializeFirestore(app, {
  // Use long polling as it is more reliable in some cloud environments
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Ensure network is ON (in case disableNetwork got called somewhere)
enableNetwork(firestore).catch(() => {});


export { app, auth, firestore };
