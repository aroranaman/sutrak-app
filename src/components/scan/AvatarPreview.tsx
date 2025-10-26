"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export type Measurements = {
  bust: number;
  hip: number;
  shoulderWidth: number;
  sleeveLength: number;
  torsoLength: number;
  inseam: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Guards against NaN, undefined, or zero, which would crash the 3D renderer.
function safeMetersFromCircumference(cm?: number) {
    const c = Number(cm ?? 0);
    if (!isFinite(c) || c <= 0) return 0.01; // Default to a small radius to prevent errors
    return (c / (2 * Math.PI)) / 100;
}

function safeMetersFromLength(cm?: number) {
    const l = Number(cm ?? 0);
    if(!isFinite(l) || l <= 0) return 0.01;
    return l / 100;
}

function Body({ measurements }: { measurements: Measurements }) {
  // Use safe calculation functions to derive model dimensions
  const bustRadius = safeMetersFromCircumference(measurements.bust);
  const hipRadius = safeMetersFromCircumference(measurements.hip);
  const shoulderWidthValue = safeMetersFromLength(measurements.shoulderWidth);
  const torsoLen = safeMetersFromLength(measurements.torsoLength);
  const sleeveLen = safeMetersFromLength(measurements.sleeveLength);
  const inseamLen = safeMetersFromLength(measurements.inseam);
  
  // Derive secondary measurements from the safe primary ones
  const legRadius = hipRadius * 0.4;
  const armRadius = bustRadius * 0.2;

  // Center the avatar vertically
  const modelHeight = inseamLen + torsoLen + bustRadius;
  const yOffset = -modelHeight / 2;

  return (
    <group position={[0, yOffset, 0]}>
      {/* Torso (capsule approximation) */}
      <mesh position={[0, inseamLen + torsoLen / 2, 0]}>
        <cylinderGeometry args={[bustRadius, hipRadius, torsoLen, 24]} />
        <meshStandardMaterial color="#E0C09A" metalness={0.1} roughness={0.6}/>
      </mesh>

      {/* Head */}
      <mesh position={[0, inseamLen + torsoLen + bustRadius, 0]}>
        <sphereGeometry args={[bustRadius * 0.8, 24, 24]} />
        <meshStandardMaterial color="#E0C09A" metalness={0.1} roughness={0.6}/>
      </mesh>

      {/* Arms */}
      <group position={[0, inseamLen + torsoLen * 0.9, 0]}>
          <mesh position={[shoulderWidthValue / 2 + sleeveLen / 2, 0, 0]} rotation={[0,0,Math.PI/2]}>
            <cylinderGeometry args={[armRadius, armRadius * 0.8, sleeveLen, 16]} />
            <meshStandardMaterial color="#E0C09A" metalness={0.1} roughness={0.6}/>
          </mesh>
          <mesh position={[-(shoulderWidthValue / 2 + sleeveLen / 2), 0, 0]} rotation={[0,0,-Math.PI/2]}>
            <cylinderGeometry args={[armRadius, armRadius * 0.8, sleeveLen, 16]} />
            <meshStandardMaterial color="#E0C09A" metalness={0.1} roughness={0.6}/>
          </mesh>
      </group>

      {/* Legs */}
       <group position={[0, inseamLen / 2, 0]}>
          <mesh position={[hipRadius * 0.6, 0, 0]}>
            <cylinderGeometry args={[legRadius, legRadius*0.8, inseamLen, 16]} />
            <meshStandardMaterial color="#E0C0A9" metalness={0.1} roughness={0.6}/>
          </mesh>
          <mesh position={[-hipRadius * 0.6, 0, 0]}>
            <cylinderGeometry args={[legRadius, legRadius*0.8, inseamLen, 16]} />
            <meshStandardMaterial color="#E0C0A9" metalness={0.1} roughness={0.6}/>
          </mesh>
       </group>
    </group>
  );
}


export default function AvatarPreview({ measurements }: { measurements: Measurements | null }) {
  if (!measurements) {
      return (
          <div className="h-96 w-full rounded-lg border bg-secondary flex items-center justify-center">
              <p className="text-muted-foreground">Scan to generate avatar</p>
          </div>
      )
  }

  return (
    <div className="h-96 w-full rounded-lg border">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.8}/>
        <directionalLight intensity={1.5} position={[3, 5, 4]}/>
        <React.Suspense fallback={null}>
            <Body measurements={measurements}/>
        </React.Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
