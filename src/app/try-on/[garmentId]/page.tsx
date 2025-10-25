import TryOnInterface from "@/components/try-on/TryOnInterface";
import { garments } from "@/lib/data";
import { notFound } from "next/navigation";

export default function TryOnPage({ params }: { params: { garmentId: string } }) {
    const garment = garments.find(g => g.id === params.garmentId);

    if (!garment) {
        notFound();
    }
    
    return (
        <div className="container py-8 md:py-12">
            <TryOnInterface garment={garment} />
        </div>
    );
}

export function generateStaticParams() {
    return garments.map(garment => ({
        garmentId: garment.id
    }));
}
