// src/actions/saveMeasurementClient.ts
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { User } from 'firebase/auth';
import type { MeasurementProfile } from '@/contexts/UserContext';
import { spendMeasurement } from '@/lib/spendMeasurement';

export async function saveMeasurementClient(
  user: User,
  profile: MeasurementProfile
) {
  const userRef = doc(firestore, 'users', user.uid);
  const measurementsRef = collection(userRef, 'measurements');

  // 1. Spend credits via the secure API endpoint first.
  // This will throw an error and stop execution if the user doesn't have enough credits.
  await spendMeasurement(user.uid);

  // 2. If spending was successful, proceed to save the measurement document.
  try {
    const newMeasurementRef = doc(measurementsRef); // Create a new doc reference with a unique ID
    await addDoc(measurementsRef, {
      ...profile,
      createdAt: serverTimestamp(),
    });

    // 3. Update the user's profiles array in their main document
    // Note: This part is now handled by the local context update for immediate UI feedback.
    // A more robust solution might use a transaction or a cloud function to keep this in sync.
    const userDocSnap = await (await import('firebase/firestore')).getDoc(userRef);
    const existingProfiles = userDocSnap.exists() ? userDocSnap.data().profiles || [] : [];
    const updatedProfiles = [...existingProfiles, profile];
    await setDoc(userRef, { profiles: updatedProfiles }, { merge: true });

    // 4. Return the new balance from the server after deduction.
    const updatedUserDocSnap = await (await import('firebase/firestore')).getDoc(userRef);
    const newBalance = updatedUserDocSnap.exists() ? updatedUserDocSnap.data().credits || 0 : 0;
    
    return { balance: newBalance };

  } catch (error) {
    console.error('Failed to save measurement document after spending credits:', error);
    // Optional: Implement a refund mechanism if this part fails.
    // For now, we throw an error to be caught by the UI.
    throw new Error('Measurement save failed. Please contact support if credits were deducted.');
  }
}