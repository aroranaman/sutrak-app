"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export type Measurements = {
  bust: number;
  hip: number;
  shoulder: number;
  sleeve: number;
  torso: number;
  inseam: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function safeCircToRadius(cm?: number) {
  const c = Number.isFinite(cm as number) ? Number(cm) : 0;
  const safe = c > 0 ? c : 1;
  return clamp(safe / (2 * Math.PI) / 10, 0.01, 5);
}
function safeLen(cm?: number) {
  const v = Number.isFinite(cm as number) ? Number(cm) : 0;
  return clamp(v > 0 ? v / 10 : 1, 0.1, 10);
}

function Body({ m }: { m: Measurements }) {
  const chestR = safeCircToRadius(m.bust);
  const hipR = safeCircToRadius(m.hip);
  const torsoL = safeLen(m.torso);
  const sleeveL = safeLen(m.sleeve);
  const inseamL = safeLen(m.inseam);
  const shoulderW = clamp((m.shoulder ?? 40) / 100, 0.1, 1.2);

  return (
    <group>
      <mesh position={[0, torsoL / 2, 0]}>
        <cylinderGeometry args={[chestR * 0.9, hipR, torsoL, 24]} />
        <meshStandardMaterial />
      </mesh>
      <mesh position={[0, torsoL + chestR * 0.8, 0]}>
        <sphereGeometry args={[chestR * 0.5, 24, 24]} />
        <meshStandardMaterial />
      </mesh>
      <mesh position={[shoulderW / 2, torsoL * 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[chestR * 0.25, chestR * 0.25, sleeveL, 16]} />
        <meshStandardMaterial />
      </mesh>
      <mesh position={[-shoulderW / 2, torsoL * 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[chestR * 0.25, chestR * 0.25, sleeveL, 16]} />
        <meshStandardMaterial />
      </mesh>
      <mesh position={[0.12, 0, 0]}>
        <cylinderGeometry args={[hipR * 0.3, hipR * 0.3, inseamL, 16]} />
        <meshStandardMaterial />
      </mesh>
      <mesh position={[-0.12, 0, 0]}>
        <cylinderGeometry args={[hipR * 0.3, hipR * 0.3, inseamL, 16]} />
        <meshStandardMaterial />
      </mesh>
    </group>
  );
}

export default function R3FBody({ m }: { m: Measurements }) {
  return (
    <div className="h-96 w-full rounded-lg border overflow-hidden">
      <Canvas camera={{ position: [0, 1.2, 3], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[2, 5, 2]} />
        <Body m={m} />
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}
