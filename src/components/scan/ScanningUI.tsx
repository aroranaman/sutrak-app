'use client';

import { useState, useEffect, useRef } from 'react';
import { Pose, POSE_LANDMARKS } from '@mediapipe/pose';
import { POSE_CONNECTIONS } from '@mediapipe/pose';
import * as drawingUtils from '@mediapipe/drawing_utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Camera, UserCheck, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


interface ScanningUIProps {
    onComplete: (results: any) => void;
}

type ScanStage = 'idle' | 'starting' | 'countdown' | 'capturing' | 'processing';

export default function ScanningUI({ onComplete }: ScanningUIProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(true);
    const [scanStage, setScanStage] = useState<ScanStage>('idle');
    const [countdown, setCountdown] = useState(5);
    const [scanMessage, setScanMessage] = useState("Let's get your measurements.");
    const [userHeight, setUserHeight] = useState('170');
    const [processingMessage, setProcessingMessage] = useState('');
    const { toast } = useToast();

    // --- State for processing
    const poseRef = useRef<Pose | null>(null);
    const frontImageRef = useRef<HTMLImageElement>(new Image());
    const sideImageRef = useRef<HTMLImageElement>(new Image());
    const frontResultsRef = useRef<any>(null);
    const sideResultsRef = useRef<any>(null);
    let processingState: 'idle' | 'processingFront' | 'processingSide' = 'idle';

    // --- Initialize MediaPipe Pose ---
    useEffect(() => {
        const pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        pose.onResults(onPoseResults);
        poseRef.current = pose;
    }, []);

    const onPoseResults = (results: any) => {
        if (processingState === 'processingFront') {
            frontResultsRef.current = results;
            drawResults(results, frontImageRef.current);

            if (!results.poseLandmarks) {
                toast({ variant: 'destructive', title: "Scan Error", description: "No person detected in the front view. Please try again." });
                resetScan();
                return;
            }

            setProcessingMessage("Processing side view...");
            processingState = 'processingSide';
            poseRef.current?.send({ image: sideImageRef.current });

        } else if (processingState === 'processingSide') {
            sideResultsRef.current = results;
            drawResults(results, sideImageRef.current);
            if (!results.poseLandmarks) {
                toast({ variant: 'destructive', title: "Scan Error", description: "No person detected in the side view. Please try again." });
                resetScan();
                return;
            }

            calculateMeasurements(frontResultsRef.current, sideResultsRef.current);
            processingState = 'idle';
        }
    };

    const drawResults = (results: any, image: HTMLImageElement) => {
        if (!canvasRef.current) return;
        const canvasCtx = canvasRef.current.getContext('2d');
        if (!canvasCtx) return;

        canvasRef.current.width = image.width;
        canvasRef.current.height = image.height;
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasCtx.drawImage(image, 0, 0, canvasRef.current.width, canvasRef.current.height);
        if (results.poseLandmarks) {
            drawingUtils.drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
            drawingUtils.drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
        }
        canvasCtx.restore();
    };
    
    // --- Camera & Scan Flow ---
    const startScan = async () => {
        if (!userHeight || parseInt(userHeight) <= 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid Height',
                description: 'Please enter a valid height in cm.',
            });
            return;
        }

        setScanStage('starting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setHasCameraPermission(true);
            runCountdownSequence();
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            setScanStage('idle');
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings.',
            });
        }
    };

    const runCountdownSequence = async () => {
        // Countdown for Front
        await runCountdown(5, "Get Ready: Face Front");
        setScanMessage('Capturing Front...');
        captureImage(frontImageRef.current);
        await new Promise(r => setTimeout(r, 500));

        // Countdown for Side
        await runCountdown(5, "Now, Turn to Your Side");
        setScanMessage('Capturing Side...');
        captureImage(sideImageRef.current);
        await new Promise(r => setTimeout(r, 500));

        stopCamera();
        setScanStage('processing');
        processImages();
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

    const captureImage = (imgElement: HTMLImageElement) => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
        imgElement.src = canvas.toDataURL('image/png');
    };
    
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }

    const resetScan = () => {
        stopCamera();
        setScanStage('idle');
        setScanMessage("Let's get your measurements.");
        frontResultsRef.current = null;
        sideResultsRef.current = null;
    }

    // --- Processing & Calculation ---
    const processImages = () => {
        setProcessingMessage('Analyzing scan data...');
        processingState = 'processingFront';
        poseRef.current?.send({ image: frontImageRef.current });
    };

    const getCalibration = (landmarks: any[], canvasHeight: number, userHeightCm: number) => {
        const nose = landmarks[POSE_LANDMARKS.NOSE];
        const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
        const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
        
        if (!nose || !leftAnkle || !rightAnkle) return 0;
    
        const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
        const pixelHeight = (avgAnkleY - nose.y) * canvasHeight;
        
        if (pixelHeight <= 0) return 0;
        
        return userHeightCm / pixelHeight; // cmPerPixel
    }
    
    const calculateMeasurements = (front: any, side: any) => {
        const frontLms = front.poseLandmarks;
        const sideLms = side.poseLandmarks;
        const frontCanvasWidth = frontImageRef.current.width;
        const frontCanvasHeight = frontImageRef.current.height;
        const sideCanvasWidth = sideImageRef.current.width;
        const sideCanvasHeight = sideImageRef.current.height;

        function getPixelDistance(lm1: any, lm2: any) {
            if (!lm1 || !lm2) return 0;
            const dx = (lm1.x - lm2.x) * frontCanvasWidth;
            const dy = (lm1.y - lm2.y) * frontCanvasHeight;
            return Math.sqrt(dx * dx + dy * dy);
        }

        const cmPerPixelFront = getCalibration(frontLms, frontCanvasHeight, parseFloat(userHeight));
        const cmPerPixelSide = getCalibration(sideLms, sideCanvasHeight, parseFloat(userHeight));

        if (cmPerPixelFront === 0 || cmPerPixelSide === 0) {
            toast({ variant: 'destructive', title: 'Calibration Error', description: 'Could not calibrate from images. Ensure your full body is visible.' });
            resetScan();
            return;
        }

        const f_L_Shoulder = frontLms[POSE_LANDMARKS.LEFT_SHOULDER];
        const f_R_Shoulder = frontLms[POSE_LANDMARKS.RIGHT_SHOULDER];
        const f_L_Hip = frontLms[POSE_LANDMARKS.LEFT_HIP];
        const f_R_Hip = frontLms[POSE_LANDMARKS.RIGHT_HIP];
        const f_L_Elbow = frontLms[POSE_LANDMARKS.LEFT_ELBOW];
        const f_L_Wrist = frontLms[POSE_LANDMARKS.LEFT_WRIST];
        const f_L_Ankle = frontLms[POSE_LANDMARKS.LEFT_ANKLE];
        
        const s_L_Shoulder = sideLms[POSE_LANDMARKS.LEFT_SHOULDER];
        const s_R_Shoulder = sideLms[POSE_LANDMARKS.RIGHT_SHOULDER];
        const s_L_Hip = sideLms[POSE_LANDMARKS.LEFT_HIP];
        const s_R_Hip = sideLms[POSE_LANDMARKS.RIGHT_HIP];

        const shoulderWidthPx = Math.abs(f_L_Shoulder.x - f_R_Shoulder.x) * frontCanvasWidth;
        const shoulderWidthCm = shoulderWidthPx * cmPerPixelFront;
        const shoulderToElbowPx = getPixelDistance(f_L_Shoulder, f_L_Elbow);
        const elbowToWristPx = getPixelDistance(f_L_Elbow, f_L_Wrist);
        const sleeveLengthCm = (shoulderToElbowPx + elbowToWristPx) * cmPerPixelFront;
        const shoulderMidY = (f_L_Shoulder.y + f_R_Shoulder.y) / 2;
        const hipMidY = (f_L_Hip.y + f_R_Hip.y) / 2;
        const torsoLengthPx = Math.abs(hipMidY - shoulderMidY) * frontCanvasHeight;
        const torsoLengthCm = torsoLengthPx * cmPerPixelFront;
        const inseamPx = Math.abs(f_L_Ankle.y - f_L_Hip.y) * frontCanvasHeight;
        const inseamCm = inseamPx * cmPerPixelFront * 0.9; // Correction factor

        const shoulderDepthPx = Math.abs(s_L_Shoulder.x - s_R_Shoulder.x) * sideCanvasWidth;
        const shoulderDepthCm = shoulderDepthPx * cmPerPixelSide;
        const bustA = shoulderWidthCm / 2;
        const bustB = shoulderDepthCm / 2;
        const upperTorsoCircumferenceCm = 2 * Math.PI * Math.sqrt((Math.pow(bustA, 2) + Math.pow(bustB, 2)) / 2);

        const hipWidthPx = Math.abs(f_L_Hip.x - f_R_Hip.x) * frontCanvasWidth;
        const hipWidthCm = hipWidthPx * cmPerPixelFront;
        const hipDepthPx = Math.abs(s_L_Hip.x - s_R_Hip.x) * sideCanvasWidth;
        const hipDepthCm = hipDepthPx * cmPerPixelSide;
        const hipA = hipWidthCm / 2;
        const hipB = hipDepthCm / 2;
        const hipCircumferenceCm = 2 * Math.PI * Math.sqrt((Math.pow(hipA, 2) + Math.pow(hipB, 2)) / 2);

        onComplete({
            shoulderWidthCm,
            sleeveLengthCm,
            torsoLengthCm,
            inseamCm,
            upperTorsoCircumferenceCm,
            hipCircumferenceCm,
        });
    };

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-2xl overflow-hidden">
            <CardContent className="p-0 md:grid md:grid-cols-2">
                <div className="relative aspect-[9/16] md:aspect-auto bg-gray-900 flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover transform scale-x-[-1]" autoPlay playsInline muted />
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover hidden" />

                    {(scanStage === 'countdown' || scanStage === 'capturing' || scanStage === 'starting') && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white text-center p-8">
                            <h2 className="text-3xl font-bold">{scanMessage}</h2>
                            {scanStage === 'countdown' && <p className="text-8xl font-mono font-bold mt-4">{countdown}</p>}
                            {scanStage === 'capturing' && <Camera className="size-24 mt-4 animate-pulse" />}
                             {scanStage === 'starting' && <Loader2 className="size-24 mt-4 animate-spin" />}
                        </div>
                    )}

                    {scanStage === 'idle' && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white text-center p-8">
                             <UserCheck size={96} className="mb-6 text-primary" />
                             <h2 className="text-3xl font-bold">Ready for your scan?</h2>
                             <p className="mt-2 text-foreground/80">Follow the on-screen instructions for best results.</p>
                        </div>
                    )}
                    
                    {scanStage === 'processing' && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white text-center p-8">
                           <Loader2 className="size-24 animate-spin text-primary" />
                           <p className="mt-6 text-2xl font-semibold">{processingMessage}</p>
                        </div>
                    )}
                    
                    {!hasCameraPermission && (
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
                        <label htmlFor="heightInput" className="block text-sm font-medium text-foreground/80">Your Height (in cm)</label>
                        <Input
                            type="number"
                            id="heightInput"
                            value={userHeight}
                            onChange={(e) => setUserHeight(e.target.value)}
                            placeholder="e.g., 170"
                            disabled={scanStage !== 'idle'}
                        />
                    </div>
                    
                    {scanStage === 'idle' ? (
                        <Button size="lg" onClick={startScan} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
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

    