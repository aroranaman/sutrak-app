"use client";

import { firestore } from "@/lib/firebaseClient";
import { collection, addDoc, serverTimestamp, setDoc, doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import type { MeasurementProfile } from '@/contexts/UserContext';


// Calls the server API that performs an atomic -100 credit spend
async function spendMeasurement(uid: string) {
  const res = await fetch("/api/credits/spend-measurement", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "NOT_ENOUGH_CREDITS");
  }
}

export async function saveMeasurementClient(
  user: User,
  profile: MeasurementProfile
) {
  // 1. Spend credits via the secure API endpoint first.
  await spendMeasurement(user.uid);
  
  const userRef = doc(firestore, 'users', user.uid);

  // 2. If spending was successful, proceed to save/update the profile in the user's document.
  try {
    const userDocSnap = await getDoc(userRef);
    const existingProfiles = userDocSnap.exists() ? userDocSnap.data().profiles || [] : [];
    
    // Check if a profile with the same name already exists
    const profileIndex = existingProfiles.findIndex((p: MeasurementProfile) => p.name === profile.name);
    
    let updatedProfiles;
    if (profileIndex > -1) {
      // Update existing profile
      updatedProfiles = [...existingProfiles];
      updatedProfiles[profileIndex] = profile;
    } else {
      // Add new profile
      updatedProfiles = [...existingProfiles, profile];
    }
    
    await setDoc(userRef, { profiles: updatedProfiles }, { merge: true });

    // 3. Return the new balance from the server after deduction.
    // The client will get the new balance via the real-time listener in UserContext.
    const updatedUserDocSnap = await getDoc(userRef);
    const newBalance = updatedUserDocSnap.exists() ? updatedUserDocSnap.data().credits || 0 : 0;
    
    return { balance: newBalance };

  } catch (error) {
    console.error('Failed to save measurement document after spending credits:', error);
    // Optional: Implement a refund mechanism if this part fails.
    // For now, we throw an error to be caught by the UI.
    throw new Error('Measurement save failed. Please contact support if credits were deducted.');
  }
}
