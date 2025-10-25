import type { Metadata } from 'next';
import './globals.css';
import { Alegreya } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import { UserProvider } from '@/contexts/UserContext';

const alegreya = Alegreya({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800', '900'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'FitVerse - AI-Powered Perfect Fit',
  description:
    'Experience the future of fashion with AI-powered body scanning and virtual try-on. Perfect fit, guaranteed.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          alegreya.variable
        )}
      >
        <UserProvider>
          <Header />
          <main>{children}</main>
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
