"use client";

import { Bounds, useGLTF } from "@react-three/drei";
import { useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { muscleForMeshName } from "./muscle-mesh-mapping";
import { useWorkoutStore } from "@/store/workout-store";
import type { MuscleGroupId } from "@/lib/muscles";

const MODEL_URL = "/models/anatomy.glb";
const HOVER_COLOR = "#a14a2a";

/**
 * Loads the anatomy GLB at /public/models/anatomy.glb and renders it with
 * per-submesh hover/click hit-detection driven by MUSCLE_MESH_PATTERNS.
 *
 * Throws (Suspense + ErrorBoundary at the call site) if the file is missing
 * or invalid, so the parent can fall back to the parametric mannequin.
 */
export function AnatomyGLB() {
  const gltf = useGLTF(MODEL_URL);
  const selected = useWorkoutStore((s) => s.selectedMuscle);
  const hovered = useWorkoutStore((s) => s.hoveredMuscle);
  const selectMuscle = useWorkoutStore((s) => s.selectMuscle);
  const setHoveredMuscle = useWorkoutStore((s) => s.setHoveredMuscle);

  // Walk the loaded scene, tag each mesh with the muscle group it belongs to,
  // and clone materials so we can highlight individual muscles without
  // affecting siblings.
  const annotatedMeshes = useMemo(() => {
    const out: Array<{ mesh: THREE.Mesh; muscle: MuscleGroupId | null }> = [];
    gltf.scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const muscle = muscleForMeshName(obj.name);
      // Clone the material so emissive tweaks don't bleed across muscles
      // sharing a single material in the source asset.
      if (Array.isArray(obj.material)) {
        obj.material = obj.material.map((m) => m.clone());
      } else if (obj.material) {
        obj.material = (obj.material as THREE.Material).clone();
      }
      out.push({ mesh: obj, muscle });
    });
    return out;
  }, [gltf.scene]);

  // Apply highlight state every render. Materials are mutated in place because
  // R3F doesn't re-attach materials when only emissive props change.
  useEffect(() => {
    for (const { mesh, muscle } of annotatedMeshes) {
      const isSelected = muscle && selected === muscle;
      const isHovered = muscle && hovered === muscle;
      const intensity = isSelected ? 0.6 : isHovered ? 0.3 : 0;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) {
        if (mat && "emissive" in mat) {
          (mat as THREE.MeshStandardMaterial).emissive = new THREE.Color(
            intensity > 0 ? HOVER_COLOR : "#000000",
          );
          (mat as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
        }
      }
    }
  }, [annotatedMeshes, selected, hovered]);

  return (
    <Bounds fit clip observe margin={1.05}>
      <primitive
        object={gltf.scene}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          const muscle = muscleForMeshName(e.object.name);
          if (muscle) {
            setHoveredMuscle(muscle);
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHoveredMuscle(null);
          document.body.style.cursor = "default";
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          const muscle = muscleForMeshName(e.object.name);
          if (muscle) {
            selectMuscle(selected === muscle ? null : muscle);
          }
        }}
      />
    </Bounds>
  );
}

/**
 * Probe whether the GLB exists by issuing a HEAD request. We do this before
 * mounting <AnatomyGLB /> so a missing asset never throws into Suspense and
 * the parametric fallback can render synchronously.
 */
export function useGLBAvailability(): "checking" | "available" | "missing" {
  const [state, setState] = useState<"checking" | "available" | "missing">("checking");
  useEffect(() => {
    let cancelled = false;
    fetch(MODEL_URL, { method: "HEAD", cache: "no-store" })
      .then((r) => {
        if (cancelled) return;
        setState(r.ok ? "available" : "missing");
      })
      .catch(() => {
        if (!cancelled) setState("missing");
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

// Preload as soon as this module is imported (no-op if the file is missing).
useGLTF.preload(MODEL_URL);
