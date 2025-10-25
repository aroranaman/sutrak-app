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
}

const mockMeasurements = {
  bust: 92, // cm
  waist: 74,
  hip: 98,
  inseam: 79,
  shoulderWidth: 39,
};

export default function MeasurementProfile({ onNewScan }: MeasurementProfileProps) {
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

    const success = addProfile({
      name: profileName,
      measurements: mockMeasurements,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg">
          {Object.entries(mockMeasurements).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <span className="capitalize font-medium text-secondary-foreground">
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              <span className="font-bold text-primary">{value} cm</span>
            </div>
          ))}
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
        <Button onClick={handleSaveProfile} disabled={isSaved} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Save className="mr-2 size-4" />
          {isSaved ? 'Profile Saved' : `Save Profile (${user ? '100 Credits' : 'Sign in to Save'})`}
        </Button>
      </CardFooter>
    </Card>
  );
}
