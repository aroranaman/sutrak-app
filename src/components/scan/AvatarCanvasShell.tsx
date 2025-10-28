"use client";

import * as React from "react";
import dynamic from "next/dynamic";

type Measurements = {
  bust: number;
  hip: number;
  shoulder: number;
  sleeve: number;
  torso: number;
  inseam: number;
};

// ✅ Correct, built-in React ErrorBoundary via a class component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (e: Error) => void },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    this.props.onError?.(error);
    // You could add logging here if needed
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-3 text-sm text-red-600 border rounded">
          <div className="font-medium">Avatar preview failed to load.</div>
          <div className="text-xs text-muted-foreground break-all">
            {String(this.state.error?.message || this.state.error)}
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

// 🔑 IMPORTANT: use a **relative** dynamic import so dev aliasing can’t drift
const R3FBody = dynamic(() => import("./R3FBody"), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full rounded-lg border animate-pulse" />
  ),
});

export default function AvatarCanvasShell({ m }: { m: Measurements }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const id = setTimeout(() => {
      if (!mounted) {
        console.warn(
          "[AvatarCanvasShell] R3F still not mounted after 3s — check the dynamic import path and /public/models/mannequin.glb"
        );
      }
    }, 3000);
    return () => clearTimeout(id);
  }, [mounted]);

  return (
    <div className="h-96 w-full rounded-lg border overflow-hidden">
      <ErrorBoundary
        onError={(e) => console.error("[AvatarCanvasShell] render error:", e)}
      >
        <React.Suspense
          fallback={<div className="h-96 w-full rounded-lg border animate-pulse" />}
        >
          {/* R3FBody must be a **default export** */}
          <R3FBody m={m} showDress dressColor="#8db3ff" onReady={() => setMounted(true)} />
        </React.Suspense>
      </ErrorBoundary>
    </div>
  );
}
