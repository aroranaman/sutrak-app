'use client';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function CheckoutPage() {
  const { cart, user } = useUser();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.garment.price * item.quantity,
    0
  );
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty.</h1>
        <p>You can't checkout without any items!</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
          Checkout
        </h1>
        <p className="mt-4 text-lg text-foreground/80">
          Please review your order and complete your purchase.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>A summary of the items in your cart.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cart.map(item => {
                const image = PlaceHolderImages.find(p => p.id === item.garment.imageId);
                return (
                  <div key={item.id} className="flex items-center gap-4">
                     <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                      {image && (
                        <Image
                          src={image.imageUrl}
                          alt={item.garment.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold">{item.garment.name}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} x ₹{item.garment.price.toLocaleString()}</p>
                    </div>
                    <p className="font-semibold">₹{(item.garment.price * item.quantity).toLocaleString()}</p>
                  </div>
                )
              })}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (18%)</span>
                <span>₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>This is a demo. No real payment will be processed.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium">Logged in as:</p>
                        <p>{user?.name ?? 'Guest'}</p>
                    </div>
                     <div>
                        <p className="text-sm font-medium">Phone:</p>
                        <p>{user?.phone ?? 'N/A'}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Place Order (Demo)
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
