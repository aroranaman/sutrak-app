// src/components/AvatarPreview.tsx
"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

type M = { bust: number; hip: number; shoulderWidth: number; sleeveLength: number; torsoLength: number; inseam: number; };

function Body({ m }: { m: M }) {
  // crude proportional scaling from circumferences/lengths
  // Convert cm to scene units (e.g., divide by 100 to get meters)
  const scale = 1 / 100;
  const bustRadius = (m.bust * scale) / (2 * Math.PI);
  const hipRadius = (m.hip * scale) / (2 * Math.PI);
  const shoulderWidth = m.shoulderWidth * scale;
  const torsoLen = m.torsoLength * scale;
  const sleeveLen = m.sleeveLength * scale;
  const inseamLen = m.inseam * scale;
  const legRadius = hipRadius * 0.4;
  const armRadius = bustRadius * 0.2;

  return (
    <group position={[0, -inseamLen, 0]}>
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
          <mesh position={[shoulderWidth / 2 + sleeveLen / 2, 0, 0]} rotation={[0,0,Math.PI/2]}>
            <cylinderGeometry args={[armRadius, armRadius * 0.8, sleeveLen, 16]} />
            <meshStandardMaterial color="#E0C09A" metalness={0.1} roughness={0.6}/>
          </mesh>
          <mesh position={[- (shoulderWidth / 2 + sleeveLen / 2), 0, 0]} rotation={[0,0,-Math.PI/2]}>
            <cylinderGeometry args={[armRadius, armRadius * 0.8, sleeveLen, 16]} />
            <meshStandardMaterial color="#E0C09A" metalness={0.1} roughness={0.6}/>
          </mesh>
      </group>

      {/* Legs */}
       <group position={[0, inseamLen / 2, 0]}>
          <mesh position={[hipRadius * 0.6, 0, 0]}>
            <cylinderGeometry args={[legRadius, legRadius*0.8, inseamLen, 16]} />
            <meshStandardMaterial color="#E0C09A" metalness={0.1} roughness={0.6}/>
          </mesh>
          <mesh position={[-hipRadius * 0.6, 0, 0]}>
            <cylinderGeometry args={[legRadius, legRadius*0.8, inseamLen, 16]} />
            <meshStandardMaterial color="#E0C09A" metalness={0.1} roughness={0.6}/>
          </mesh>
       </group>
    </group>
  );
}

export default function AvatarPreview({ measurements }: { measurements: M | null }) {
  if (!measurements) {
      return (
          <div className="h-96 w-full rounded-lg border bg-secondary flex items-center justify-center">
              <p className="text-muted-foreground">Scan to generate avatar</p>
          </div>
      )
  }

  return (
    <div className="h-96 w-full rounded-lg border">
      <Canvas camera={{ position: [0, 1.2, 3], fov: 50 }}>
        <ambientLight intensity={0.8}/>
        <directionalLight intensity={1.5} position={[3, 5, 4]}/>
        <Suspense fallback={null}>
            <Body m={measurements}/>
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}