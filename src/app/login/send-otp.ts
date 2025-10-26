'use client';

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  setPersistence,
  inMemoryPersistence,
} from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

/**
 * We force in-memory auth persistence to avoid storage/cookie/iframe issues
 * in Cloud Workstations and some corporate networks.
 * (Run exactly once per session.)
 */
let persistenceReady: Promise<void> | null = null;
function ensureInMemoryPersistence() {
  if (!persistenceReady) {
    persistenceReady = setPersistence(auth, inMemoryPersistence).catch(() => {
      // If this fails we still proceed; the default persistence might work.
    });
  }
  return persistenceReady;
}

/**
 * Quick connectivity probe so we can surface a clear "offline" message
 * BEFORE hitting Identity Toolkit.
 */
export async function probeOnline(): Promise<boolean> {
  try {
    await fetch('https://www.gstatic.com/generate_204', { mode: 'no-cors' });
    return true;
  } catch {
    return false;
  }
}

let recaptcha: RecaptchaVerifier | null = null;

/**
 * Creates (or reuses) an invisible reCAPTCHA verifier bound to #recaptcha-container.
 * If the existing instance is stale, it recreates it cleanly.
 */
export async function getOrCreateRecaptcha(containerId = 'recaptcha-container') {
  if (typeof window === 'undefined') {
    throw new Error('Recaptcha must run in browser');
  }
  const el = document.getElementById(containerId);
  if (!el) throw new Error(`#${containerId} not found`);

  // Try to reuse an existing instance if possible
  if (recaptcha) {
    try {
      await recaptcha.render(); // if this works, widget is alive
      return recaptcha;
    } catch {
      try {
        recaptcha.clear();
      } catch {
        // ignore
      }
      recaptcha = null;
    }
  }

  // Fresh instance
  recaptcha = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  await recaptcha.render();
  return recaptcha;
}

function normalizeAndLogFirebaseError(e: any, phase: 'send'|'confirm') {
  const msg = String(e?.message || e);
  const code = e?.code || e?.customData?.code;
  const api = e?.customData?.apiName || e?.customData?.endpoint;
  const status = e?.customData?.httpStatus;
  // Some SDK builds expose request details here:
  const url = e?.customData?.requestUri || e?.url || '(unknown-url)';
  // Log to console for now:
  console.error(`[OTP ${phase} error]`, { code, status, api, url, msg, raw: e });
  return { code, status, api, url, msg };
}

/**
 * Sends OTP after ensuring persistence, connectivity, and a healthy verifier.
 */
export async function sendOtp(phoneE164: string): Promise<ConfirmationResult> {
  await ensureInMemoryPersistence();
  if (!(await probeOnline())) { const err = new Error('BROWSER_OFFLINE'); (err as any).code='browser/offline'; throw err; }
  const verifier = await getOrCreateRecaptcha();
  try {
    return await signInWithPhoneNumber(auth, phoneE164, verifier);
  } catch (e: any) {
    normalizeAndLogFirebaseError(e, 'send');
    resetRecaptcha();
    const v2 = await getOrCreateRecaptcha();
    return await signInWithPhoneNumber(auth, phoneE164, v2);
  }
}

/**
 * Confirms the OTP code with defensive error normalization.
 */
export async function confirmOtp(confirmation: ConfirmationResult, code: string) {
  try {
    return await confirmation.confirm(code);
  } catch (e: any) {
    normalizeAndLogFirebaseError(e, 'confirm');
    const msg = String(e?.message || '');
    if (/offline/i.test(msg)) { const err = new Error('CLIENT_OFFLINE'); (err as any).code='auth/client-offline'; throw err; }
    throw e;
  }
}

export function resetRecaptcha() {
  if (recaptcha) {
    try {
      recaptcha.clear();
    } catch {
      // ignore
    }
    recaptcha = null;
  }
}
