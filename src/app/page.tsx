import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, ScanLine, Shirt, ShoppingBag } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import GarmentCard from '@/components/catalog/GarmentCard';
import { garments } from '@/lib/data';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-1');

  const featureCards = [
    {
      icon: <ScanLine className="size-8 text-primary" />,
      title: '360° Body Scan',
      description:
        'Our privacy-first scan captures your unique measurements in under 30 seconds. No photos stored, ever.',
    },
    {
      icon: <Shirt className="size-8 text-primary" />,
      title: 'Virtual Try-On',
      description:
        'See how clothes fit your exact body shape in photorealistic detail before you buy.',
    },
    {
      icon: <ShoppingBag className="size-8 text-primary" />,
      title: 'Made-to-Order',
      description:
        'Every piece is custom-made to your measurements, reducing waste and ensuring a perfect fit.',
    },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <section className="relative w-full pt-24 pb-12 md:py-24 lg:py-32 xl:py-48">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover object-center -z-10"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="container px-4 md:px-6 relative text-center">
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
              The End of "Will It Fit?"
            </h1>
            <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl">
              Sutrak brings custom-tailored fashion to your fingertips. Experience perfect fit with our revolutionary AI-powered body scanning and virtual try-on technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/scan">Try It On Me</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/catalog">Browse Catalog</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">A Revolution in Three Steps</h2>
            <p className="max-w-[900px] text-foreground/80 text-base/relaxed md:text-xl/relaxed">
              From your living room to our design studio, getting the perfect fit has never been easier.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature, index) => (
              <Card key={index} className="bg-card border-none shadow-xl transform hover:-translate-y-2 transition-transform duration-300">
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    <div className="flex items-center gap-4">
                      {feature.icon}
                      <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
                    </div>
                    <p className="text-foreground/80">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Curated For You</h2>
            <p className="max-w-[900px] text-foreground/80 text-base/relaxed md:text-xl/relaxed">
              Discover unique designs from premium brands, ready to be made just for you.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {garments.slice(0, 4).map((garment) => (
              <GarmentCard key={garment.id} garment={garment} />
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Button asChild variant="link" className="text-accent text-lg">
              <Link href="/catalog">
                Explore Full Catalog <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
              Join the Fashion Revolution
            </h2>
            <p className="mx-auto max-w-[600px] text-foreground/80 text-base/relaxed md:text-xl/relaxed">
              Sign up today and receive <span className="text-accent font-bold">500 free credits</span> to start your personalized shopping journey.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
            <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/scan">Get Measured Now</Link>
            </Button>
            <p className="text-xs text-foreground/60">
              Create your first body profile and unlock the future of fit.
            </p>
          </div>
        </div>
      </section>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-foreground/60">&copy; 2024 Sutrak. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-foreground/80" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-foreground/80" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
