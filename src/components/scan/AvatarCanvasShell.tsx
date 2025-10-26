"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { Measurements } from "./R3FBody";

const R3FBody = dynamic(() => import("./R3FBody"), {
  ssr: false,
  loading: () => <div className="h-96 w-full rounded-lg border animate-pulse" />,
});

class CanvasErrorBoundary extends React.Component<{ children: React.ReactNode }, { err?: unknown }> {
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
        <div className="h-96 w-full rounded-lg border flex items-center justify-center text-sm text-red-600">
          Avatar preview failed to load. You can still save your measurements.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AvatarCanvasShell({ m }: { m: Measurements }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="h-96 w-full rounded-lg border animate-pulse" />;
  }
  return (
    <CanvasErrorBoundary>
      <R3FBody m={m} />
    </CanvasErrorBoundary>
  );
}
