// Parametric definitions for the mannequin body and overlay muscle groups.
// Each muscle group is rendered as one or more boxes/capsules slightly inflated
// past the surface of the base body, so raycast hit-detection lands on them
// before the body. Coordinates are in meters with origin at the model's pelvis.

import type { MuscleGroupId } from "@/lib/muscles";

export type Gender = "male" | "female";

export interface ProportionSet {
  shoulderWidth: number;
  hipWidth: number;
  torsoLength: number;
  armLength: number;
  legLength: number;
  headSize: number;
  limbThickness: number;
}

export const PROPORTIONS: Record<Gender, ProportionSet> = {
  male: {
    shoulderWidth: 0.55,
    hipWidth: 0.42,
    torsoLength: 0.62,
    armLength: 0.74,
    legLength: 0.92,
    headSize: 0.13,
    limbThickness: 0.075,
  },
  female: {
    shoulderWidth: 0.46,
    hipWidth: 0.46,
    torsoLength: 0.6,
    armLength: 0.7,
    legLength: 0.9,
    headSize: 0.122,
    limbThickness: 0.062,
  },
};

export type Shape =
  | { kind: "box"; size: [number, number, number] }
  | { kind: "capsule"; radius: number; length: number; capSegments?: number }
  | { kind: "sphere"; radius: number };

export interface BodyPart {
  /** Unique node id (for logical reference; not the muscle group id). */
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  shape: Shape;
}

export interface MuscleOverlay {
  muscle: MuscleGroupId;
  parts: BodyPart[];
}

export function buildBody(p: ProportionSet): BodyPart[] {
  const torsoY = p.legLength + p.torsoLength / 2;
  const headY = p.legLength + p.torsoLength + p.headSize + 0.03;
  const shoulderY = p.legLength + p.torsoLength - 0.02;
  return [
    // Head
    { id: "head", position: [0, headY, 0], shape: { kind: "sphere", radius: p.headSize } },
    // Neck
    {
      id: "neck",
      position: [0, p.legLength + p.torsoLength + 0.02, 0],
      shape: { kind: "capsule", radius: 0.05, length: 0.06 },
    },
    // Torso (single rounded box)
    {
      id: "torso",
      position: [0, torsoY, 0],
      shape: { kind: "box", size: [p.shoulderWidth * 0.8, p.torsoLength, 0.22] },
    },
    // Pelvis
    {
      id: "pelvis",
      position: [0, p.legLength - 0.02, 0],
      shape: { kind: "box", size: [p.hipWidth, 0.16, 0.22] },
    },
    // Upper arms
    armPart("upperArmL", -p.shoulderWidth / 2 - 0.02, shoulderY - 0.18, p.limbThickness, 0.3),
    armPart("upperArmR", p.shoulderWidth / 2 + 0.02, shoulderY - 0.18, p.limbThickness, 0.3),
    // Lower arms
    armPart("forearmL", -p.shoulderWidth / 2 - 0.02, shoulderY - 0.55, p.limbThickness * 0.85, 0.3),
    armPart("forearmR", p.shoulderWidth / 2 + 0.02, shoulderY - 0.55, p.limbThickness * 0.85, 0.3),
    // Hands
    {
      id: "handL",
      position: [-p.shoulderWidth / 2 - 0.02, shoulderY - 0.78, 0],
      shape: { kind: "sphere", radius: 0.06 },
    },
    {
      id: "handR",
      position: [p.shoulderWidth / 2 + 0.02, shoulderY - 0.78, 0],
      shape: { kind: "sphere", radius: 0.06 },
    },
    // Thighs
    {
      id: "thighL",
      position: [-p.hipWidth / 2 + 0.05, p.legLength * 0.72, 0],
      shape: { kind: "capsule", radius: p.limbThickness * 1.5, length: 0.42 },
    },
    {
      id: "thighR",
      position: [p.hipWidth / 2 - 0.05, p.legLength * 0.72, 0],
      shape: { kind: "capsule", radius: p.limbThickness * 1.5, length: 0.42 },
    },
    // Shins
    {
      id: "shinL",
      position: [-p.hipWidth / 2 + 0.05, p.legLength * 0.28, 0.01],
      shape: { kind: "capsule", radius: p.limbThickness * 1.1, length: 0.42 },
    },
    {
      id: "shinR",
      position: [p.hipWidth / 2 - 0.05, p.legLength * 0.28, 0.01],
      shape: { kind: "capsule", radius: p.limbThickness * 1.1, length: 0.42 },
    },
    // Feet
    {
      id: "footL",
      position: [-p.hipWidth / 2 + 0.05, 0.04, 0.07],
      shape: { kind: "box", size: [0.09, 0.06, 0.22] },
    },
    {
      id: "footR",
      position: [p.hipWidth / 2 - 0.05, 0.04, 0.07],
      shape: { kind: "box", size: [0.09, 0.06, 0.22] },
    },
  ];
}

