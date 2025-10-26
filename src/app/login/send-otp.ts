
"use client";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

let recaptcha: RecaptchaVerifier | null = null;

function ensureRecaptcha() {
  if (typeof window === "undefined") throw new Error("Recaptcha must run in browser");
  if (!recaptcha) {
    recaptcha = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  }
  return recaptcha;
}

export async function sendOtp(phoneE164: string): Promise<ConfirmationResult> {
  const verifier = ensureRecaptcha();
  // Make sure the container exists in the DOM and reCAPTCHA is rendered
  await verifier.render();
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
