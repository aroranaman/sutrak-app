import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  enableNetwork,
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
const firestore: Firestore = initializeFirestore(app, {
  // Prefer REST (no websockets). Use ONE of these switches; start with preferRest.
  preferRest: true, // <— primary fix on Workstations
  // If your env still marks you offline, comment preferRest and
  // uncomment the line below to force long polling:
  // experimentalForceLongPolling: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Ensure network is ON (in case disableNetwork got called somewhere)
enableNetwork(firestore).catch(() => {});


export { app, auth, firestore };
