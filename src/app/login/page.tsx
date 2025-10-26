'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ConfirmationResult } from 'firebase/auth';
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
import { sendOtp, resetRecaptcha } from './send-otp';
import { grantJoinBonusIfFirstLogin } from '@/lib/grantJoinBonus';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      // The Indian country code is +91
      const fullPhoneNumber = `+91${phoneNumber}`;
      const confirmation = await sendOtp(fullPhoneNumber);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast({
        title: 'OTP Sent',
        description: 'An OTP has been sent to your phone number.',
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
       const message = String(error?.message || 'Failed to send OTP.');
      if (message.toLowerCase().includes('offline')) {
          toast({
            variant: 'destructive',
            title: 'Network Error',
            description: 'Could not connect to the server. Please check your connection and try again.',
            duration: 9000,
          });
      } else {
         toast({
            variant: 'destructive',
            title: 'Error Sending OTP',
            description: message,
          });
      }
      // Reset reCAPTCHA on error
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) return;
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      await grantJoinBonusIfFirstLogin(result.user);

      toast({
        title: 'Success!',
        description: 'You have been signed in successfully.',
      });
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      const message = String(error?.message || 'Invalid OTP. Please try again.');
       if (message.toLowerCase().includes('offline')) {
           toast({
            variant: 'destructive',
            title: 'Network Error',
            description: 'Could not verify OTP. The client appears to be offline.',
             duration: 9000,
          });
       } else {
           toast({
            variant: 'destructive',
            title: 'Error Verifying OTP',
            description: message,
          });
       }
    } finally {
      setLoading(false);
    }
  };
  
  const handlePhoneNumberChange = () => {
    setOtpSent(false);
    setOtp('');
    setConfirmationResult(null);
    resetRecaptcha();
  }

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
                  disabled={loading || !phoneNumber}
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
                  onClick={handlePhoneNumberChange}
                >
                  Change phone number
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* This container must be present in the DOM for reCAPTCHA to work. */}
      <div id="recaptcha-container" />
    </div>
  );
}
