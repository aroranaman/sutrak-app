"use client";
import * as React from "react";
import dynamic from "next/dynamic";

type M = { bust:number; hip:number; shoulder:number; sleeve:number; torso:number; inseam:number };

class ErrorBoundary extends React.Component<{ children: React.ReactNode; onError?: (e: Error) => void }, { error: Error | null }> {
  constructor(props:any){ super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error){ return { error }; }
  componentDidCatch(error: Error){ this.props.onError?.(error); }
  render(){
    if (this.state.error) {
      return (
        <div className="h-96 w-full rounded-lg border grid place-items-center">
          <div className="text-sm text-red-600">
            Avatar preview failed to load.
            <div className="text-xs text-muted-foreground mt-1 break-all">{String(this.state.error?.message || this.state.error)}</div>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

const R3FBody = dynamic(() => import("./R3FBody"), { ssr: false, loading: () => <div className="h-96 w-full rounded-lg border animate-pulse" /> });
const R3FBodyBox = dynamic(() => import("./R3FBodyBox"), { ssr: false });

export default function AvatarCanvasShell({ m }: { m: M }) {
  const [fallback, setFallback] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (!mounted) {
        console.warn("[AvatarCanvasShell] R3F still not mounted after 3s — will try cube fallback. Is /public/models/mannequin.glb present?");
        setFallback(true);
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [mounted]);

  return (
    <div className="h-96 w-full rounded-lg border overflow-hidden">
      <ErrorBoundary onError={(e) => { console.error("[AvatarCanvasShell] render error:", e); setFallback(true); }}>
        <React.Suspense fallback={<div className="h-96 w-full rounded-lg border animate-pulse" />}>
          {fallback ? (
            <R3FBodyBox onReady={() => setMounted(true)} />
          ) : (
            <R3FBody m={m} showDress dressColor="#8db3ff" onReady={() => setMounted(true)} />
          )}
        </React.Suspense>
      </ErrorBoundary>
    </div>
  );
}