function armPart(id: string, x: number, y: number, r: number, len: number): BodyPart {
  return {
    id,
    position: [x, y, 0],
    shape: { kind: "capsule", radius: r, length: len },
  };
}

export function buildMuscleOverlays(p: ProportionSet): MuscleOverlay[] {
  const torsoY = p.legLength + p.torsoLength / 2;
  const torsoTop = p.legLength + p.torsoLength;
  const torsoFront = 0.115;
  const torsoBack = -0.115;
  const armOffsetX = p.shoulderWidth / 2 + 0.02;
  const shoulderY = torsoTop - 0.04;

  return [
    {
      muscle: "chest",
      parts: [
        {
          id: "chest_l",
          position: [-p.shoulderWidth * 0.18, torsoTop - 0.16, torsoFront + 0.005],
          shape: { kind: "box", size: [p.shoulderWidth * 0.34, 0.18, 0.04] },
        },
        {
          id: "chest_r",
          position: [p.shoulderWidth * 0.18, torsoTop - 0.16, torsoFront + 0.005],
          shape: { kind: "box", size: [p.shoulderWidth * 0.34, 0.18, 0.04] },
        },
      ],
    },
    {
      muscle: "abs",
      parts: [
        {
          id: "abs",
          position: [0, torsoY - 0.12, torsoFront + 0.005],
          shape: { kind: "box", size: [0.18, 0.32, 0.035] },
        },
      ],
    },
    {
      muscle: "obliques",
      parts: [
        {
          id: "oblique_l",
          position: [-p.shoulderWidth * 0.34, torsoY - 0.13, torsoFront - 0.01],
          rotation: [0, 0, 0.18],
          shape: { kind: "box", size: [0.07, 0.28, 0.05] },
        },
        {
          id: "oblique_r",
          position: [p.shoulderWidth * 0.34, torsoY - 0.13, torsoFront - 0.01],
          rotation: [0, 0, -0.18],
          shape: { kind: "box", size: [0.07, 0.28, 0.05] },
        },
      ],
    },
    {
      muscle: "upper_back",
      parts: [
        {
          id: "upper_back",
          position: [0, torsoTop - 0.18, torsoBack - 0.005],
          shape: { kind: "box", size: [p.shoulderWidth * 0.6, 0.2, 0.04] },
        },
      ],
    },
    {
      muscle: "lats",
      parts: [
        {
          id: "lat_l",
          position: [-p.shoulderWidth * 0.32, torsoY - 0.08, torsoBack - 0.005],
          shape: { kind: "box", size: [0.1, 0.28, 0.05] },
        },
        {
          id: "lat_r",
          position: [p.shoulderWidth * 0.32, torsoY - 0.08, torsoBack - 0.005],
          shape: { kind: "box", size: [0.1, 0.28, 0.05] },
        },
      ],
    },
    {
      muscle: "traps",
      parts: [
        {
          id: "traps",
          position: [0, torsoTop + 0.02, torsoBack],
          shape: { kind: "box", size: [p.shoulderWidth * 0.55, 0.12, 0.06] },
        },
      ],
    },
    {
      muscle: "front_delts",
      parts: [
        {
          id: "front_delt_l",
          position: [-p.shoulderWidth / 2 - 0.01, shoulderY - 0.04, 0.06],
          shape: { kind: "sphere", radius: 0.075 },
        },
        {
          id: "front_delt_r",
          position: [p.shoulderWidth / 2 + 0.01, shoulderY - 0.04, 0.06],
          shape: { kind: "sphere", radius: 0.075 },
        },
      ],
    },
    {
      muscle: "side_delts",
      parts: [
        {
          id: "side_delt_l",
          position: [-p.shoulderWidth / 2 - 0.06, shoulderY - 0.04, 0],
          shape: { kind: "sphere", radius: 0.075 },
        },
        {
          id: "side_delt_r",
          position: [p.shoulderWidth / 2 + 0.06, shoulderY - 0.04, 0],
          shape: { kind: "sphere", radius: 0.075 },
        },
      ],
    },
    {
      muscle: "rear_delts",
      parts: [
        {
          id: "rear_delt_l",
          position: [-p.shoulderWidth / 2 - 0.01, shoulderY - 0.04, -0.06],
          shape: { kind: "sphere", radius: 0.075 },
        },
        {
          id: "rear_delt_r",
          position: [p.shoulderWidth / 2 + 0.01, shoulderY - 0.04, -0.06],
          shape: { kind: "sphere", radius: 0.075 },
        },
      ],
    },
    {
      muscle: "biceps",
      parts: [
        {
          id: "bicep_l",
          position: [-armOffsetX, shoulderY - 0.22, 0.06],
          shape: { kind: "capsule", radius: 0.05, length: 0.18 },
        },
        {
          id: "bicep_r",
          position: [armOffsetX, shoulderY - 0.22, 0.06],
          shape: { kind: "capsule", radius: 0.05, length: 0.18 },
        },
      ],
    },
    {
      muscle: "triceps",
      parts: [
        {
          id: "tricep_l",
          position: [-armOffsetX, shoulderY - 0.22, -0.06],
          shape: { kind: "capsule", radius: 0.05, length: 0.2 },
        },
        {
          id: "tricep_r",
          position: [armOffsetX, shoulderY - 0.22, -0.06],
          shape: { kind: "capsule", radius: 0.05, length: 0.2 },
        },
      ],
    },
    {
      muscle: "forearms",
      parts: [
        {
          id: "forearm_l",
          position: [-armOffsetX, shoulderY - 0.55, 0.04],
          shape: { kind: "capsule", radius: 0.045, length: 0.22 },
        },
        {
          id: "forearm_r",
          position: [armOffsetX, shoulderY - 0.55, 0.04],
          shape: { kind: "capsule", radius: 0.045, length: 0.22 },
        },
      ],
    },
    {
      muscle: "quads",
      parts: [
        {
          id: "quad_l",
          position: [-p.hipWidth / 2 + 0.05, p.legLength * 0.72, 0.07],
          shape: { kind: "capsule", radius: 0.075, length: 0.34 },
        },
        {
          id: "quad_r",
          position: [p.hipWidth / 2 - 0.05, p.legLength * 0.72, 0.07],
          shape: { kind: "capsule", radius: 0.075, length: 0.34 },
        },
      ],
    },
    {
      muscle: "hamstrings",
      parts: [
        {
          id: "ham_l",
          position: [-p.hipWidth / 2 + 0.05, p.legLength * 0.72, -0.07],
          shape: { kind: "capsule", radius: 0.07, length: 0.34 },
        },
        {
          id: "ham_r",
          position: [p.hipWidth / 2 - 0.05, p.legLength * 0.72, -0.07],
          shape: { kind: "capsule", radius: 0.07, length: 0.34 },
        },
      ],
    },
    {
      muscle: "glutes",
      parts: [
        {
          id: "glute_l",
          position: [-p.hipWidth / 4, p.legLength + 0.02, -0.1],
          shape: { kind: "sphere", radius: 0.11 },
        },
        {
          id: "glute_r",
          position: [p.hipWidth / 4, p.legLength + 0.02, -0.1],
          shape: { kind: "sphere", radius: 0.11 },
        },
      ],
    },
    {
      muscle: "calves",
      parts: [
        {
          id: "calf_l",
          position: [-p.hipWidth / 2 + 0.05, p.legLength * 0.28, -0.07],
          shape: { kind: "capsule", radius: 0.07, length: 0.26 },
        },
        {
          id: "calf_r",
          position: [p.hipWidth / 2 - 0.05, p.legLength * 0.28, -0.07],
          shape: { kind: "capsule", radius: 0.07, length: 0.26 },
        },
      ],
    },
  ];
}
