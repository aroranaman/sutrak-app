'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from '../ui/progress';

const processingSteps = [
  "Analyzing 360° scan data...",
  "Constructing parametric 3D model...",
  "Refining surface details for high-fidelity...",
  "Extracting tailoring measurements...",
  "Finalizing your unique body profile...",
];

interface ScanProcessingProps {
  onComplete: () => void;
}

export default function ScanProcessing({ onComplete }: ScanProcessingProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const totalDuration = 8000; // 8 seconds
    const intervalTime = 50;
    const increment = (intervalTime / totalDuration) * 100;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }

        // Update text based on progress
        const stepIndex = Math.floor(newProgress / (100 / processingSteps.length));
        if (stepIndex !== currentStep) {
          setCurrentStep(stepIndex);
        }

        return newProgress;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onComplete, currentStep]);

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto h-[60vh]">
      <Loader2 className="size-16 animate-spin text-primary mb-8" />
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline mb-4">
        Building Your 3D Model
      </h1>
      <p className="text-lg text-foreground/80 mb-8 transition-opacity duration-500">
        {processingSteps[currentStep]}
      </p>
      <Progress value={progress} className="w-full max-w-md" />
    </div>
  );
}
