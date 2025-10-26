import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, inMemoryPersistence } from 'firebase/auth';
import { 
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


/**
 * Transport notes:
 * - preferRest: true     → queries/reads/writes via REST (no websocket)
 * - useFetchStreams: true→ streaming via fetch (not XHR webchannel), plays nicer with proxies
 * Only enable experimentalForceLongPolling if your proxy breaks fetch streams too.
 */
const firestore: Firestore = initializeFirestore(app, {
  preferRest: true,
  useFetchStreams: true, // <-- key change: avoid XHR long-poll "Listen/channel"
  // experimentalForceLongPolling: true, // <— leave this OFF now; turn ON only if you still see “offline”
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Ensure network is on
enableNetwork(firestore).catch(() => {});


export { app, auth, firestore };
