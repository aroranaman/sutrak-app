'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Save, Scan, HelpCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { saveMeasurementClient } from '@/actions/saveMeasurementClient';
import { Skeleton } from '../ui/skeleton';

const AvatarPreview = dynamic(() => import('./AvatarPreview'), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full rounded-lg border bg-secondary flex items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  ),
});


interface MeasurementProfileProps {
  onNewScan: () => void;
  measurements: any;
}

const measurementInfo: Record<string, string> = {
  bust: "The measurement around the fullest part of your chest.",
  waist: "The measurement around the narrowest part of your torso.",
  hip: "The measurement around the widest part of your hips.",
  shoulderWidth: "The distance from the end of one shoulder to the other.",
  sleeveLength: "The length from your shoulder to your wrist.",
  torsoLength: "The distance from your shoulder to your hip, indicating your upper body length.",
  inseam: "The length of your inner leg, from your crotch to your ankle.",
};

export default function MeasurementProfile({ onNewScan, measurements }: MeasurementProfileProps) {
  const { addProfile } = useUser();
  const { user: firebaseUser } = useAuth();
  const router = useRouter();
  const [profileName, setProfileName] = useState('My Profile');
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const handleSaveProfile = async () => {
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
    
    if (!measurements) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No measurements to save.',
      });
      return;
    }

    try {
      await saveMeasurementClient(firebaseUser, profileName, measurements);
      
      // Also update the local context state
      addProfile({
          name: profileName,
          measurements: measurements
      }, true); // pass skipDeduction = true

      setIsSaved(true);
      toast({
        title: 'Profile Saved!',
        description: `"${profileName}" has been added. You can view it in your profile.`,
      });
    } catch (e: any) {
      if (e.message === 'NOT_ENOUGH_CREDITS') {
        toast({
          variant: 'destructive',
          title: 'Insufficient Credits',
          description: 'You need at least 100 credits to save a profile. Earn more by making purchases or top up your wallet.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Saving Profile',
          description: 'An unexpected error occurred. Please try again.',
        });
        console.error("Error saving profile:", e);
      }
    }
  };
  
  return (
    <Card className="max-w-4xl mx-auto shadow-xl">
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
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
            <AvatarPreview measurements={measurements} />
          </Suspense>
          <TooltipProvider>
            {measurements ? (
            <div className="grid grid-cols-1 gap-4 text-lg">
              {Object.entries(measurements).map(([key, value]: [string, any]) => (
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
        </div>
        
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
