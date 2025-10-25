'use client';
import { useState } from 'react';
import ScanTutorial from '@/components/scan/ScanTutorial';
import ScanningUI from '@/components/scan/ScanningUI';
import ScanProcessing from '@/components/scan/ScanProcessing';
import MeasurementProfile from '@/components/scan/MeasurementProfile';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';

type ScanStep = 'tutorial' | 'scanning' | 'processing' | 'results';

export default function ScanPage() {
  const [step, setStep] = useState<ScanStep>('tutorial');
  const [measurementResults, setMeasurementResults] = useState(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  const handleScriptsLoaded = () => {
    setScriptsLoaded(true);
  };

  const onTutorialComplete = () => setStep('scanning');
  const onScanComplete = (results: any) => {
    setMeasurementResults(results);
    setStep('processing');
  };
  const onProcessingComplete = () => setStep('results');

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"
        crossOrigin="anonymous"
        onLoad={handleScriptsLoaded}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
        crossOrigin="anonymous"
        onLoad={handleScriptsLoaded}
      />
      <div className="container py-12">
        <AnimatePresence mode="wait">
          {step === 'tutorial' && (
            <motion.div
              key="tutorial"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <ScanTutorial onComplete={onTutorialComplete} />
            </motion.div>
          )}
          {step === 'scanning' && scriptsLoaded && (
            <motion.div
              key="scanning"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <ScanningUI onComplete={onScanComplete} />
            </motion.div>
          )}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <ScanProcessing onComplete={onProcessingComplete} />
            </motion.div>
          )}
          {step === 'results' && (
            <motion.div
              key="results"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <MeasurementProfile
                onNewScan={() => setStep('tutorial')}
                measurements={measurementResults}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
