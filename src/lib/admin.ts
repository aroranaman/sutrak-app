// src/lib/admin.ts
import admin from "firebase-admin";
import { firebaseConfig } from "@/firebase/config";

function loadCred() {
  const raw = process.env.FIREBASE_ADMIN_CREDENTIALS;
  const b64 = process.env.FIREBASE_ADMIN_CREDENTIALS_B64;
  if (raw) return JSON.parse(raw);
  if (b64) return JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  return null;
}

if (!admin.apps.length) {
  const sa = loadCred();
  if (sa) {
    admin.initializeApp({
      credential: admin.credential.cert(sa as admin.ServiceAccount),
      projectId: sa.project_id || firebaseConfig.projectId,
      databaseURL: `https://${sa.project_id || firebaseConfig.projectId}.firebaseio.com`,
    });
  } else {
    // Fallback (only if you haven't provided ENV) — still pin projectId
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: firebaseConfig.projectId,
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    });
  }
}

export const adminDb = admin.firestore();
export const adminFieldValue = admin.firestore.FieldValue;
export function adminProjectId(): string {
  return (admin.app().options.projectId as string) || "unknown";
}
