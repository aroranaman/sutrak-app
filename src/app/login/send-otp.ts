'use client';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

let recaptcha: RecaptchaVerifier | null = null;

export async function getOrCreateRecaptcha(containerId = "recaptcha-container") {
  if (typeof window === "undefined") throw new Error("Recaptcha must run in browser");
  const el = document.getElementById(containerId);
  if (!el) throw new Error(`#${containerId} not found`);

  // If verifier exists, try to re-render it. If that fails, we'll create a new one.
  if (recaptcha) {
    try { 
      await recaptcha.render(); 
      return recaptcha; 
    } catch { 
      // This can happen if the container was cleared or the widget expired.
      // We'll proceed to create a new one.
      recaptcha.clear();
      recaptcha = null;
    }
  }

  recaptcha = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  await recaptcha.render();
  return recaptcha;
}


export async function sendOtp(phoneE164: string): Promise<ConfirmationResult> {
  const verifier = await getOrCreateRecaptcha();
  // Now request the code
  const confirmation = await signInWithPhoneNumber(auth, phoneE164, verifier);
  return confirmation;
}

export function resetRecaptcha() {
    if (recaptcha) {
        recaptcha.clear();
        recaptcha = null;
    }
}
