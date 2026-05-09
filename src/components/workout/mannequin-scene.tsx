"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Capsule } from "@react-three/drei";
import {
  Suspense,
  type ElementRef,
  type PropsWithChildren,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Group } from "three";
import {
  STANDARD_PROPORTIONS,
  buildBody,
  buildMuscleOverlays,
  type BodyPart,
  type MuscleOverlay,
} from "./mannequin-geometry";
import type { MuscleGroupId } from "@/lib/muscles";
import { useWorkoutStore } from "@/store/workout-store";

const SKIN_COLOR = "#d8b996";
const MUSCLE_COLOR = "#c99b78";
const HOVER_COLOR = "#a14a2a";
const SELECTED_COLOR = "#a14a2a";
const CAMERA_TARGET_Y = 0.12;

export function MannequinScene() {
  const body = useMemo(() => buildBody(STANDARD_PROPORTIONS), []);
  const overlays = useMemo(() => buildMuscleOverlays(STANDARD_PROPORTIONS), []);
  const cameraView = useWorkoutStore((s) => s.cameraView);
  const [interacting, setInteracting] = useState(false);
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.22, 3.35], fov: 35, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <SceneLights />
        <ResponsiveCamera controlsRef={controlsRef} interacting={interacting} />
        <CameraRig view={cameraView} interacting={interacting} controlsRef={controlsRef} />

        <group position={[0, -0.88, 0]}>
          <LiveModel>
            <BodyMesh body={body} />
            {overlays.map((overlay) => (
              <MuscleGroup key={overlay.muscle} overlay={overlay} interacting={interacting} />
            ))}
          </LiveModel>
          <ContactShadows
            position={[0, 0.001, 0]}
            opacity={0.35}
            scale={4}
            blur={3}
            far={2}
          />
        </group>

        <OrbitControls
          ref={controlsRef}
          target={[0, CAMERA_TARGET_Y, 0]}
          minPolarAngle={Math.PI / 2 - 0.34}
          maxPolarAngle={Math.PI / 2 + 0.22}
          minDistance={1.9}
          maxDistance={4.5}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.55}
          zoomSpeed={0.75}
          onStart={() => {
            setInteracting(true);
            document.body.style.cursor = "grabbing";
          }}
          onEnd={() => {
            setInteracting(false);
            document.body.style.cursor = "default";
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
      <directionalLight
        position={[2.6, 4.5, 3.5]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3.8, 2.5, 2]} intensity={0.35} color="#f3dcc1" />
      <directionalLight position={[0, 3.2, -4.5]} intensity={0.45} color="#e2cfb3" />
    </>
  );
}

function CameraRig({
  view,
  interacting,
  controlsRef,
}: {
  view: "front" | "back";
  interacting: boolean;
  controlsRef: RefObject<ElementRef<typeof OrbitControls> | null>;
}) {
  const targetAzimuth = useRef(view === "front" ? 0 : Math.PI);
  const isTransitioning = useRef(false);

  useEffect(() => {
    targetAzimuth.current = view === "front" ? 0 : Math.PI;
    isTransitioning.current = true;
  }, [view]);

  useFrame((state) => {
    if (interacting || !isTransitioning.current) return;
    const controls = controlsRef.current;
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
      cam.lookAt(0, CAMERA_TARGET_Y, 0);
      controls?.target.set(0, CAMERA_TARGET_Y, 0);
      controls?.update();
    } else {
      isTransitioning.current = false;
    }
  });

  return null;
}

function ResponsiveCamera({
  controlsRef,
  interacting,
}: {
  controlsRef: RefObject<ElementRef<typeof OrbitControls> | null>;
  interacting: boolean;
}) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (interacting) return;
    const distance = size.width < 520 ? 5.15 : 3.35;
    const azimuth = Math.atan2(camera.position.x, camera.position.z);
    camera.position.x = Math.sin(azimuth) * distance;
    camera.position.y = size.width < 520 ? 0.16 : 0.22;
    camera.position.z = Math.cos(azimuth) * distance;
    camera.lookAt(0, CAMERA_TARGET_Y, 0);
    controlsRef.current?.target.set(0, CAMERA_TARGET_Y, 0);
    controlsRef.current?.update();
  }, [camera, controlsRef, interacting, size.height, size.width]);

  return null;
}

function LiveModel({ children }: PropsWithChildren) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const breath = Math.sin(state.clock.elapsedTime * 1.6) * 0.004;
    groupRef.current.scale.set(1 + breath * 0.45, 1 + breath, 1 + breath * 0.7);
    groupRef.current.position.y = breath * 0.8;
  });

  return <group ref={groupRef}>{children}</group>;
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
  opacity = 1,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  part: BodyPart;
  color: string;
  emissiveIntensity?: number;
  opacity?: number;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const material = (
    <meshStandardMaterial
      color={color}
      roughness={0.58}
      metalness={0.02}
      emissive={emissiveIntensity > 0 ? HOVER_COLOR : "#000000"}
      emissiveIntensity={emissiveIntensity}
      transparent={opacity < 1 || emissiveIntensity > 0}
      opacity={opacity}
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
          scale={part.scale}
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
          scale={part.scale}
          castShadow
          receiveShadow
          {...handlers}
        >
          <sphereGeometry args={[part.shape.radius, 24, 24]} />
          {material}
        </mesh>
      );
    case "ellipsoid":
      return (
        <mesh
          position={part.position}
          rotation={part.rotation}
          scale={part.shape.radius}
          castShadow
          receiveShadow
          {...handlers}
        >
          <sphereGeometry args={[1, 32, 20]} />
          {material}
        </mesh>
      );
    case "capsule":
      return (
        <Capsule
          args={[part.shape.radius, part.shape.length, 16, 32]}
          position={part.position}
          rotation={part.rotation}
          scale={part.scale}
          castShadow
          receiveShadow
          {...handlers}
        >
          {material}
        </Capsule>
      );
  }
}

function MuscleGroup({ overlay, interacting }: { overlay: MuscleOverlay; interacting: boolean }) {
  const selected = useWorkoutStore((s) => s.selectedMuscle);
  const hovered = useWorkoutStore((s) => s.hoveredMuscle);
  const selectMuscle = useWorkoutStore((s) => s.selectMuscle);
  const setHoveredMuscle = useWorkoutStore((s) => s.setHoveredMuscle);

  const isSelected = selected === overlay.muscle;
  const isHovered = hovered === overlay.muscle;
  const intensity = isSelected ? 0.55 : isHovered ? 0.28 : 0;
  const color = isSelected || isHovered ? SELECTED_COLOR : MUSCLE_COLOR;
  const opacity = isSelected || isHovered ? 0.96 : 0.74;

  return (
    <group>
      {overlay.parts.map((part) => (
        <PartMesh
          key={part.id}
          part={inflate(part, 0.012)}
          color={color}
          emissiveIntensity={intensity}
          opacity={opacity}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (interacting) return;
            if (hovered !== overlay.muscle) setHoveredMuscle(overlay.muscle);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            if (interacting) return;
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
  if (part.shape.kind === "ellipsoid") {
    return {
      ...part,
      shape: {
        kind: "ellipsoid",
        radius: [
          part.shape.radius[0] + by,
          part.shape.radius[1] + by,
          part.shape.radius[2] + by,
        ],
      },
    };
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
