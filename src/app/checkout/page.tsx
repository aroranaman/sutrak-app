'use client';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { addEarnForOrder } from '@/actions/addEarnForOrder';

export default function CheckoutPage() {
  const { cart, user, credits, addCredits, clearCart } = useUser();
  const { user: firebaseUser } = useAuth();
  const [creditsToRedeem, setCreditsToRedeem] = useState(0);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.garment.price * item.quantity,
    0
  );
  const tax = subtotal * 0.18;
  const totalBeforeCredits = subtotal + tax;
  const total = totalBeforeCredits - creditsToRedeem;

  if (cart.length === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty.</h1>
        <p>You can't checkout without any items!</p>
      </div>
    );
  }

  const handleRedeemCredits = () => {
    const redeemAmount = Math.min(credits, Math.floor(totalBeforeCredits));
    setCreditsToRedeem(redeemAmount);
  };
  
  const handlePlaceOrder = async () => {
    if (!firebaseUser) {
        toast({
            variant: 'destructive',
            title: "Not Logged In",
            description: "Please sign in to place an order."
        });
        return;
    }

    // In a real app, this would process payment.
    // For this demo, we just deduct credits.
    if (creditsToRedeem > 0) {
        addCredits(-creditsToRedeem);
    }

    // Add earned credits if applicable
    if (subtotal >= 3500) {
        await addEarnForOrder(firebaseUser, subtotal);
        toast({
            title: "Bonus Credits Added!",
            description: `You've earned bonus credits for your order!`
        });
    }

    toast({
        title: "Order Placed!",
        description: "Thank you for your purchase (this is a demo)."
    });
    
    // Clear cart after successful order
    clearCart();
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
          Checkout
        </h1>
        <p className="mt-2 md:mt-4 text-base md:text-lg text-foreground/80">
          Please review your order and complete your purchase.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
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
               <div className="flex justify-between font-semibold">
                <span>Total Before Credits</span>
                <span>₹{totalBeforeCredits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
               {creditsToRedeem > 0 && (
                <div className="flex justify-between text-green-600">
                    <span>Credits Redeemed</span>
                    <span>- ₹{creditsToRedeem.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
               )}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Redeem Credits</CardTitle>
                    <CardDescription>Use your credit balance to get a discount. 1 Credit = ₹1.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="p-4 bg-secondary rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Available Credits</p>
                            <p className="text-3xl font-bold text-primary">{credits}</p>
                        </div>
                        {credits > 0 ? (
                             <Button onClick={handleRedeemCredits} disabled={creditsToRedeem > 0} className="w-full">
                                {creditsToRedeem > 0 ? 'Credits Applied' : 'Apply Maximum Credits'}
                            </Button>
                        ) : (
                            <p className="text-center text-muted-foreground">You have no credits to redeem.</p>
                        )}
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
                     <Button onClick={handlePlaceOrder} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Place Order (Demo)
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}