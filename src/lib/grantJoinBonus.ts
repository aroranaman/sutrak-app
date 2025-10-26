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
 * Try server-first (bypasses “offline” client state), then fall back to cache.
 * Never throw—login should not be blocked by credits bookkeeping.
 */
export async function grantJoinBonusIfFirstLogin(user: User): Promise<number | void> {
  const userRef = doc(firestore, 'users', user.uid);

  try {
    // Prefer server—does not rely on watch/listen transport
    const snap = await getDocFromServer(userRef).catch(() => null);

    if (!snap || !snap.exists()) {
      const current = await getDoc(userRef).catch(() => null);
      const hasCredits = !!current?.exists() && typeof current.data()?.credits === 'number';

      if (!hasCredits) {
        await setDoc(userRef, {
          uid: user.uid,
          phone: user.phoneNumber ?? null,
          credits: 500,
          createdAt: serverTimestamp(),
        }, { merge: true });

        await addDoc(collection(userRef, 'credits_ledger'), {
          type: 'join_bonus',
          amount: 500,
          source: 'signup',
          createdAt: serverTimestamp(),
        });

        return 500;
      } else {
        return current?.data()?.credits ?? 0;
      }
    }

    const bal = typeof snap.data().credits === 'number' ? snap.data().credits : 0;
    if (bal === 0) {
      await setDoc(userRef, { credits: 500 }, { merge: true });
      await addDoc(collection(userRef, 'credits_ledger'), {
        type: 'join_bonus',
        amount: 500,
        source: 'signup-backfill',
        createdAt: serverTimestamp(),
      });
      return 500;
    }
    return bal;
  } catch (e) {
    // Swallow “offline” and move on; login should succeed regardless.
    console.warn('[grantJoinBonusIfFirstLogin] non-fatal error:', e);
  }
}
