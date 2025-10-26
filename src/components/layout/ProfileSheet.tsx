'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useUser } from '@/contexts/UserContext';
import { User, Ruler } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function ProfileSheet() {
  const { profiles } = useUser();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <User className="h-5 w-5" />
          <span className="sr-only">Open Profiles</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-headline">Measurement Profiles</SheetTitle>
          <SheetDescription>
            Your saved body measurements for virtual try-ons.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto -mx-6 px-6 divide-y">
          {profiles.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {profiles.map((profile, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="font-semibold text-lg font-headline">
                    {profile.name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-base">
                      {Object.entries(profile.measurements).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg"
                        >
                          <span className="capitalize font-medium text-secondary-foreground">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="font-bold text-primary">
                            {value} cm
                          </span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Ruler className="h-16 w-16 text-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold font-headline">
                No Profiles Saved
              </h3>
              <p className="text-foreground/60">
                Complete a body scan to create your first profile.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
