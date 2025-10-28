"use client";
import * as React from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { GLTFLoader } from "three-stdlib";
import * as THREE from "three";

export type Measurements = {
  bust:number; hip:number; shoulder:number; sleeve:number; torso:number; inseam:number;
};

function circumToScale(cm:number, base=95){ return Math.min(Math.max(cm/base, 0.6), 1.6); }
function lengthToScale(cm:number, base=60){ return Math.min(Math.max(cm/base, 0.6), 1.6); }

function Mannequin({ m }: { m: Measurements }) {
  // TRY TO LOAD
  let gltf: any;
  try {
    gltf = useLoader(GLTFLoader, "/models/mannequin.glb");
  } catch (e:any) {
    console.error("[R3FBody] GLTF load failed for /models/mannequin.glb:", e);
    throw e; // bubble to ErrorBoundary
  }

  const root = React.useMemo(() => gltf.scene.clone(true), [gltf]);

  React.useEffect(() => {
    // Try common node names; log what we found so you can adjust names
    const chest = root.getObjectByName("Spine2") || root.getObjectByName("Chest");
    const hips  = root.getObjectByName("Hips");
    const spine = root.getObjectByName("Spine");
    const lArm  = root.getObjectByName("LeftArm")  || root.getObjectByName("UpperArm_L");
    const rArm  = root.getObjectByName("RightArm") || root.getObjectByName("UpperArm_R");
    const lLeg  = root.getObjectByName("LeftUpLeg")|| root.getObjectByName("Thigh_L");
    const rLeg  = root.getObjectByName("RightUpLeg")|| root.getObjectByName("Thigh_R");

    if (!chest || !hips || !spine) {
      console.warn("[R3FBody] Bone names not found (Chest/Hips/Spine). Open the GLB in an editor and note exact node names.");
    }

    const bustS = circumToScale(m.bust, 95);
    const hipS  = circumToScale(m.hip,  95);
    const torsoY = lengthToScale(m.torso, 60);
    const sleeveY = lengthToScale(m.sleeve, 56);
    const inseamY = lengthToScale(m.inseam, 58);
    const shoulderX = lengthToScale(m.shoulder, 44.5);

    if (chest) chest.scale.set(bustS, chest.scale.y, bustS);
    if (hips)  hips.scale.set(hipS,  hips.scale.y,  hipS);
    if (spine) spine.scale.set(spine.scale.x, torsoY, spine.scale.z);
    if (lArm)  lArm.scale.set(shoulderX, sleeveY, lArm.scale.z);
    if (rArm)  rArm.scale.set(shoulderX, sleeveY, rArm.scale.z);
    if (lLeg)  lLeg.scale.set(lLeg.scale.x, inseamY, lLeg.scale.z);
    if (rLeg)  rLeg.scale.set(rLeg.scale.x, inseamY, rLeg.scale.z);
  }, [root, m]);

  return <primitive object={root} position={[0, -1.0, 0]} />;
}

export default function R3FBody({
  m, onReady, showDress=false, dressColor="#8db3ff",
}: { m: Measurements; onReady?: () => void; showDress?: boolean; dressColor?: string; }) {
  return (
    <Canvas camera={{ position: [0, 1.4, 2.8], fov: 50 }} onCreated={() => onReady?.()}>
      <ambientLight intensity={1} />
      <directionalLight position={[2,5,2]} intensity={0.9} />
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
