"use client";
import * as React from "react";
import dynamic from "next/dynamic";

type M = { bust:number; hip:number; shoulder:number; sleeve:number; torso:number; inseam:number };

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [err, setErr] = React.useState<Error | null>(null);
  if (err) {
    console.error("[AvatarCanvasShell] Render error:", err);
    return (
      <div className="p-3 text-sm text-red-600 border rounded">
        Avatar preview failed to load.<br />
        <span className="text-xs text-muted-foreground">
          {err.message}
        </span>
      </div>
    );
  }
  return (
    <React.Suspense fallback={<div className="h-96 w-full rounded-lg border animate-pulse" />}>
      <ErrorCatcher onError={setErr}>{children}</ErrorCatcher>
    </React.Suspense>
  );
}

function ErrorCatcher({
  children,
  onError,
}: {
  children: React.ReactNode;
  onError: (e: Error) => void;
}) {
  const ref = React.useRef(onError);
  ref.current = onError;
  return (
    <React.ErrorBoundary fallbackRender={({ error }) => {
      ref.current(error);
      return null;
    }}>
      {children}
    </React.ErrorBoundary>
  ) as any;
}

// IMPORTANT: use a **relative** import so dev aliasing cannot drift
const R3FBody = dynamic(() => import("./R3FBody"), {
  ssr: false,
  loading: () => <div className="h-96 w-full rounded-lg border animate-pulse" />,
});

export default function AvatarCanvasShell({ m }: { m: M }) {
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
      <ErrorBoundary>
        <R3FBody
          m={m}
          // let the child tell us it mounted
          onReady={() => setMounted(true)}
          showDress
          dressColor="#8db3ff"
        />
      </ErrorBoundary>
    </div>
  );
}
