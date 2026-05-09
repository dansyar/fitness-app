"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Capsule } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import {
  PROPORTIONS,
  buildBody,
  buildMuscleOverlays,
  type Gender,
  type BodyPart,
  type MuscleOverlay,
} from "./mannequin-geometry";
import type { MuscleGroupId } from "@/lib/muscles";
import { useWorkoutStore } from "@/store/workout-store";

const SKIN_COLOR = "#d6c2a8"; // warm neutral
const HOVER_COLOR = "#a14a2a";
const SELECTED_COLOR = "#a14a2a";

interface MannequinSceneProps {
  gender: Gender;
}

export function MannequinScene({ gender }: MannequinSceneProps) {
  const proportions = PROPORTIONS[gender];
  const body = useMemo(() => buildBody(proportions), [proportions]);
  const overlays = useMemo(() => buildMuscleOverlays(proportions), [proportions]);
  const cameraView = useWorkoutStore((s) => s.cameraView);
  const [interacting, setInteracting] = useState(false);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.5, 3], fov: 35, near: 0.1, far: 50 }}
      gl={{ antialias: true }}
    >
      <Suspense fallback={null}>
        <SceneLights />
        <CameraRig view={cameraView} interacting={interacting} />

        <group position={[0, -0.95, 0]}>
          <BodyMesh body={body} />
          {overlays.map((overlay) => (
            <MuscleGroup key={overlay.muscle} overlay={overlay} />
          ))}
          <ContactShadows
            position={[0, 0.001, 0]}
            opacity={0.45}
            scale={4}
            blur={2.5}
            far={2}
          />
        </group>

        <OrbitControls
          minPolarAngle={Math.PI / 2 - 0.4}
          maxPolarAngle={Math.PI / 2 + 0.2}
          minDistance={1.6}
          maxDistance={4.5}
          enablePan={false}
          autoRotate={!interacting}
          autoRotateSpeed={0.4}
          onStart={() => setInteracting(true)}
          onEnd={() => {
            // After a few seconds of no interaction, allow auto-rotate again.
            setTimeout(() => setInteracting(false), 5000);
          }}
        />
      </Suspense>
    </Canvas>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      {/* Key light */}
      <directionalLight
        position={[3, 5, 4]}
        intensity={0.9}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Fill light */}
      <directionalLight position={[-4, 3, 2]} intensity={0.3} color="#f8e7c8" />
      {/* Back rim */}
      <directionalLight position={[0, 4, -5]} intensity={0.25} color="#e8d4a8" />
    </>
  );
}

function CameraRig({ view, interacting }: { view: "front" | "back"; interacting: boolean }) {
  const targetAzimuth = useRef(view === "front" ? 0 : Math.PI);

  useEffect(() => {
    targetAzimuth.current = view === "front" ? 0 : Math.PI;
  }, [view]);

  useFrame((state) => {
    if (interacting) return;
    const cam = state.camera;
    const distance = Math.hypot(cam.position.x, cam.position.z);
    const current = Math.atan2(cam.position.x, cam.position.z);
    const desired = targetAzimuth.current;
    let delta = desired - current;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    if (Math.abs(delta) > 0.005) {
      const next = current + delta * 0.08;
      cam.position.x = Math.sin(next) * distance;
      cam.position.z = Math.cos(next) * distance;
      cam.lookAt(0, 0.5, 0);
    }
  });

  return null;
}

function BodyMesh({ body }: { body: BodyPart[] }) {
  return (
    <group>
      {body.map((part) => (
        <PartMesh key={part.id} part={part} color={SKIN_COLOR} />
      ))}
    </group>
  );
}

function PartMesh({
  part,
  color,
  emissiveIntensity = 0,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  part: BodyPart;
  color: string;
  emissiveIntensity?: number;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const material = (
    <meshStandardMaterial
      color={color}
      roughness={0.7}
      metalness={0.05}
      emissive={emissiveIntensity > 0 ? HOVER_COLOR : "#000000"}
      emissiveIntensity={emissiveIntensity}
      transparent={emissiveIntensity > 0}
      opacity={emissiveIntensity > 0 ? 0.85 : 1}
    />
  );
  const handlers = {
    onPointerOver,
    onPointerOut,
    onClick,
  };

  switch (part.shape.kind) {
    case "box":
      return (
        <mesh
          position={part.position}
          rotation={part.rotation}
          castShadow
          receiveShadow
          {...handlers}
        >
          <boxGeometry args={part.shape.size} />
          {material}
        </mesh>
      );
    case "sphere":
      return (
        <mesh
          position={part.position}
          rotation={part.rotation}
          castShadow
          receiveShadow
          {...handlers}
        >
          <sphereGeometry args={[part.shape.radius, 24, 24]} />
          {material}
        </mesh>
      );
    case "capsule":
      return (
        <Capsule
          args={[part.shape.radius, part.shape.length, 8, 16]}
          position={part.position}
          rotation={part.rotation}
          castShadow
          receiveShadow
          {...handlers}
        >
          {material}
        </Capsule>
      );
  }
}

function MuscleGroup({ overlay }: { overlay: MuscleOverlay }) {
  const selected = useWorkoutStore((s) => s.selectedMuscle);
  const hovered = useWorkoutStore((s) => s.hoveredMuscle);
  const selectMuscle = useWorkoutStore((s) => s.selectMuscle);
  const setHoveredMuscle = useWorkoutStore((s) => s.setHoveredMuscle);

  const isSelected = selected === overlay.muscle;
  const isHovered = hovered === overlay.muscle;
  const intensity = isSelected ? 0.6 : isHovered ? 0.3 : 0;

  return (
    <group>
      {overlay.parts.map((part) => (
        <PartMesh
          key={part.id}
          part={inflate(part, 0.012)}
          color={isSelected || isHovered ? SELECTED_COLOR : SKIN_COLOR}
          emissiveIntensity={intensity}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredMuscle(overlay.muscle);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHoveredMuscle(null);
            document.body.style.cursor = "default";
          }}
          onClick={(e) => {
            e.stopPropagation();
            selectMuscle(isSelected ? null : overlay.muscle);
          }}
        />
      ))}
    </group>
  );
}

function inflate(part: BodyPart, by: number): BodyPart {
  if (part.shape.kind === "box") {
    return {
      ...part,
      shape: {
        kind: "box",
        size: [
          part.shape.size[0] + by * 2,
          part.shape.size[1] + by * 2,
          part.shape.size[2] + by * 2,
        ],
      },
    };
  }
  if (part.shape.kind === "sphere") {
    return { ...part, shape: { kind: "sphere", radius: part.shape.radius + by } };
  }
  return {
    ...part,
    shape: {
      kind: "capsule",
      radius: part.shape.radius + by,
      length: part.shape.length,
    },
  };
}

