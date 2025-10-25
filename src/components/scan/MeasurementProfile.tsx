'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Save, Scan } from 'lucide-react';
import ScanRetrySuggestion from './ScanRetrySuggestion';

interface MeasurementProfileProps {
  onNewScan: () => void;
  measurements: any;
}

export default function MeasurementProfile({ onNewScan, measurements }: MeasurementProfileProps) {
  const { user, credits, addProfile, login } = useUser();
  const [profileName, setProfileName] = useState('My Profile');
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  
  // Simulate a low-quality scan for demo purposes
  const [showRetrySuggestion, setShowRetrySuggestion] = useState(() => Math.random() < 0.3);

  const handleSaveProfile = () => {
    if (!user) {
      login();
      toast({
        title: "Logged In",
        description: "You've been signed in. Now you can save your profile.",
      });
      return;
    }

    if (!profileName) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a name for your profile.',
      });
      return;
    }
    
    const measurementsToSave = {
      bust: parseFloat(measurements.upperTorsoCircumferenceCm.toFixed(1)),
      waist: 74, // This is a mock value, as waist is not calculated
      hip: parseFloat(measurements.hipCircumferenceCm.toFixed(1)),
      inseam: parseFloat(measurements.inseamCm.toFixed(1)),
      shoulderWidth: parseFloat(measurements.shoulderWidthCm.toFixed(1))
    };

    const success = addProfile({
      name: profileName,
      measurements: measurementsToSave,
    });

    if (success) {
      setIsSaved(true);
      toast({
        title: 'Profile Saved!',
        description: `"${profileName}" has been added. 100 credits were used.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Insufficient Credits',
        description: 'You do not have enough credits to save a new profile.',
      });
    }
  };

  if (showRetrySuggestion) {
    return <ScanRetrySuggestion onRetry={onNewScan} onProceed={() => setShowRetrySuggestion(false)} />;
  }

  const displayMeasurements = {
    "Upper Torso (Bust)": measurements?.upperTorsoCircumferenceCm,
    "Hip Circumference": measurements?.hipCircumferenceCm,
    "Shoulder Width": measurements?.shoulderWidthCm,
    "Sleeve Length": measurements?.sleeveLengthCm,
    "Torso Length": measurements?.torsoLengthCm,
    "Inseam": measurements?.inseamCm,
  };


  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-3xl font-headline">Your Measurements</CardTitle>
            <CardDescription>
              Our AI has generated your unique body profile. Save it to start trying on clothes.
            </CardDescription>
          </div>
          <CheckCircle className="size-10 text-green-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {measurements ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg">
          {Object.entries(displayMeasurements).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <span className="capitalize font-medium text-secondary-foreground">
                {key}
              </span>
              <span className="font-bold text-primary">{value.toFixed(1)} cm</span>
            </div>
          ))}
        </div>
        ) : (
          <p>No measurement data available. Please complete a scan.</p>
        )}
        <div>
          <label htmlFor="profileName" className="text-sm font-medium text-foreground/80">Profile Name</label>
          <Input
            id="profileName"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="e.g., My Profile, John's Profile"
            className="mt-1"
            disabled={isSaved}
          />
        </div>
        <CardDescription>Note on Waist: A "Waist" measurement is not reliably possible as it requires finding the torso's narrowest point, which is not provided by the shoulder/hip landmarks.</CardDescription>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
        <Button variant="outline" onClick={onNewScan}>
          <Scan className="mr-2 size-4" />
          Start New Scan
        </Button>
        <Button onClick={handleSaveProfile} disabled={isSaved || !measurements} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Save className="mr-2 size-4" />
          {isSaved ? 'Profile Saved' : `Save Profile (${user ? '100 Credits' : 'Sign in to Save'})`}
        </Button>
      </CardFooter>
    </Card>
  );
}
