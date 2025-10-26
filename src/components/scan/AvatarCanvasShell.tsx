"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const AvatarPreview = dynamic(() => import("@/components/scan/AvatarPreview"), { 
    ssr: false,
    loading: () => (
        <div className="h-96 w-full rounded-lg border bg-secondary flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ),
});

export default function AvatarCanvasShell(props: { measurements: any }) {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => setReady(true), []);
  
  if (!ready) {
      return <div className="h-96 w-full rounded-lg border bg-secondary flex items-center justify-center">
         <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>;
  }

  return <AvatarPreview measurements={props.measurements} />;
}
