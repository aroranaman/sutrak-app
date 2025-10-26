// src/lib/grantJoinBonus.ts
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { firestore } from "./firebaseClient";
import { User } from "firebase/auth";

export async function grantJoinBonusIfFirstLogin(user: User) {
  const userRef = doc(firestore, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    // create user doc with ₹500
    await setDoc(userRef, {
      uid: user.uid,
      phone: user.phoneNumber ?? null,
      credits: 500,
      createdAt: serverTimestamp(),
    });

    // add a ledger row
    await addDoc(collection(userRef, "credits_ledger"), {
      type: "join_bonus",
      amount: 500,
      source: "signup",
      createdAt: serverTimestamp(),
    });
  }
}
