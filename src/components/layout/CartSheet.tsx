
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useUser } from '@/contexts/UserContext';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '../ui/input';
import Link from 'next/link';

export default function CartSheet() {
  const { cart, removeFromCart, updateQuantity } = useUser();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.garment.price * item.quantity,
    0
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">Open Cart</span>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-headline">Shopping Cart</SheetTitle>
          <SheetDescription>
            Review your items before proceeding to checkout.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto -mx-6 px-6 divide-y">
          {cart.length > 0 ? (
            cart.map(item => {
              const image = PlaceHolderImages.find(
                img => img.id === item.garment.imageId
              );
              return (
                <div key={item.id} className="py-6 flex gap-4">
                  <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                    {image && (
                      <Image
                        src={image.imageUrl}
                        alt={item.garment.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold font-headline">{item.garment.name}</h4>
                      <p className="text-sm text-foreground/70">
                        Fabric: {item.fabric.name}
                      </p>
                      <p className="text-sm text-foreground/70">
                        Price: ₹{item.garment.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                className="h-7 w-12 text-center p-0"
                            />
                             <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                         <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive/70 hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-16 w-16 text-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold font-headline">Your cart is empty</h3>
              <p className="text-foreground/60">
                Add some items to get started.
              </p>
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <SheetFooter className="border-t pt-6 mt-auto">
            <div className="w-full space-y-4">
                <div className="flex justify-between font-semibold text-lg">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                </div>
                 <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
