
'use client';
import { useState, useEffect, useCallback } from 'react';
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

  const handleScriptsLoaded = useCallback(() => {
    setScriptsLoaded(true);
  }, []);

  useEffect(() => {
    // Check if the scripts are already loaded when the component mounts
    // This handles cases where scripts are cached by the browser.
    if ((window as any).Pose && (window as any).drawConnectors) {
      handleScriptsLoaded();
    }
  }, [handleScriptsLoaded]);

  const onTutorialComplete = () => {
    if (scriptsLoaded) {
      setStep('scanning');
    } else {
      // If scripts are not loaded yet, wait for them.
      // This is a fallback, useEffect should handle most cases.
      const checkScripts = setInterval(() => {
        if ((window as any).Pose && (window as any).drawConnectors) {
          handleScriptsLoaded();
          setStep('scanning');
          clearInterval(checkScripts);
        }
      }, 100);
    }
  };
  
  const onScanComplete = (results: any) => {
    // Map the incoming detailed keys to the simplified keys expected by MeasurementProfile
    const mappedResults = {
      bust: results.upperTorsoCircumferenceCm,
      hip: results.hipCircumferenceCm,
      shoulder: results.shoulderWidthCm,
      sleeve: results.sleeveLengthCm,
      torso: results.torsoLengthCm,
      inseam: results.inseamCm,
    };
    setMeasurementResults(mappedResults);
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
        strategy="lazyOnload"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
        crossOrigin="anonymous"
        onLoad={handleScriptsLoaded}
        strategy="lazyOnload"
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
          {step === 'results' && measurementResults && (
            <motion.div
              key="results"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <MeasurementProfile
                measured={measurementResults}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
