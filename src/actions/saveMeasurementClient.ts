"use client";
import type { User } from "firebase/auth";

export type Measurements = {
  bust: number; hip: number; shoulder: number; sleeve: number; torso: number; inseam: number;
};

export async function saveMeasurementClient(user: User, profileName: string, m: Measurements, source: "auto"|"edited" = "auto") {
  const res = await fetch("/api/measurements/save-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uid: user.uid,
      profile: { name: profileName, measurements: m, source },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || "SAVE_PROFILE_FAILED");
  }
}
