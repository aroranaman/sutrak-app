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
  preferRest: true, 
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Explicitly re-enable the network to be certain
enableNetwork(firestore).catch(() => {});


export { app, auth, firestore };
