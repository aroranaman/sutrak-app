// src/actions/addEarnForOrder.ts
import {
    doc, getDoc, setDoc, serverTimestamp,
    collection, addDoc,
  } from "firebase/firestore";
  import { firestore } from "@/lib/firebaseClient";
  import { User } from "firebase/auth";
  
  export async function addEarnForOrder(user: User, orderValue: number) {
    const earn = orderValue >= 3500 ? Math.floor(orderValue * 0.02) : 0;
    if (earn <= 0) return;
  
    const userRef = doc(firestore, "users", user.uid);
    const snap = await getDoc(userRef);
    const bal = snap.exists() ? (snap.data().credits || 0) : 0;
    const newBal = bal + earn;
  
    await setDoc(userRef, { credits: newBal }, { merge: true });
    await addDoc(collection(userRef, "credits_ledger"), {
      type: "earn",
      amount: earn,
      source: "order",
      createdAt: serverTimestamp(),
    });
  }