import { doc, getDocFromServer } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';

export async function getBalance(uid: string): Promise<number | null> {
  const snap = await getDocFromServer(doc(firestore, 'users', uid)).catch(() => null);
  if (!snap || !snap.exists()) return null;
  return typeof snap.data().credits === 'number' ? snap.data().credits : null;
}
