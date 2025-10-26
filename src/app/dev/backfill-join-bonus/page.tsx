'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';
import { grantJoinBonusIfFirstLogin } from '@/lib/grantJoinBonus';
import { doc, getDocFromServer } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { Button } from '@/components/ui/button';

export default function BackfillJoinBonusPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string>('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUid(u?.uid ?? null);
      if (u) {
        const snap = await getDocFromServer(doc(firestore, 'users', u.uid)).catch(() => null);
        const bal =
          snap && snap.exists() && typeof snap.data().credits === 'number'
            ? snap.data().credits
            : null;
        setBalance(bal);
      } else {
        setBalance(null);
      }
    });
    return () => unsub();
  }, []);

  async function handleBackfill() {
    if (!uid || busy) return;
    setBusy(true);
    setLog('');
    try {
      const u = auth.currentUser;
      if (!u) {
        setLog('Not signed in. Please log in first.');
        return;
      }
      const newBal = await grantJoinBonusIfFirstLogin(u);
      const snap = await getDocFromServer(doc(firestore, 'users', u.uid)).catch(() => null);
      const bal =
        snap && snap.exists() && typeof snap.data().credits === 'number'
          ? snap.data().credits
          : null;
      setBalance(bal);
      setLog(`Backfill done. Returned: ${newBal ?? 'n/a'} | Server balance: ${bal ?? 'n/a'}`);
    } catch (e: any) {
      setLog(`Error: ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Join Bonus Backfill</h1>
      <p>User: {uid ?? 'Not signed in'}</p>
      <p>Server balance: {balance ?? 'Unknown'}</p>
      <Button disabled={!uid || busy} onClick={handleBackfill}>
        {busy ? 'Working…' : 'Grant/Backfill ₹500'}
      </Button>
      {log && <pre className="whitespace-pre-wrap text-sm bg-muted p-3 rounded">{log}</pre>}
      <p className="text-xs text-muted-foreground">
        Tip: run once while signed in as the affected user, confirm the balance shows 500,
        then you can remove this page.
      </p>
    </div>
  );
}
