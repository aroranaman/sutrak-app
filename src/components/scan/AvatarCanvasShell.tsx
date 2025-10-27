"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { Measurements } from "./R3FBody";

const R3FBody = dynamic(() => import("./R3FBody"), {
  ssr: false,
  loading: () => <div className="h-96 w-full rounded-lg border animate-pulse" />,
});

class CanvasErrorBoundary extends React.Component<{children: React.ReactNode},{err?:unknown}>{
  constructor(p:any){super(p);this.state={};}
  static getDerivedStateFromError(err:unknown){return {err};}
  componentDidCatch(err:unknown){console.error("[AvatarCanvasShell] error:",err);}
  render(){return this.state.err
    ? <div className="h-96 w-full rounded-lg border flex items-center justify-center text-sm text-red-600">
        Avatar preview failed to load. You can still save your measurements.
      </div>
    : this.props.children;}
}

export type Fit = {
  bustEase: number; hipEase: number; shoulderEase: number; sleeveEase: number; torsoEase: number; inseamEase: number;
};

export default function AvatarCanvasShell({
  m, fit, showDress, dressColor
}: { m: Measurements; fit: Fit; showDress?: boolean; dressColor?: string }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(()=>setMounted(true),[]);
  if(!mounted) return <div className="h-96 w-full rounded-lg border animate-pulse" />;
  return (
    <CanvasErrorBoundary>
      <R3FBody m={m} fit={fit} showDress={showDress} dressColor={dressColor} />
    </CanvasErrorBoundary>
  );
}