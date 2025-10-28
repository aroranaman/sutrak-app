"use client";
import dynamic from "next/dynamic";

const R3FBody = dynamic(() => import("../../../components/scan/R3FBody"), {
  ssr: false,
  loading: () => <div className="h-96 w-full border rounded animate-pulse" />,
});

export default function Page() {
  const m = { bust:95.5, hip:94.7, shoulder:44.5, sleeve:56, torso:60, inseam:58 };
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Avatar Test</h1>
      <R3FBody m={m} showDress />
    </div>
  );
}
