"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { Measurements } from "./AvatarPreview";

const AvatarPreview = dynamic(() => import("./AvatarPreview"), {
  ssr: false,
  // Simple visual while the bundle loads
  loading: () => <div className="h-96 w-full rounded-lg border animate-pulse bg-secondary" />,
});

// Client-only error boundary so a canvas failure won’t break the page
class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { err?: unknown }
> {
  constructor(props: any) {
    super(props);
    this.state = { err: undefined };
  }
  static getDerivedStateFromError(err: unknown) {
    return { err };
  }
  componentDidCatch(err: unknown) {
    // eslint-disable-next-line no-console
    console.error("[AvatarCanvasShell] canvas error:", err);
  }
  render() {
    if (this.state.err) {
      return (
        <div className="h-96 w-full rounded-lg border flex items-center justify-center text-sm text-red-600 bg-destructive/10">
          Avatar preview failed to load. You can still save your measurements.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AvatarCanvasShell({ measurements }: { measurements: Measurements }) {
  // Ensure we only render the canvas after first client paint (avoids hydration edge cases)
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="h-96 w-full rounded-lg border animate-pulse bg-secondary" />;
  }
  return (
    <CanvasErrorBoundary>
      <AvatarPreview measurements={measurements} />
    </CanvasErrorBoundary>
  );
}
