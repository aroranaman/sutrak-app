// src/lib/fixCredits.ts
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { firestore } from "./firebaseClient";
import { User } from "firebase/auth";

export async function ensureJoinBonus(user: User) {
  const userRef = doc(firestore, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, { credits: 500, createdAt: serverTimestamp() }, { merge: true });
    await addDoc(collection(userRef, "credits_ledger"), {
      type: "join_bonus",
      amount: 500,
      source: "signup-backfill",
      createdAt: serverTimestamp(),
    });
    return 500;
  }
  const bal = typeof snap.data().credits === "number" ? snap.data().credits : 0;
  if (bal === 0) {
    await setDoc(userRef, { credits: 500 }, { merge: true });
    await addDoc(collection(userRef, "credits_ledger"), {
      type: "join_bonus",
      amount: 500,
      source: "signup-backfill",
      createdAt: serverTimestamp(),
    });
    return 500;
  }
  return bal;
}
