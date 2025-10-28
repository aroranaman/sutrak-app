"use client";

import * as React from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { GLTFLoader } from "three-stdlib";

export type Measurements = {
  bust: number; hip: number; shoulder: number; sleeve: number; torso: number; inseam: number;
};

function Mannequin({ m }: { m: Measurements }) {
  // Load model – must exist at /public/models/mannequin.glb
  const gltf: any = useLoader(GLTFLoader, "/models/mannequin.glb");
  const root = React.useMemo(() => gltf.scene.clone(true), [gltf]);

  // (Optional) tweak nodes/bones here…

  return <primitive object={root} position={[0, -1.0, 0]} />;
}

export default function R3FBody({
  m, onReady, showDress = false, dressColor = "#8db3ff",
}: {
  m: Measurements;
  onReady?: () => void;
  showDress?: boolean;
  dressColor?: string;
}) {
  return (
    <Canvas camera={{ position: [0, 1.4, 2.8], fov: 50 }} onCreated={() => onReady?.()}>
      <ambientLight intensity={1} />
      <directionalLight position={[2, 5, 2]} intensity={0.9} />
      <Mannequin m={m} />
      {showDress ? (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.1, 1.4, 0.8]} />
          <meshStandardMaterial color={dressColor} transparent opacity={0.3} />
        </mesh>
      ) : null}
      <OrbitControls enableDamping />
    </Canvas>
  );
}
