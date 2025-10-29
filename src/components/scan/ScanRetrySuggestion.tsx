
'use client';
import { suggestScanRetry } from '@/ai/flows/suggest-scan-retry';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

interface ScanRetrySuggestionProps {
    onRetry: () => void;
    onProceed: () => void;
}

export default function ScanRetrySuggestion({ onRetry, onProceed }: ScanRetrySuggestionProps) {
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSuggestion = async () => {
            setLoading(true);
            try {
                const result = await suggestScanRetry({
                    scanQualityScore: 0.6, // Mock low score
                    lightingConditions: 'Uneven, with strong light from one side.',
                    userPosture: 'Slightly slouched, arms too close to the body.',
                    clothingFit: 'Slightly baggy t-shirt.',
                });

                if (result.retrySuggested) {
                    setFeedback(result.feedback);
                } else {
                    onProceed(); // Should not happen with low score, but as a fallback
                }
            } catch (error) {
                console.error('Error getting scan retry suggestion:', error);
                setFeedback('There was an issue analyzing your scan. For best results, ensure good lighting and a steady posture.');
            }
            setLoading(false);
        };

        getSuggestion();
    }, [onProceed]);

    return (
        <Card className="max-w-2xl mx-auto shadow-xl border-amber-500/50">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl font-headline flex items-center gap-3 text-amber-500">
                            <AlertTriangle className="size-8" />
                            Improve Your Scan
                        </CardTitle>
                        <CardDescription>
                            We noticed a few things that could improve measurement accuracy.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center h-24">
                        <Loader2 className="size-8 animate-spin text-primary" />
                        <span className="ml-4">Analyzing scan quality...</span>
                    </div>
                ) : (
                    <div className="space-y-4 text-base p-4 bg-secondary rounded-lg">
                        <h4 className="font-semibold">Here are some suggestions for a better scan:</h4>
                        <p className="whitespace-pre-line text-foreground/90">{feedback}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-4">
                <Button variant="ghost" onClick={onProceed} disabled={loading}>
                   Proceed Anyway
                </Button>
                <Button onClick={onRetry} disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <RefreshCw className="mr-2 size-4" />
                    Retry Scan
                </Button>
            </CardFooter>
        </Card>
    );
}
