"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { Measurements } from "./R3FBody";

const R3FBody = dynamic(() => import("./R3FBody"), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full rounded-lg border animate-pulse" data-testid="r3f-loading" />
  ),
});

class CanvasErrorBoundary extends React.Component<{children:React.ReactNode},{err?:unknown}>{
  constructor(p:any){super(p);this.state={};}
  static getDerivedStateFromError(err:unknown){return {err};}
  componentDidCatch(err:unknown){console.error("[AvatarCanvasShell] error:",err);}
  render(){return this.state.err
    ? <div className="h-96 w-full rounded-lg border flex items-center justify-center text-sm text-red-600">
        Avatar preview failed to load. You can still save your measurements.
      </div>
    : this.props.children;}
}

export default function AvatarCanvasShell({
  m,
  showDress = false,
  dressColor = "#8db3ff",
}: {
  m: Measurements;
  showDress?: boolean;
  dressColor?: string;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [timeoutHit, setTimeoutHit] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => {
      setTimeoutHit(true);
      console.warn("[AvatarCanvasShell] R3F chunk still loading after 3s");
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return <div className="h-96 w-full rounded-lg border animate-pulse" />;
  }

  return (
    <CanvasErrorBoundary>
      <R3FBody m={m} showDress={showDress} dressColor={dressColor} />
      {timeoutHit ? (
        <p className="mt-2 text-xs text-muted-foreground">
          If the preview doesn’t appear, it’s safe to proceed—saving will still work.
        </p>
      ) : null}
    </CanvasErrorBoundary>
  );
}
