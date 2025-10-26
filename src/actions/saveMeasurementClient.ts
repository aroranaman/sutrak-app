
// src/actions/saveMeasurementClient.ts
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, addDoc, runTransaction,
} from "firebase/firestore";
import { firestore } from "@/lib/firebaseClient";
import { User } from "firebase/auth";
import type { MeasurementProfile } from "@/contexts/UserContext";

export async function saveMeasurementClient(user: User, profile: MeasurementProfile) {
  const userRef = doc(firestore, "users", user.uid);
  const measurementsRef = collection(userRef, "measurements");
  const creditsLedgerRef = collection(userRef, "credits_ledger");

  try {
    const newBalance = await runTransaction(firestore, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const currentBalance = userSnap.exists() ? (userSnap.data().credits || 0) : 0;

      if (currentBalance < 100) {
        throw new Error("NOT_ENOUGH_CREDITS");
      }

      const newBalance = currentBalance - 100;
      
      // 1. Add the new measurement document
      const newMeasurementRef = doc(measurementsRef); // Create a new doc reference with a unique ID
      transaction.set(newMeasurementRef, {
        ...profile,
        createdAt: serverTimestamp(),
      });

      // 2. Add the credit deduction ledger entry
      const newLedgerEntryRef = doc(creditsLedgerRef);
      transaction.set(newLedgerEntryRef, {
        type: "deduct",
        amount: -100,
        source: "measurement-save",
        createdAt: serverTimestamp(),
      });

      // 3. Update the user's total credits and their profiles array
      const existingProfiles = userSnap.exists() ? (userSnap.data().profiles || []) : [];
      const updatedProfiles = [...existingProfiles, profile];
      transaction.update(userRef, { 
        credits: newBalance,
        profiles: updatedProfiles
      });

      return newBalance;
    });

    return { balance: newBalance };

  } catch (error) {
    console.error("Measurement save transaction failed: ", error);
    // Re-throw specific errors to be handled by the UI
    if (error instanceof Error && error.message === "NOT_ENOUGH_CREDITS") {
        throw error;
    }
    // Throw a generic error for other transaction failures
    throw new Error("Failed to save profile due to a server error.");
  }
}
