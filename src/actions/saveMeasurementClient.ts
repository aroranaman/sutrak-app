// src/actions/saveMeasurementClient.ts
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, addDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebaseClient";
import { User } from "firebase/auth";

export async function saveMeasurementClient(user: User, name: string, values: any) {
  const userRef = doc(firestore, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const current = userSnap.exists() && typeof userSnap.data().credits === "number"
    ? userSnap.data().credits : 0;

  if (current < 100) throw new Error("NOT_ENOUGH_CREDITS");

  const newBal = current - 100;
  await updateDoc(userRef, { credits: newBal });

  await addDoc(collection(userRef, "credits_ledger"), {
    type: "deduct",
    amount: -100,
    source: "measurement-save",
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(userRef, "measurements"), {
    name,
    values,
    createdAt: serverTimestamp(),
  });

  return { balance: newBal };
}
