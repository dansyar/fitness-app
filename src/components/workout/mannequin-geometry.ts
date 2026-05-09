// Parametric definitions for the interactive physique model and clickable
// muscle groups. Coordinates are in meters with the origin near the feet.

import type { MuscleGroupId } from "@/lib/muscles";

type Vec3 = [number, number, number];

export interface ProportionSet {
  shoulderWidth: number;
  waistWidth: number;
  hipWidth: number;
  torsoLength: number;
  armLength: number;
  legLength: number;
  headSize: number;
  limbThickness: number;
  muscleBulk: number;
  chestDepth: number;
  hipDepth: number;
}

// A single neutral, athletic reference figure. Proportions sit between the
// previous male/female sets so the mannequin reads as anatomical reference
// rather than a specific body type.
export const STANDARD_PROPORTIONS: ProportionSet = {
  shoulderWidth: 0.6,
  waistWidth: 0.34,
  hipWidth: 0.44,
  torsoLength: 0.67,
  armLength: 0.76,
  legLength: 0.95,
  headSize: 0.118,
  limbThickness: 0.072,
  muscleBulk: 0.1,
  chestDepth: 0.26,
  hipDepth: 0.255,
};

export type Shape =
  | { kind: "box"; size: Vec3 }
  | { kind: "capsule"; radius: number; length: number }
  | { kind: "ellipsoid"; radius: Vec3 }
  | { kind: "sphere"; radius: number };

export interface BodyPart {
  id: string;
  position: Vec3;
  rotation?: Vec3;
  scale?: Vec3;
  shape: Shape;
}

export interface MuscleOverlay {
  muscle: MuscleGroupId;
  parts: BodyPart[];
}

export function buildBody(p: ProportionSet): BodyPart[] {
  const torsoBase = p.legLength + 0.02;
  const torsoTop = p.legLength + p.torsoLength;
  const chestY = torsoTop - 0.2;
  const abdomenY = torsoBase + 0.25;
  const shoulderY = torsoTop - 0.06;
  const headY = torsoTop + p.headSize + 0.11;
  const armX = p.shoulderWidth / 2 + p.limbThickness * 0.55;
  const thighX = p.hipWidth / 2 - 0.08;

  return [
    ellipsoid("head", [0, headY, 0.015], [p.headSize * 0.82, p.headSize * 1.08, p.headSize * 0.76]),
    ellipsoid("jaw", [0, headY - p.headSize * 0.72, 0.035], [p.headSize * 0.62, p.headSize * 0.33, p.headSize * 0.58]),
    capsule("neck", [0, torsoTop + 0.03, 0], 0.045, 0.1),

    ellipsoid("ribcage", [0, chestY, 0], [p.shoulderWidth * 0.43, 0.31, p.chestDepth * 0.55]),
    ellipsoid("waist", [0, abdomenY, 0], [p.waistWidth * 0.52, 0.28, p.chestDepth * 0.45]),
    ellipsoid("pelvis", [0, p.legLength - 0.03, -0.005], [p.hipWidth * 0.56, 0.16, p.hipDepth * 0.58]),

    ellipsoid("shoulderCapL", [-p.shoulderWidth / 2, shoulderY, 0], [p.muscleBulk * 0.9, p.muscleBulk * 0.82, p.muscleBulk * 0.78]),
    ellipsoid("shoulderCapR", [p.shoulderWidth / 2, shoulderY, 0], [p.muscleBulk * 0.9, p.muscleBulk * 0.82, p.muscleBulk * 0.78]),

    capsule("upperArmL", [-armX, shoulderY - p.armLength * 0.24, 0.005], p.limbThickness * 1.24, p.armLength * 0.34, [0, 0, 0.08], [0.88, 1, 1.12]),
    capsule("upperArmR", [armX, shoulderY - p.armLength * 0.24, 0.005], p.limbThickness * 1.24, p.armLength * 0.34, [0, 0, -0.08], [0.88, 1, 1.12]),
    capsule("forearmL", [-armX + 0.018, shoulderY - p.armLength * 0.66, 0.018], p.limbThickness * 0.92, p.armLength * 0.34, [0, 0, 0.04], [0.78, 1, 1.08]),
    capsule("forearmR", [armX - 0.018, shoulderY - p.armLength * 0.66, 0.018], p.limbThickness * 0.92, p.armLength * 0.34, [0, 0, -0.04], [0.78, 1, 1.08]),
    ellipsoid("handL", [-armX + 0.035, shoulderY - p.armLength * 0.88, 0.035], [0.04, 0.08, 0.035], [0, 0, 0.1]),
    ellipsoid("handR", [armX - 0.035, shoulderY - p.armLength * 0.88, 0.035], [0.04, 0.08, 0.035], [0, 0, -0.1]),

    capsule("thighL", [-thighX, p.legLength * 0.68, 0], p.limbThickness * 1.65, p.legLength * 0.38, undefined, [0.86, 1, 1.08]),
    capsule("thighR", [thighX, p.legLength * 0.68, 0], p.limbThickness * 1.65, p.legLength * 0.38, undefined, [0.86, 1, 1.08]),
    capsule("shinL", [-thighX, p.legLength * 0.27, 0.015], p.limbThickness * 1.08, p.legLength * 0.36, undefined, [0.76, 1, 1.05]),
    capsule("shinR", [thighX, p.legLength * 0.27, 0.015], p.limbThickness * 1.08, p.legLength * 0.36, undefined, [0.76, 1, 1.05]),
    ellipsoid("footL", [-thighX, 0.045, 0.085], [0.055, 0.035, 0.145]),
    ellipsoid("footR", [thighX, 0.045, 0.085], [0.055, 0.035, 0.145]),
  ];
}

