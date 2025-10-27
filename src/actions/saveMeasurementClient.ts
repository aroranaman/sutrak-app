// src/actions/saveMeasurementClient.ts
'use client';

import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  getDoc,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { User } from 'firebase/auth';
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
  const measurementsRef = collection(userRef, 'measurements');

  // 2. If spending was successful, proceed to save the measurement document.
  try {
    await addDoc(measurementsRef, {
      ...profile,
      createdAt: serverTimestamp(),
    });

    // 3. Update the user's profiles array in their main document for easy access
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

    // 4. Return the new balance from the server after deduction.
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
