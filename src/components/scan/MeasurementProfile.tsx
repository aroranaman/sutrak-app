"use client";

import * as React from "react";
import AvatarCanvasShell from "./AvatarCanvasShell";
import type { Fit } from "./AvatarCanvasShell";
import type { Measurements } from "./R3FBody";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { saveMeasurementClient } from "@/actions/saveMeasurementClient";
import { Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

function normalize(m: Partial<Measurements>): Measurements {
  return {
    bust: Number(m.bust ?? 95.5),
    hip: Number(m.hip ?? 94.7),
    shoulder: Number(m.shoulderWidth ?? 44.5), // Corrected from shoulder
    sleeve: Number(m.sleeveLength ?? 56), // Corrected from sleeve
    torso: Number(m.torsoLength ?? 60), // Corrected from torso
    inseam: Number(m.inseam ?? 58),
  };
}

export default function MeasurementProfile({
  measurements: measured,
  onNewScan,
}: {
  measurements: Partial<any>;
  onNewScan: () => void;
}) {
  const [profileName, setProfileName] = React.useState("My Profile");
  const { user: firebaseUser } = useAuth();
  const { addProfile } = useUser();
  
  // Normalize the incoming measurement keys.
  const normalizedMeasurements = {
      bust: measured.bust,
      hip: measured.hip,
      shoulderWidth: measured.shoulderWidth,
      sleeveLength: measured.sleeveLength,
      torsoLength: measured.torsoLength,
      inseam: measured.inseam
  };

  const m = normalize(normalizedMeasurements);
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);

  // Fit/ease (cm) → +/- range
  const [fit, setFit] = React.useState<Fit>({
    bustEase: 0, hipEase: 0, shoulderEase: 0, sleeveEase: 0, torsoEase: 0, inseamEase: 0
  });
  const update = (k:keyof Fit)=>(v:number[])=>setFit(s=>({...s,[k]:v[0]}));

  async function handleSave() {
    if (!firebaseUser) { toast({variant:"destructive",title:"Not signed in",description:"Please sign in."}); return; }
    setSaving(true);
    try {
      const newProfile = { name: profileName, measurements: m };
      const result = await saveMeasurementClient(firebaseUser, newProfile);
      addProfile(newProfile, result.balance);
      toast({ title:"Saved", description:"Measurement profile saved (100 credits deducted)." });
    } catch (e:any) {
      const msg = String(e?.message || e);
      toast({
        variant: "destructive",
        title: msg === "NOT_ENOUGH_CREDITS" ? "Not enough credits" : "Save failed",
        description: msg === "NOT_ENOUGH_CREDITS" ? "You need 100 credits to save." : msg,
      });
    } finally { setSaving(false); }
  }

  const avatarMeasurements = {
      bust: m.bust,
      hip: m.hip,
      shoulder: m.shoulder,
      sleeve: m.sleeve,
      torso: m.torso,
      inseam: m.inseam,
  };


  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Measurements</h2>
        <ul className="text-sm grid grid-cols-2 gap-x-6 gap-y-2">
          <li>Bust: {m.bust.toFixed(1)} cm</li><li>Hip: {m.hip.toFixed(1)} cm</li>
          <li>Shoulder: {m.shoulder.toFixed(1)} cm</li><li>Sleeve: {m.sleeve.toFixed(1)} cm</li>
          <li>Torso: {m.torso.toFixed(1)} cm</li><li>Inseam: {m.inseam.toFixed(1)} cm</li>
        </ul>

        <div className="space-y-3">
          <h3 className="font-medium">Fit / Ease (cm)</h3>
          <label className="text-sm">Bust ease: {fit.bustEase} cm</label>
          <Slider min={-6} max={+12} step={0.5} defaultValue={[0]} onValueChange={update("bustEase")} />
          <label className="text-sm">Hip ease: {fit.hipEase} cm</label>
          <Slider min={-6} max={+12} step={0.5} defaultValue={[0]} onValueChange={update("hipEase")} />
          <label className="text-sm">Shoulder ease: {fit.shoulderEase} cm</label>
          <Slider min={-4} max={+6} step={0.5} defaultValue={[0]} onValueChange={update("shoulderEase")} />
          <label className="text-sm">Sleeve adjust: {fit.sleeveEase} cm</label>
          <Slider min={-6} max={+6} step={0.5} defaultValue={[0]} onValueChange={update("sleeveEase")} />
          <label className="text-sm">Torso length: {fit.torsoEase} cm</label>
          <Slider min={-6} max={+6} step={0.5} defaultValue={[0]} onValueChange={update("torsoEase")} />
          <label className="text-sm">Inseam: {fit.inseamEase} cm</label>
          <Slider min={-6} max={+6} step={0.5} defaultValue={[0]} onValueChange={update("inseamEase")} />
        </div>

        <Button onClick={handleSave} disabled={saving} className="mt-2">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save profile (100 credits)
        </Button>
        <p className="text-xs text-muted-foreground">You can save even if the 3D preview is still loading.</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">3D Avatar Preview</h2>
        <AvatarCanvasShell m={avatarMeasurements} fit={fit} showDress dressColor="#8db3ff" />
      </div>
    </div>
  );
}