export function buildMuscleOverlays(p: ProportionSet): MuscleOverlay[] {
  const torsoBase = p.legLength + 0.02;
  const torsoTop = p.legLength + p.torsoLength;
  const chestY = torsoTop - 0.2;
  const abdomenY = torsoBase + 0.27;
  const shoulderY = torsoTop - 0.06;
  const armX = p.shoulderWidth / 2 + p.limbThickness * 0.55;
  const thighX = p.hipWidth / 2 - 0.08;
  const frontZ = p.chestDepth * 0.52;
  const backZ = -p.chestDepth * 0.52;
  const legFrontZ = p.limbThickness * 1.08;
  const legBackZ = -p.limbThickness * 1.08;

  return [
    {
      muscle: "chest",
      parts: [
        ellipsoid("pecL", [-p.shoulderWidth * 0.16, chestY + 0.035, frontZ + 0.012], [p.shoulderWidth * 0.19, 0.115, 0.042], [0, 0.04, -0.08]),
        ellipsoid("pecR", [p.shoulderWidth * 0.16, chestY + 0.035, frontZ + 0.012], [p.shoulderWidth * 0.19, 0.115, 0.042], [0, -0.04, 0.08]),
        ellipsoid("lowerPecL", [-p.shoulderWidth * 0.13, chestY - 0.08, frontZ + 0.01], [p.shoulderWidth * 0.15, 0.06, 0.035], [0, 0, -0.18]),
        ellipsoid("lowerPecR", [p.shoulderWidth * 0.13, chestY - 0.08, frontZ + 0.01], [p.shoulderWidth * 0.15, 0.06, 0.035], [0, 0, 0.18]),
      ],
    },
    {
      muscle: "abs",
      parts: [
        ...[-1, 0, 1].flatMap((row) => [
          ellipsoid(`absL${row}`, [-0.055, abdomenY + row * 0.085, frontZ + 0.014], [0.045, 0.042, 0.026]),
          ellipsoid(`absR${row}`, [0.055, abdomenY + row * 0.085, frontZ + 0.014], [0.045, 0.042, 0.026]),
        ]),
      ],
    },
    {
      muscle: "obliques",
      parts: [
        ellipsoid("obliqueL", [-p.waistWidth * 0.46, abdomenY, frontZ * 0.62], [0.045, 0.18, 0.035], [0, 0, 0.22]),
        ellipsoid("obliqueR", [p.waistWidth * 0.46, abdomenY, frontZ * 0.62], [0.045, 0.18, 0.035], [0, 0, -0.22]),
      ],
    },
    {
      muscle: "upper_back",
      parts: [
        ellipsoid("midBack", [0, chestY + 0.02, backZ - 0.012], [p.shoulderWidth * 0.28, 0.17, 0.04]),
        ellipsoid("upperBackL", [-p.shoulderWidth * 0.18, chestY + 0.085, backZ - 0.012], [p.shoulderWidth * 0.16, 0.11, 0.035], [0, 0.08, -0.12]),
        ellipsoid("upperBackR", [p.shoulderWidth * 0.18, chestY + 0.085, backZ - 0.012], [p.shoulderWidth * 0.16, 0.11, 0.035], [0, -0.08, 0.12]),
      ],
    },
    {
      muscle: "lats",
      parts: [
        ellipsoid("latL", [-p.shoulderWidth * 0.3, chestY - 0.08, backZ - 0.01], [0.07, 0.22, 0.04], [0, 0, -0.18]),
        ellipsoid("latR", [p.shoulderWidth * 0.3, chestY - 0.08, backZ - 0.01], [0.07, 0.22, 0.04], [0, 0, 0.18]),
      ],
    },
    {
      muscle: "traps",
      parts: [
        ellipsoid("trapCenter", [0, shoulderY + 0.045, backZ - 0.005], [0.09, 0.08, 0.045]),
        ellipsoid("trapL", [-p.shoulderWidth * 0.16, shoulderY + 0.005, backZ - 0.005], [0.12, 0.055, 0.036], [0, 0, -0.35]),
        ellipsoid("trapR", [p.shoulderWidth * 0.16, shoulderY + 0.005, backZ - 0.005], [0.12, 0.055, 0.036], [0, 0, 0.35]),
      ],
    },
    {
      muscle: "front_delts",
      parts: [
        ellipsoid("frontDeltL", [-p.shoulderWidth / 2 + 0.01, shoulderY - 0.035, 0.075], [0.07, 0.075, 0.052], [0.15, 0, -0.08]),
        ellipsoid("frontDeltR", [p.shoulderWidth / 2 - 0.01, shoulderY - 0.035, 0.075], [0.07, 0.075, 0.052], [0.15, 0, 0.08]),
      ],
    },
    {
      muscle: "side_delts",
      parts: [
        ellipsoid("sideDeltL", [-p.shoulderWidth / 2 - 0.055, shoulderY - 0.045, 0], [0.072, 0.08, 0.062]),
        ellipsoid("sideDeltR", [p.shoulderWidth / 2 + 0.055, shoulderY - 0.045, 0], [0.072, 0.08, 0.062]),
      ],
    },
    {
      muscle: "rear_delts",
      parts: [
        ellipsoid("rearDeltL", [-p.shoulderWidth / 2 + 0.01, shoulderY - 0.045, -0.075], [0.068, 0.072, 0.048], [-0.15, 0, -0.08]),
        ellipsoid("rearDeltR", [p.shoulderWidth / 2 - 0.01, shoulderY - 0.045, -0.075], [0.068, 0.072, 0.048], [-0.15, 0, 0.08]),
      ],
    },
    {
      muscle: "biceps",
      parts: [
        ellipsoid("bicepsL", [-armX, shoulderY - p.armLength * 0.25, 0.06], [0.052, 0.14, 0.04]),
        ellipsoid("bicepsR", [armX, shoulderY - p.armLength * 0.25, 0.06], [0.052, 0.14, 0.04]),
      ],
    },
    {
      muscle: "triceps",
      parts: [
        ellipsoid("tricepsL", [-armX, shoulderY - p.armLength * 0.25, -0.058], [0.052, 0.15, 0.04]),
        ellipsoid("tricepsR", [armX, shoulderY - p.armLength * 0.25, -0.058], [0.052, 0.15, 0.04]),
      ],
    },
    {
      muscle: "forearms",
      parts: [
        ellipsoid("forearmL", [-armX, shoulderY - p.armLength * 0.68, 0.03], [0.047, 0.15, 0.035]),
        ellipsoid("forearmR", [armX, shoulderY - p.armLength * 0.68, 0.03], [0.047, 0.15, 0.035]),
      ],
    },
    {
      muscle: "quads",
      parts: [
        ellipsoid("quadOuterL", [-thighX - 0.035, p.legLength * 0.69, legFrontZ], [0.052, 0.22, 0.036], [0, 0, 0.08]),
        ellipsoid("quadInnerL", [-thighX + 0.035, p.legLength * 0.65, legFrontZ + 0.004], [0.046, 0.2, 0.034], [0, 0, -0.12]),
        ellipsoid("quadOuterR", [thighX + 0.035, p.legLength * 0.69, legFrontZ], [0.052, 0.22, 0.036], [0, 0, -0.08]),
        ellipsoid("quadInnerR", [thighX - 0.035, p.legLength * 0.65, legFrontZ + 0.004], [0.046, 0.2, 0.034], [0, 0, 0.12]),
      ],
    },
    {
      muscle: "hamstrings",
      parts: [
        ellipsoid("hamL", [-thighX, p.legLength * 0.68, legBackZ], [0.075, 0.22, 0.04]),
        ellipsoid("hamR", [thighX, p.legLength * 0.68, legBackZ], [0.075, 0.22, 0.04]),
      ],
    },
    {
      muscle: "glutes",
      parts: [
        ellipsoid("gluteL", [-p.hipWidth * 0.18, p.legLength + 0.01, -p.hipDepth * 0.58], [p.hipWidth * 0.22, 0.13, 0.085]),
        ellipsoid("gluteR", [p.hipWidth * 0.18, p.legLength + 0.01, -p.hipDepth * 0.58], [p.hipWidth * 0.22, 0.13, 0.085]),
      ],
    },
    {
      muscle: "calves",
      parts: [
        ellipsoid("calfL", [-thighX, p.legLength * 0.28, legBackZ * 0.85], [0.058, 0.16, 0.045]),
        ellipsoid("calfR", [thighX, p.legLength * 0.28, legBackZ * 0.85], [0.058, 0.16, 0.045]),
      ],
    },
  ];
}

function capsule(
  id: string,
  position: Vec3,
  radius: number,
  length: number,
  rotation?: Vec3,
  scale?: Vec3,
): BodyPart {
  return { id, position, rotation, scale, shape: { kind: "capsule", radius, length } };
}

function ellipsoid(id: string, position: Vec3, radius: Vec3, rotation?: Vec3): BodyPart {
  return { id, position, rotation, shape: { kind: "ellipsoid", radius } };
}
