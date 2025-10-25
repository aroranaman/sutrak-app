'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gem, LogIn, LogOut, ScanLine, Shirt, User } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function Header() {
  const { user, credits, login, logout } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Gem className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block font-headline text-lg">
              FitVerse
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
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                <Gem className="h-4 w-4 text-accent" />
                <span className="font-semibold">{credits}</span>
                <span className="text-foreground/60">Credits</span>
              </div>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log Out</span>
              </Button>
            </>
          ) : (
            <Button onClick={login}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
