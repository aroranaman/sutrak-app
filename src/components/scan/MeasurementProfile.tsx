"use client";

import * as React from "react";
import AvatarCanvasShell from "./AvatarCanvasShell";
import type { Measurements } from "./R3FBody";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { saveMeasurementClient } from "@/actions/saveMeasurementClient";
import { Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

function toNum(v: string | number): number {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export default function MeasurementProfile({
  measured,
  profileName: initialName = "Profile 1",
}: {
  measured: Partial<Measurements>;
  profileName?: string;
}) {
  // Editable form state — defaults filled from machine values
  const [form, setForm] = React.useState<Measurements>({
    bust: toNum(measured.bust ?? 95.5),
    hip: toNum(measured.hip ?? 94.7),
    shoulderWidth: toNum(measured.shoulderWidth ?? 44.5),
    sleeve: toNum(measured.sleeve ?? 56),
    torso: toNum(measured.torso ?? 60),
    inseam: toNum(measured.inseam ?? 58),
  });

  const [name, setName] = React.useState(initialName);
  const [saving, setSaving] = React.useState(false);
  const { toast } = useToast();
  const { user: firebaseUser } = useAuth();
  const { addProfile } = useUser();

  function setField<K extends keyof Measurements>(k: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((s) => ({ ...s, [k]: toNum(e.target.value) }));
  }

  async function handleSave() {
    if (!firebaseUser) {
      toast({
        variant: "destructive",
        title: "Not signed in",
        description: "Please sign in before saving your measurement profile.",
      });
      return;
    }
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Missing profile name",
        description: "Please enter a name for this profile.",
      });
      return;
    }

    setSaving(true);
    try {
      const profileData = { name: name.trim(), measurements: form };
      const result = await saveMeasurementClient(firebaseUser, profileData);
      
      // Update local state via context
      addProfile(profileData, result.balance);

      toast({
        title: "Saved",
        description: "Measurement profile saved. 100 credits deducted.",
      });
    } catch (e: any) {
      const msg = String(e?.message || e);
      toast({
        variant: "destructive",
        title: msg === "NOT_ENOUGH_CREDITS" ? "Not enough credits" : "Save failed",
        description:
          msg === "NOT_ENOUGH_CREDITS"
            ? "You need 100 credits to save a profile."
            : msg,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Left column — form */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Check & correct your measurements</h2>
        <p className="text-sm text-muted-foreground">
          If anything looks off, just fix the number. The 3D preview updates live.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm mb-1 block">Profile name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Self, Running Fit, Formal Suit"
            />
          </div>

          <div>
            <label className="text-sm mb-1 block">Bust (cm)</label>
            <Input inputMode="decimal" value={form.bust} onChange={setField("bust")} />
          </div>
          <div>
            <label className="text-sm mb-1 block">Hip (cm)</label>
            <Input inputMode="decimal" value={form.hip} onChange={setField("hip")} />
          </div>
          <div>
            <label className="text-sm mb-1 block">Shoulder Width (cm)</label>
            <Input
              inputMode="decimal"
              value={form.shoulderWidth}
              onChange={setField("shoulderWidth")}
            />
          </div>
          <div>
            <label className="text-sm mb-1 block">Sleeve (cm)</label>
            <Input
              inputMode="decimal"
              value={form.sleeve}
              onChange={setField("sleeve")}
            />
          </div>
          <div>
            <label className="text-sm mb-1 block">Torso (cm)</label>
            <Input inputMode="decimal" value={form.torso} onChange={setField("torso")} />
          </div>
          <div>
            <label className="text-sm mb-1 block">Inseam (cm)</label>
            <Input
              inputMode="decimal"
              value={form.inseam}
              onChange={setField("inseam")}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="mt-2">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save profile (costs 100 credits)
        </Button>
        <p className="text-xs text-muted-foreground">
          You can save even if the 3D preview is still loading.
        </p>
      </div>

      {/* Right column — avatar */}
      <div>
        <h2 className="text-xl font-semibold mb-2">3D Avatar Preview</h2>
        <AvatarCanvasShell
          m={form}
          showDress={false}
        />
      </div>
    </div>
  );
}
