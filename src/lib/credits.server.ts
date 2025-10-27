import { adminDb, adminFieldValue } from "./admin";

export async function txSpendCredits(uid:string, amount:number, meta:any) {
  if (amount <= 0) throw new Error("amount must be > 0");
  const userRef = adminDb.doc(`users/${uid}`);
  const ledgerRef = userRef.collection("credits_ledger").doc();
  await adminDb.runTransaction(async (tx)=>{
    const snap = await tx.get(userRef);
    const current = (snap.exists && typeof snap.get("credits")==="number")? snap.get("credits"): 0;
    if (current < amount) throw new Error("NOT_ENOUGH_CREDITS");
    tx.update(userRef, { credits: current - amount });
    tx.set(ledgerRef, {
      type: meta?.type ?? "spend",
      amount: -amount,
      meta: meta ?? {},
      createdAt: adminFieldValue.serverTimestamp(),
    });
  });
}

export async function txGrantCredits(uid:string, amount:number, meta:any) {
  if (amount <= 0) throw new Error("amount must be > 0");
  const userRef = adminDb.doc(`users/${uid}`);
  const ledgerRef = userRef.collection("credits_ledger").doc();
  await adminDb.runTransaction(async (tx)=>{
    const snap = await tx.get(userRef);
    const current = (snap.exists && typeof snap.get("credits")==="number")? snap.get("credits"): 0;
    tx.set(userRef, { credits: current + amount }, { merge: true });
    tx.set(ledgerRef, {
      type: meta?.type ?? "grant",
      amount,
      meta: meta ?? {},
      createdAt: adminFieldValue.serverTimestamp(),
    });
  });
}