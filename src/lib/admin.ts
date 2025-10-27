// src/lib/admin.ts
import admin from "firebase-admin";
import { firebaseConfig } from "@/firebase/config";

// If you use a service account JSON, set GOOGLE_APPLICATION_CREDENTIALS env var.
// We also pin the projectId to match the client config to avoid cross-project reads.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: firebaseConfig.projectId,      // <- critical
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
  });
}

export const adminDb = admin.firestore();
export const adminFieldValue = admin.firestore.FieldValue;
export function currentAdminProject(): string | undefined {
  return admin.app().options.projectId as string | undefined;
}
