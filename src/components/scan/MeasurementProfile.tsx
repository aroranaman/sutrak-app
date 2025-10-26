'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Save, Scan, HelpCircle } from 'lucide-react';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MeasurementProfileProps {
  onNewScan: () => void;
  measurements: any;
}

const measurementInfo: Record<string, string> = {
  bustCircumference: "The measurement around the fullest part of your chest.",
  hipCircumference: "The measurement around the widest part of your hips.",
  shoulderWidth: "The distance from the end of one shoulder to the other.",
  sleeveLength: "The length from your shoulder to your wrist.",
  torsoLength: "The distance from your shoulder to your hip, indicating your upper body length.",
  inseam: "The length of your inner leg, from your crotch to your ankle.",
  waist: 'A standardized waist measurement based on typical body proportions relative to your scan. Direct waist measurement is not possible with this scan technology.'
};


export default function MeasurementProfile({ onNewScan, measurements }: MeasurementProfileProps) {
  const { addProfile } = useUser();
  const { user: firebaseUser } = useAuth();
  const router = useRouter();
  const [profileName, setProfileName] = useState('My Profile');
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const handleSaveProfile = () => {
    if (!firebaseUser) {
      router.push('/login?redirect=/scan');
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to save your profile.",
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
    
    // Create a standardized waist measurement (heuristic)
    const estimatedWaist = measurements.hipCircumferenceCm * 0.85;

    const measurementsToSave = {
      bust: parseFloat(measurements.upperTorsoCircumferenceCm.toFixed(1)),
      waist: parseFloat(estimatedWaist.toFixed(1)),
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
      // The useUser hook will show the "insufficient credits" toast
    }
  };
  
  const displayMeasurements = {
    bustCircumference: measurements?.upperTorsoCircumferenceCm,
    hipCircumference: measurements?.hipCircumferenceCm,
    shoulderWidth: measurements?.shoulderWidthCm,
    sleeveLength: measurements?.sleeveLengthCm,
    torsoLength: measurements?.torsoLengthCm,
    inseam: measurements?.inseamCm,
  };


  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-3xl font-headline">Your 3D Body Profile</CardTitle>
            <CardDescription>
              Our AI has generated your unique body profile from the 3D scan data.
            </CardDescription>
          </div>
          <CheckCircle className="size-10 text-green-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <TooltipProvider>
        {measurements ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg">
          {Object.entries(displayMeasurements).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2">
                    <span className="capitalize font-medium text-secondary-foreground">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Tooltip>
                        <TooltipTrigger>
                            <HelpCircle className="size-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{measurementInfo[key] || 'No information available.'}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
              <span className="font-bold text-primary">{value.toFixed(1)} cm</span>
            </div>
          ))}
        </div>
        ) : (
          <p>No measurement data available. Please complete a scan.</p>
        )}
        </TooltipProvider>
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
        <CardDescription>Note: Waist measurement is an estimation based on standard body proportions relative to your hip and torso, as direct measurement is not possible with this technology.</CardDescription>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
        <Button variant="outline" onClick={onNewScan}>
          <Scan className="mr-2 size-4" />
          Start New Scan
        </Button>
        <Button onClick={handleSaveProfile} disabled={isSaved || !measurements} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Save className="mr-2 size-4" />
          {isSaved ? 'Profile Saved' : 'Save Profile (100 Credits)'}
        </Button>
      </CardFooter>
    </Card>
  );
}

    