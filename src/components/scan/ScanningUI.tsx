'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, CircleDashed, MoveHorizontal, Sun, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const messages = [
  "Let's begin. Stand in the center and slowly start turning.",
  "Great pace! Keep it steady.",
  "Halfway there. You're doing great.",
  "Almost done, just a little more.",
  "Scan complete! Finalizing your model.",
];

interface ScanningUIProps {
  onComplete: () => void;
}

const FeedbackIndicator = ({ icon, label, status }: { icon: React.ReactNode, label: string, status: 'good' | 'ok' | 'bad' }) => {
    const colorClasses = {
        good: 'text-green-500',
        ok: 'text-yellow-500',
        bad: 'text-red-500'
    };
    return (
        <div className={`flex items-center gap-2 p-2 rounded-lg bg-background/50 text-sm ${colorClasses[status]}`}>
            {icon}
            <span>{label}</span>
        </div>
    );
};


export default function ScanningUI({ onComplete }: ScanningUIProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  
  useEffect(() => {
    if (progress >= 100) {
      setTimeout(onComplete, 1500);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / 25; // 25 second scan
        if (newProgress >= 100) return 100;
        if (newProgress >= 75 && messageIndex < 3) setMessageIndex(3);
        else if (newProgress >= 50 && messageIndex < 2) setMessageIndex(2);
        else if (newProgress >= 25 && messageIndex < 1) setMessageIndex(1);
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete, progress, messageIndex]);
  
  useEffect(() => {
    if(progress >= 100) {
      setMessageIndex(4);
    }
  }, [progress]);

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline mb-4">
        Scanning in Progress
      </h1>
      <p className="text-lg text-foreground/80 mb-8">{messages[messageIndex]}</p>

      <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="stroke-current text-border" strokeWidth="2" fill="none" />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            className="stroke-current text-primary"
            strokeWidth="2"
            fill="none"
            strokeDasharray="283"
            strokeDashoffset={283 * (1 - progress / 100)}
            transform="rotate(-90 50 50)"
            transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>

        <div className="relative w-[70%] h-[90%] flex items-center justify-center">
           <svg
              viewBox="0 0 184 450"
              className="h-full text-primary/20"
              fill="currentColor"
            >
              <path d="M92 450c50.804 0 92-41.196 92-92V92C184 41.196 142.804 0 92 0S0 41.196 0 92v266c0 50.804 41.196 92 92 92zM92 434c-41.928 0-76-34.072-76-76V92c0-41.928 34.072-76 76-76s76 34.072 76 76v266c0 41.928-34.072 76-76 76z" />
              <path d="M92 64a27 27 0 100 54 27 27 0 000-54zm0 42a15 15 0 110-30 15 15 0 010 30z" />
            </svg>
        </div>
        
        <div className="absolute top-4 right-4 flex flex-col gap-2">
            <FeedbackIndicator icon={<Sun className="size-4" />} label="Lighting" status="good" />
            <FeedbackIndicator icon={<MoveHorizontal className="size-4" />} label="Pace" status="good" />
            <FeedbackIndicator icon={<CircleDashed className="size-4" />} label="Stability" status="ok" />
        </div>
      </div>
      
      {progress >= 100 && (
          <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="mt-8 flex items-center gap-2 text-xl text-green-500">
              <CheckCircle />
              <span>Scan Complete!</span>
          </motion.div>
      )}

    </div>
  );
}
