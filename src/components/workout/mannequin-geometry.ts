// Parametric definitions for the interactive physique model and clickable
// muscle groups. Coordinates are in meters with the origin near the feet.

import type { MuscleGroupId } from "@/lib/muscles";

export type Gender = "male" | "female";

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

export const PROPORTIONS: Record<Gender, ProportionSet> = {
  male: {
    shoulderWidth: 0.72,
    waistWidth: 0.33,
    hipWidth: 0.43,
    torsoLength: 0.68,
    armLength: 0.78,
    legLength: 0.96,
    headSize: 0.12,
    limbThickness: 0.087,
    muscleBulk: 0.135,
    chestDepth: 0.31,
    hipDepth: 0.24,
  },
  female: {
    shoulderWidth: 0.58,
    waistWidth: 0.3,
    hipWidth: 0.49,
    torsoLength: 0.66,
    armLength: 0.72,
    legLength: 0.94,
    headSize: 0.112,
    limbThickness: 0.072,
    muscleBulk: 0.102,
    chestDepth: 0.26,
    hipDepth: 0.27,
  },
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

export type AnatomyTone = "tendon" | "fiber" | "deep" | "fascia";

export interface AnatomyDetail extends BodyPart {
  tone: AnatomyTone;
  opacity?: number;
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

export function buildAnatomyDetails(p: ProportionSet): AnatomyDetail[] {
  const torsoBase = p.legLength + 0.02;
  const torsoTop = p.legLength + p.torsoLength;
  const chestY = torsoTop - 0.2;
  const abdomenY = torsoBase + 0.27;
  const shoulderY = torsoTop - 0.06;
  const headY = torsoTop + p.headSize + 0.11;
  const armX = p.shoulderWidth / 2 + p.limbThickness * 0.55;
  const thighX = p.hipWidth / 2 - 0.08;
  const frontZ = p.chestDepth * 0.52;
  const backZ = -p.chestDepth * 0.52;
  const legFrontZ = p.limbThickness * 1.08;
  const legBackZ = -p.limbThickness * 1.08;
  const details: AnatomyDetail[] = [];

  const add = (tone: AnatomyTone, part: BodyPart, opacity = 0.88) => {
    details.push({ ...part, tone, opacity });
  };

  add("fascia", ellipsoid("skullCap", [0, headY + p.headSize * 0.28, p.headSize * 0.66], [p.headSize * 0.56, p.headSize * 0.5, 0.018]), 0.94);
  add("fiber", ellipsoid("faceMuscleL", [-0.032, headY - 0.01, p.headSize * 0.82], [0.03, 0.065, 0.018], [0, 0, -0.18]), 0.78);
  add("fiber", ellipsoid("faceMuscleR", [0.032, headY - 0.01, p.headSize * 0.82], [0.03, 0.065, 0.018], [0, 0, 0.18]), 0.78);
  add("deep", capsule("browLine", [0, headY + p.headSize * 0.1, p.headSize * 0.9], 0.0035, 0.08, [0, 0, Math.PI / 2]), 0.72);
  add("deep", capsule("jawLine", [0, headY - p.headSize * 0.31, p.headSize * 0.76], 0.004, 0.105, [0, 0, Math.PI / 2]), 0.74);
  add("tendon", capsule("sternum", [0, chestY + 0.035, frontZ + 0.058], 0.011, 0.29), 0.94);
  add("tendon", capsule("lineaAlba", [0, abdomenY - 0.025, frontZ + 0.058], 0.008, 0.38), 0.96);
  add("tendon", capsule("pelvicAponeurosis", [0, torsoBase + 0.075, frontZ + 0.045], 0.008, p.waistWidth * 0.66, [0, 0, Math.PI / 2]), 0.88);
  add("tendon", capsule("leftClavicle", [-p.shoulderWidth * 0.16, shoulderY + 0.035, frontZ + 0.034], 0.006, p.shoulderWidth * 0.26, [0, 0, -0.92]), 0.9);
  add("tendon", capsule("rightClavicle", [p.shoulderWidth * 0.16, shoulderY + 0.035, frontZ + 0.034], 0.006, p.shoulderWidth * 0.26, [0, 0, 0.92]), 0.9);

  [-1, 0, 1].forEach((row) => {
    add("tendon", capsule(`abTendon${row}`, [0, abdomenY + row * 0.085, frontZ + 0.061], 0.0045, 0.18, [0, 0, Math.PI / 2]), 0.9);
  });

  [-1, 1].forEach((side) => {
    add("fiber", capsule(`pecFiberHigh${side}`, [side * p.shoulderWidth * 0.14, chestY + 0.095, frontZ + 0.068], 0.004, p.shoulderWidth * 0.24, [0, 0, side * 0.92]), 0.78);
    add("fiber", capsule(`pecFiberMid${side}`, [side * p.shoulderWidth * 0.14, chestY + 0.035, frontZ + 0.07], 0.004, p.shoulderWidth * 0.22, [0, 0, side * 1.15]), 0.78);
    add("fiber", capsule(`pecFiberLow${side}`, [side * p.shoulderWidth * 0.13, chestY - 0.04, frontZ + 0.064], 0.004, p.shoulderWidth * 0.18, [0, 0, side * 1.35]), 0.74);
    add("fiber", capsule(`deltFiberFront${side}`, [side * (p.shoulderWidth / 2 - 0.01), shoulderY - 0.045, frontZ * 0.7], 0.0045, 0.12, [0, 0, side * 0.28]), 0.76);
    add("fiber", capsule(`deltFiberSide${side}`, [side * (p.shoulderWidth / 2 + 0.055), shoulderY - 0.045, 0.006], 0.0045, 0.12, [0, 0, side * -0.12]), 0.76);
    add("fiber", capsule(`bicepsSplit${side}`, [side * armX, shoulderY - p.armLength * 0.25, 0.092], 0.0045, p.armLength * 0.23), 0.78);
    add("fiber", capsule(`forearmFlexor${side}`, [side * (armX - 0.002), shoulderY - p.armLength * 0.68, 0.064], 0.004, p.armLength * 0.25, [0, 0, side * 0.1]), 0.78);
    add("tendon", capsule(`wristTendon${side}`, [side * (armX - 0.012), shoulderY - p.armLength * 0.83, 0.065], 0.0045, 0.11), 0.86);

    add("fiber", capsule(`quadCenter${side}`, [side * thighX, p.legLength * 0.68, legFrontZ + 0.056], 0.005, p.legLength * 0.32), 0.78);
    add("fiber", capsule(`quadOuter${side}`, [side * (thighX + 0.045), p.legLength * 0.69, legFrontZ + 0.045], 0.0045, p.legLength * 0.29, [0, 0, side * -0.12]), 0.74);
    add("fiber", capsule(`quadInner${side}`, [side * (thighX - 0.042), p.legLength * 0.64, legFrontZ + 0.047], 0.0045, p.legLength * 0.25, [0, 0, side * 0.16]), 0.74);
    add("tendon", capsule(`kneeTendon${side}`, [side * thighX, p.legLength * 0.48, legFrontZ + 0.055], 0.006, 0.1), 0.86);
    add("fiber", capsule(`shinFiber${side}`, [side * thighX, p.legLength * 0.27, legFrontZ + 0.036], 0.004, p.legLength * 0.23), 0.68);
    add("tendon", capsule(`ankleTendonFront${side}`, [side * thighX, p.legLength * 0.095, legFrontZ + 0.045], 0.0045, 0.12), 0.88);

    add("fiber", capsule(`latFiber${side}`, [side * p.shoulderWidth * 0.29, chestY - 0.07, backZ - 0.065], 0.0045, 0.32, [0, 0, side * -0.28]), 0.76);
    add("fiber", capsule(`rearDeltFiber${side}`, [side * (p.shoulderWidth / 2 - 0.02), shoulderY - 0.05, -frontZ * 0.68], 0.004, 0.11, [0, 0, side * -0.26]), 0.76);
    add("fiber", capsule(`tricepsSplit${side}`, [side * armX, shoulderY - p.armLength * 0.25, -0.09], 0.0045, p.armLength * 0.25), 0.78);
    add("fiber", capsule(`hamstringSplit${side}`, [side * thighX, p.legLength * 0.67, legBackZ - 0.055], 0.0045, p.legLength * 0.32), 0.78);
    add("fiber", capsule(`calfSplit${side}`, [side * thighX, p.legLength * 0.28, legBackZ - 0.05], 0.0045, p.legLength * 0.22), 0.78);
    add("tendon", capsule(`achilles${side}`, [side * thighX, p.legLength * 0.13, legBackZ - 0.045], 0.007, 0.2), 0.9);
    add("fascia", ellipsoid(`scapula${side}`, [side * p.shoulderWidth * 0.18, chestY + 0.09, backZ - 0.072], [0.055, 0.12, 0.012], [0, 0, side * 0.24]), 0.58);
  });

  add("tendon", capsule("spine", [0, torsoBase + 0.4, backZ - 0.077], 0.015, 0.78), 0.98);
  add("tendon", capsule("neckTendonBack", [0, shoulderY + 0.09, backZ - 0.06], 0.012, 0.23), 0.92);
  add("fiber", capsule("trapFiberLeft", [-p.shoulderWidth * 0.11, shoulderY + 0.03, backZ - 0.064], 0.004, 0.22, [0, 0, -0.72]), 0.74);
  add("fiber", capsule("trapFiberRight", [p.shoulderWidth * 0.11, shoulderY + 0.03, backZ - 0.064], 0.004, 0.22, [0, 0, 0.72]), 0.74);
  add("tendon", capsule("gluteCleft", [0, p.legLength - 0.005, -p.hipDepth * 0.68], 0.007, 0.2), 0.9);

  return details;
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
