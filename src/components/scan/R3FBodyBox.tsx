"use client";
import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function R3FBodyBox({ onReady }: { onReady?: () => void }) {
  React.useEffect(() => { onReady?.(); }, [onReady]);
  return (
    <Canvas camera={{ position: [0, 1.2, 3], fov: 50 }}>
      <ambientLight intensity={1} />
      <directionalLight position={[2,5,2]} intensity={0.9} />
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial />
      </mesh>
      <OrbitControls enableDamping />
    </Canvas>
  );
}
