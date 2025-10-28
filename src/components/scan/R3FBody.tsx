"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

export type Measurements = {
  bust: number; hip: number; shoulderWidth: number; sleeve: number; torso: number; inseam: number;
};

// crude helpers: convert circumference (cm) to relative scale (~meters)
function circumToScale(cm: number, baseCirc = 95) {
  // linear scale around a base circumference so 95 cm ≈ 1.0
  const s = cm / baseCirc;
  // clamp to something sane
  return Math.min(Math.max(s, 0.6), 1.6);
}

function lengthToScale(cm: number, baseLen = 60) {
  const s = cm / baseLen;
  return Math.min(Math.max(s, 0.6), 1.6);
}

function Mannequin({
  m, showDress=false, dressColor="#8db3ff"
}: { m: Measurements; showDress?: boolean; dressColor?: string }) {
  // Put your mannequin at: /public/models/mannequin.glb
  // Good starting point: any T-pose, rigged neutral mannequin
  const { scene } = useGLTF("/models/mannequin.glb"); // keep file small (<5–10MB)

  // Find named groups/bones once
  const root = React.useMemo(() => scene.clone(true), [scene]);

  React.useEffect(() => {
    // Example mapping: adjust torso/bust/hip breadth by scaling X/Z of chest & hips,
    // adjust height-ish pieces by scaling Y on spine/legs/arms.
    // You’ll need to tweak these names per your GLTF’s outliner.
    const chest = root.getObjectByName("Spine2") || root.getObjectByName("Chest") || root;
    const hips  = root.getObjectByName("Hips")   || root;
    const leftUpperArm  = root.getObjectByName("LeftArm")  || root.getObjectByName("UpperArm_L");
    const rightUpperArm = root.getObjectByName("RightArm") || root.getObjectByName("UpperArm_R");
    const leftLeg  = root.getObjectByName("LeftUpLeg")  || root.getObjectByName("Thigh_L");
    const rightLeg = root.getObjectByName("RightUpLeg") || root.getObjectByName("Thigh_R");
    const spine    = root.getObjectByName("Spine") || root;

    const bustScale = circumToScale(m.bust, 95);
    const hipScale  = circumToScale(m.hip,  95);
    const torsoY    = lengthToScale(m.torso, 60);
    const sleeveY   = lengthToScale(m.sleeve, 56);
    const inseamY   = lengthToScale(m.inseam, 58);
    const shoulderX = lengthToScale(m.shoulderWidth, 44.5);

    // widen/narrow chest & hips in X/Z
    if (chest) chest.scale.set(bustScale, chest.scale.y, bustScale);
    if (hips)  hips.scale.set(hipScale,  hips.scale.y,  hipScale);

    // torso length (scale the spine on Y a bit)
    if (spine) spine.scale.set(spine.scale.x, torsoY, spine.scale.z);

    // arms length (very rough — you may want to adjust child bones instead)
    if (leftUpperArm)  leftUpperArm.scale.set(shoulderX, sleeveY, leftUpperArm.scale.z);
    if (rightUpperArm) rightUpperArm.scale.set(shoulderX, sleeveY, rightUpperArm.scale.z);

    // legs / inseam (again rough demo)
    if (leftLeg)  leftLeg.scale.set(leftLeg.scale.x, inseamY, leftLeg.scale.z);
    if (rightLeg) rightLeg.scale.set(rightLeg.scale.x, inseamY, rightLeg.scale.z);
  }, [root, m]);

  return (
    <group>
      <primitive object={root} position={[0, -1.0, 0]} />
      {showDress ? (
        <mesh position={[0, 0, 0]}>
          {/* optional translucent dress shell – swap for real garment later */}
          <boxGeometry args={[1.1, 1.4, 0.8]} />
          <meshStandardMaterial color={dressColor} transparent opacity={0.3} />
        </mesh>
      ) : null}
    </group>
  );
}

export default function R3FBody({
  m, showDress=false, dressColor="white"
}: { m: Measurements; showDress?: boolean; dressColor?: string }) {
  return (
    <div className="h-96 w-full rounded-lg border overflow-hidden">
      <Canvas camera={{ position: [0, 1.4, 2.8], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[2,5,2]} intensity={0.9} />
        <Mannequin m={m} showDress={showDress} dressColor={dressColor} />
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}

// Preload (optional)
useGLTF.preload("/models/mannequin.glb");