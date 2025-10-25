'use client';

import { useState } from 'react';
import Image from 'next/image';
import { generateTryOnImage } from '@/ai/flows/generate-try-on-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, ShoppingCart, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Fabric, Garment } from '@/lib/data';
import { fabrics as allFabrics } from '@/lib/data';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

type Fit = 'truefit' | 'slim' | 'loose';
type View = 'front' | 'side' | 'back' | '3/4';

interface TryOnInterfaceProps {
  garment: Garment;
}

export default function TryOnInterface({ garment }: TryOnInterfaceProps) {
  const compatibleFabrics = allFabrics.filter(f => garment.compatibleFabrics.includes(f.id));
  
  const [selectedFabric, setSelectedFabric] = useState<Fabric>(compatibleFabrics[0]);
  const [selectedFit, setSelectedFit] = useState<Fit>('truefit');
  const [selectedView, setSelectedView] = useState<View>('front');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { addCredits, addToCart } = useUser();
  const { user: firebaseUser } = useAuth();
  const router = useRouter();

  const userModelImage = PlaceHolderImages.find((img) => img.id === 'user-model-1');
  const garmentImage = PlaceHolderImages.find((img) => img.id === garment.imageId);
  const tryOnResultImage = PlaceHolderImages.find((img) => img.id === 'try-on-result-1');

  const handleGenerate = async () => {
    if (!firebaseUser) {
      router.push(`/login?redirect=/try-on/${garment.id}`);
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to generate a try-on.",
      });
      return;
    }

    setLoading(true);
    setGeneratedImage(null);

    try {
      const mockDataUri = "data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==";
      const result = await generateTryOnImage({
        userBodyDataUri: mockDataUri,
        garmentTemplateDataUri: mockDataUri,
        fabricTextureDataUri: mockDataUri,
        fit: selectedFit,
        views: [selectedView],
      });
      setGeneratedImage(tryOnResultImage?.imageUrl ?? result.imageUrl);
    } catch (error) {
      console.error("Failed to generate try-on image:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate the try-on image. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddToCart = () => {
    if (!firebaseUser) {
      router.push(`/login?redirect=/try-on/${garment.id}`);
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to add items to your cart.',
      });
      return;
    }

    addToCart(garment, selectedFabric);

    if(garment.price >= 3500) {
      addCredits(500);
      toast({
        title: "Bonus Credits Added!",
        description: `You've earned 500 bonus credits for your order of ₹${garment.price.toLocaleString()} or more!`
      })
    } else {
       toast({
        title: "Added to Cart",
        description: `${garment.name} has been added to your cart.`
      });
    }
  }

  const displayImage = generatedImage ?? userModelImage?.imageUrl ?? '/placeholder.svg';

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
      <Card className="shadow-lg sticky top-24">
        <CardContent className="p-4">
          <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-secondary">
            <Image
              src={displayImage}
              alt="Virtual try-on model"
              fill
              className="object-cover transition-opacity duration-500"
              data-ai-hint={generatedImage ? "woman dress" : "person standing"}
            />
            {loading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                <Loader2 className="size-12 animate-spin" />
                <p className="mt-4 text-lg font-semibold">Generating your look...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{garment.brand}</p>
          <h1 className="text-4xl font-extrabold tracking-tight font-headline">{garment.name}</h1>
          <p className="mt-2 text-2xl font-semibold text-primary">₹{garment.price.toLocaleString()}</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold font-headline">1. Choose Fabric</h3>
          <div className="flex flex-wrap gap-2">
            {compatibleFabrics.map((fabric) => (
              <Button
                key={fabric.id}
                variant={selectedFabric.id === fabric.id ? 'default' : 'outline'}
                onClick={() => setSelectedFabric(fabric)}
              >
                {fabric.name}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold font-headline">2. Select Your Fit</h3>
           <RadioGroup value={selectedFit} onValueChange={(v: Fit) => setSelectedFit(v)} className="flex gap-4">
            {(['slim', 'truefit', 'loose'] as Fit[]).map(fit => (
              <Label key={fit} htmlFor={`fit-${fit}`} className="flex-1 cursor-pointer">
                <Card className={`p-4 transition-all ${selectedFit === fit ? 'border-primary ring-2 ring-primary' : 'hover:border-primary/50'}`}>
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value={fit} id={`fit-${fit}`} />
                    <span className="font-medium capitalize">{fit === 'truefit' ? 'True Fit' : fit}</span>
                  </div>
                </Card>
              </Label>
            ))}
          </RadioGroup>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold font-headline">3. Choose View</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
             {(['front', 'side', 'back', '3/4'] as View[]).map(view => (
                 <Button key={view} variant={selectedView === view ? 'secondary' : 'outline'} onClick={()=> setSelectedView(view)} className="capitalize">{view}</Button>
             ))}
          </div>
        </div>

        <div className="space-y-4 pt-4">
           <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleGenerate} disabled={loading}>
            <Sparkles className="mr-2 size-5" />
            {loading ? 'Generating...' : 'Generate Try-On'}
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 size-5" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
