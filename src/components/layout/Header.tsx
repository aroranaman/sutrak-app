'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gem, LogIn, LogOut, User } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import CartSheet from './CartSheet';
import { HornbillIcon } from '../icons/HornbillIcon';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import ProfileSheet from './ProfileSheet';
import { resetRecaptcha } from '@/app/login/send-otp';

export default function Header() {
  const { user: appUser, credits } = useUser();
  const { user: firebaseUser, signOut } = useAuth();
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleSignOut = async () => {
    await signOut();
    resetRecaptcha(); // Clear recaptcha on sign out
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <HornbillIcon className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block font-headline text-lg">
              Sutrak
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/catalog"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Catalog
            </Link>
            <Link
              href="/scan"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Get Measured
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          {firebaseUser ? (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                <Gem className="h-4 w-4 text-primary" />
                <span className="font-semibold">{credits}</span>
                <span className="text-foreground/60">Credits</span>
              </div>
              <ProfileSheet />
              <CartSheet />
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log Out</span>
              </Button>
            </>
          ) : (
            <Button onClick={handleSignIn}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
