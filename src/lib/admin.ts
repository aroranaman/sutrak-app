// src/lib/admin.ts
import admin from "firebase-admin";
import { firebaseConfig } from "@/firebase/config";

// IMPORTANT:
// 1) Ensure GOOGLE_APPLICATION_CREDENTIALS env var points to a service-account JSON.
// 2) Pin projectId to match the client config, otherwise admin can hit the wrong project.

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: firebaseConfig.projectId,
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
  });
}

export const adminDb = admin.firestore();
export const adminFieldValue = admin.firestore.FieldValue;
export function adminProjectId() {
  return (admin.app().options.projectId as string | undefined) ?? "unknown";
}
