// src/lib/grantJoinBonus.ts
import {
  doc,
  getDocFromServer,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import type { User } from 'firebase/auth';

/**
 * Give ₹500 on first login. Works even if the user doc already exists but has 0/undefined credits.
 * Uses server reads to bypass any "client offline" state.
 * Never throws; login UX must not be blocked by credits writes.
 */
export async function grantJoinBonusIfFirstLogin(user: User): Promise<number | void> {
  const userRef = doc(firestore, 'users', user.uid);

  try {
    // Read from server (preferred path)
    const serverSnap = await getDocFromServer(userRef).catch(() => null);

    // If doc is missing on server...
    if (!serverSnap || !serverSnap.exists()) {
      // Check cache as a fallback (in case server is flaky)
      const cacheSnap = await getDoc(userRef).catch(() => null);
      const cachedCredits =
        cacheSnap?.exists() && typeof cacheSnap.data()?.credits === 'number'
          ? cacheSnap.data()!.credits
          : undefined;

      if (!cachedCredits || cachedCredits <= 0) {
        // Create doc with ₹500 credits
        await setDoc(
          userRef,
          {
            uid: user.uid,
            phone: user.phoneNumber ?? null,
            credits: 500,
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );

        await addDoc(collection(userRef, 'credits_ledger'), {
          type: 'join_bonus',
          amount: 500,
          source: 'signup',
          createdAt: serverTimestamp(),
        });
        return 500;
      }
      return cachedCredits;
    }

    // Doc exists on server: ensure credits >= 500 once
    const serverCredits =
      typeof serverSnap.data().credits === 'number' ? serverSnap.data().credits : 0;

    if (serverCredits <= 0) {
      await setDoc(userRef, { credits: 500 }, { merge: true });
      await addDoc(collection(userRef, 'credits_ledger'), {
        type: 'join_bonus',
        amount: 500,
        source: 'signup-backfill',
        createdAt: serverTimestamp(),
      });
      return 500;
    }

    return serverCredits;
  } catch (e) {
    console.warn('[grantJoinBonusIfFirstLogin] non-fatal:', e);
  }
}
