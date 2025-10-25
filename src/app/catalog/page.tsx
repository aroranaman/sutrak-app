import GarmentCard from '@/components/catalog/GarmentCard';
import { garments } from '@/lib/data';

export default function CatalogPage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
          Our Collection
        </h1>
        <p className="mt-4 text-lg text-foreground/80">
          Explore designs from top brands, ready to be virtually tried on and tailored to your exact measurements.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {garments.map((garment) => (
          <GarmentCard key={garment.id} garment={garment} />
        ))}
      </div>
    </div>
  );
}
