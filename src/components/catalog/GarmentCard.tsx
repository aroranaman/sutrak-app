import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Garment } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface GarmentCardProps {
  garment: Garment;
}

export default function GarmentCard({ garment }: GarmentCardProps) {
  const image = PlaceHolderImages.find((img) => img.id === garment.imageId);

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <Link href={`/try-on/${garment.id}`}>
          <div className="aspect-[5/7] relative">
            {image ? (
              <Image
                src={image.imageUrl}
                alt={garment.name}
                fill
                className="object-cover"
                data-ai-hint={image.imageHint}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full bg-secondary" />
            )}
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline leading-tight mb-1">{garment.name}</CardTitle>
        <p className="text-sm text-foreground/70">{garment.brand}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="text-lg font-semibold text-primary">₹{garment.price.toLocaleString()}</p>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/try-on/${garment.id}`}>Try On</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
