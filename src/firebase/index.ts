
export * from './provider';
export * from './client-provider';
export * from './config';
export * from './auth/use-auth';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './memo';
export * from './errors';
export * from './error-emitter';

import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { firebaseConfig } from './config';


// This function is kept for legacy purposes but new code should use the exported `app`, `auth` from `@/lib/firebaseClient`
function initializeFirebase(config: FirebaseOptions) {
  const isInitialized = getApps().length > 0;
  const app = isInitialized ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  if (process.env.NEXT_PUBLIC_EMULATOR_HOST) {
    const host = process.env.NEXT_PUBLIC_EMULATOR_HOST;
    if (!auth.emulatorConfig) {
      connectAuthEmulator(auth, `http://${host}:9099`, {
        disableWarnings: true,
      });
    }
    if (!firestore.emulatorConfig) {
      connectFirestoreEmulator(firestore, host, 8080);
    }
  }

  return { app, auth, firestore };
}

export { initializeFirebase };
