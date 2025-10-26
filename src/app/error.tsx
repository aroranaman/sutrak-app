"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: any; reset: () => void }) {
  useEffect(() => {
    // Surface full error in dev console
    // eslint-disable-next-line no-console
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html>
      <body className="p-6">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {String(error?.message ?? "Unknown server error")}
        </p>
        <button
          className="mt-4 border rounded px-3 py-2"
          onClick={() => reset()}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
