'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!authLoading && auth && !recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          },
          'expired-callback': () => {
            toast({
              title: 'reCAPTCHA Expired',
              description: 'Please try sending the OTP again.',
            });
          },
        }
      );
      recaptchaVerifierRef.current.render().catch((error) => {
        console.error("reCAPTCHA render error:", error);
        toast({
          variant: "destructive",
          title: "reCAPTCHA Error",
          description: "Could not render reCAPTCHA. Please refresh and try again.",
        });
      });
    }
  }, [auth, authLoading, toast]);

  const handleSendOtp = async () => {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Authentication service is not ready. Please try again.',
      });
      return;
    }
    setLoading(true);

    try {
      const verifier = recaptchaVerifierRef.current;
      if (!verifier) {
        throw new Error("reCAPTCHA verifier not initialized.");
      }
      
      // The Indian country code is +91
      const fullPhoneNumber = `+91${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        verifier
      );
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast({
        title: 'OTP Sent',
        description: 'An OTP has been sent to your phone number.',
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to send OTP. Please try again.',
      });
       if (recaptchaVerifierRef.current) {
        // Reset the reCAPTCHA verifier widget
        recaptchaVerifierRef.current.render().then(widgetId => {
          if (typeof (window as any).grecaptcha !== 'undefined') {
            (window as any).grecaptcha.reset(widgetId);
          }
        });
      }

    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      toast({
        title: 'Success!',
        description: 'You have been signed in successfully.',
      });
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Invalid OTP. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center py-24">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">
            {otpSent ? 'Enter OTP' : 'Sign In'}
          </CardTitle>
          <CardDescription>
            {otpSent
              ? 'Enter the 6-digit code sent to your phone.'
              : 'Enter your phone number to receive a one-time password.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!otpSent ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="p-2 border border-r-0 rounded-l-md bg-secondary/50 text-sm">
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                    className="rounded-l-none"
                  />
                </div>
                <Button
                  onClick={handleSendOtp}
                  disabled={loading || authLoading || !phoneNumber}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="mr-2 h-4 w-4" />
                  )}
                  Send OTP
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                />
                <Button
                  onClick={handleVerifyOtp}
                  disabled={loading || !otp}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Verify OTP
                </Button>
                <Button
                  variant="link"
                  onClick={() => {
                    setOtpSent(false);
                    setPhoneNumber('');
                    setOtp('');
                  }}
                >
                  Change phone number
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
