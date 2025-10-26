'use client';

import {
  Camera,
  Maximize,
  PersonStanding,
  Shirt,
  Smartphone,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const tutorialSteps = [
  {
    icon: <Maximize className="size-8 text-primary" />,
    title: 'Find Your Space',
    description: 'Stand 2.5-3 meters (8-10 feet) away to ensure your whole body is in frame.',
  },
  {
    icon: <Smartphone className="size-8 text-primary" />,
    title: 'Phone Position',
    description: 'Place your phone upright on a stable surface at hip height for the best angle.',
  },
  {
    icon: <Shirt className="size-8 text-primary" />,
    title: 'Fitted Clothing',
    description: 'Wear form-fitting clothes (like leggings and a tank top) for the most accurate scan.',
  },
  {
    icon: <PersonStanding className="size-8 text-primary" />,
    title: 'Assume the Pose',
    description: 'Stand in a T-pose with feet shoulder-width apart and arms relaxed at a 15-20° angle.',
  },
   {
    icon: <Sun className="size-8 text-primary" />,
    title: 'Good Lighting',
    description: 'Ensure you are in a well-lit room. Avoid strong backlighting or harsh shadows.',
  },
  {
    icon: <Camera className="size-8 text-primary" />,
    title: 'Hair Up',
    description: 'If you have long hair, please tie it up so your neck and shoulders are visible.',
  },
];

interface ScanTutorialProps {
  onComplete: () => void;
}

export default function ScanTutorial({ onComplete }: ScanTutorialProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
          Prepare for Your Scan
        </h1>
        <p className="mt-4 text-lg text-foreground/80">
          Follow these simple steps to ensure the best results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {tutorialSteps.map((step, index) => (
          <Card key={index} className="bg-card shadow-md">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              {step.icon}
              <CardTitle className="text-xl font-headline">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button size="lg" onClick={onComplete} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Camera className="mr-2 size-5" /> I'm Ready to Scan
        </Button>
      </div>
    </div>
  );
}
