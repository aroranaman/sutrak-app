
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Camera, UserCheck, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ScanProcessing from './ScanProcessing';

interface ScanningUIProps {
  onComplete: (results: any, scanQuality: 'good' | 'poor') => void;
}

type ScanStage = 'idle' | 'starting' | 'countdown' | 'capturing' | 'processing';

// Inaccurate measurements to simulate a "poor" quality scan.
const inaccurateMeasurements = {
    bust: 91.5,
    hip: 98.2,
    shoulderWidth: 41.3,
    sleeveLength: 54.1,
    torsoLength: 62.5,
    inseam: 56.8,
};

export default function ScanningUI({ onComplete }: ScanningUIProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanStage, setScanStage] = useState<ScanStage>('idle');
  const [countdown, setCountdown] = useState(5);
  const [scanMessage, setScanMessage] = useState("Let's get your measurements.");
  const [userHeight, setUserHeight] = useState('170');
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } } 
        });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();

    return () => {
      // Cleanup: Stop camera tracks when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);


  // --- Camera & Scan Flow ---
  const startScan = async () => {
    if (!hasCameraPermission) {
       toast({
        variant: 'destructive',
        title: 'Camera Access Required',
        description: 'Cannot start scan without camera permission.',
      });
      return;
    }

    const heightCm = parseInt(userHeight);
    if (!userHeight || isNaN(heightCm) || heightCm < 140 || heightCm > 210) {
      toast({
        variant: 'destructive',
        title: 'Invalid Height',
        description: 'Please enter a valid height between 140 and 210 cm.',
      });
      return;
    }

    setScanStage('starting');
    runScanSequence();
  };

  const runScanSequence = async () => {
    // This simulates the capture process. In a real app, this would stream video/IMU data.
    await runCountdown(3, 'Get Ready: Face Front');
    setScanMessage('Capturing...');
    await new Promise(r => setTimeout(r, 2000)); // Simulate capture duration

    await runCountdown(3, 'Now, Turn 360° Slowly');
    setScanMessage('Scanning...');
    await new Promise(r => setTimeout(r, 5000)); // Simulate 360 capture

    // For this demonstration, we'll return inaccurate measurements to trigger the retry suggestion.
    const finalMeasurements = {
        upperTorsoCircumferenceCm: inaccurateMeasurements.bust,
        hipCircumferenceCm: inaccurateMeasurements.hip,
        shoulderWidthCm: inaccurateMeasurements.shoulderWidth,
        sleeveLengthCm: inaccurateMeasurements.sleeveLength,
        torsoLengthCm: inaccurateMeasurements.torsoLength,
        inseamCm: inaccurateMeasurements.inseam,
    };
    onComplete(finalMeasurements, 'poor');
  };

  const runCountdown = (duration: number, message: string) => {
    return new Promise<void>(resolve => {
      setScanStage('countdown');
      setScanMessage(message);
      setCountdown(duration);
      let count = duration;
      const interval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(interval);
          setScanStage('capturing');
          resolve();
        }
      }, 1000);
    });
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const resetScan = () => {
    setScanStage('idle');
    setScanMessage("Let's get your measurements.");
    // Re-enable camera if it was stopped
    if (!videoRef.current?.srcObject) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } } });
          if (videoRef.current) videoRef.current.srcObject = stream;
          setHasCameraPermission(true);
        } catch (error) {
          setHasCameraPermission(false);
        }
      };
      getCameraPermission();
    }
  };
  
  if (scanStage === 'processing') {
      // This state is now handled in the page, but we keep a non-functional return just in case.
      return null;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl overflow-hidden">
      <CardContent className="p-0 flex flex-col md:grid md:grid-cols-2">
        <div className="relative aspect-[9/16] md:aspect-auto bg-gray-900 flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover transform scale-x-[-1]" autoPlay playsInline muted />
          
          {hasCameraPermission === null && (
             <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white text-center p-8">
                <Loader2 className="size-24 animate-spin" />
                <h2 className="text-3xl font-bold mt-4">Requesting Camera...</h2>
             </div>
          )}

          {(scanStage === 'countdown' || scanStage === 'capturing' || scanStage === 'starting') && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white text-center p-8">
              <h2 className="text-3xl font-bold">{scanMessage}</h2>
              {scanStage === 'countdown' && <p className="text-8xl font-mono font-bold mt-4">{countdown}</p>}
              {scanStage === 'capturing' && <Camera className="size-24 mt-4 animate-pulse" />}
              {scanStage === 'starting' && <Loader2 className="size-24 mt-4 animate-spin" />}
            </div>
          )}

          {scanStage === 'idle' && hasCameraPermission && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white text-center p-8">
              <UserCheck size={96} className="text-primary" />
              <h2 className="text-3xl font-bold">Ready for your scan?</h2>
              <p className="mt-2 text-foreground/80">Follow the on-screen instructions for best results.</p>
            </div>
          )}
          
          {hasCameraPermission === false && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white text-center p-8">
              <Alert variant="destructive" className="max-w-sm">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>Please allow camera access in your browser to start the scan.</AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 flex flex-col justify-center space-y-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-extrabold font-headline tracking-tight">Hands-Free Scan</h1>
            <p className="text-foreground/70 mt-2">Enter your height, and we’ll guide you through the rest. For best results, wear form-fitting clothes.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="heightInput" className="block text-sm font-medium text-foreground/80">Your Height (140-210 cm)</label>
            <Input
              type="number"
              id="heightInput"
              value={userHeight}
              onChange={(e) => setUserHeight(e.target.value)}
              placeholder="e.g., 170"
              disabled={scanStage !== 'idle'}
              min="140"
              max="210"
            />
          </div>

          {scanStage === 'idle' ? (
            <Button size="lg" onClick={startScan} disabled={!hasCameraPermission} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Camera className="mr-2" />
              Start Scan
            </Button>
          ) : (
            <Button size="lg" onClick={resetScan} variant="outline" className="w-full">
              <X className="mr-2" />
              Cancel Scan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
