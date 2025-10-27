import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

export const adminDb = admin.firestore();
export const adminFieldValue = admin.firestore.FieldValue;