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

export const STANDARD_PROPORTIONS: ProportionSet = {
  shoulderWidth: 0.66,
  waistWidth: 0.32,
  hipWidth: 0.46,
  torsoLength: 0.68,
  armLength: 0.76,
  legLength: 0.96,
  headSize: 0.116,
  limbThickness: 0.084,
  muscleBulk: 0.122,
  chestDepth: 0.29,
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
  const frontZ = p.chestDepth * 0.48;
  const backZ = -p.chestDepth * 0.48;
  const legFrontZ = p.limbThickness * 1.02;
  const legBackZ = -p.limbThickness * 1.02;

  return [
    ellipsoid("cranium", [0, headY + 0.008, 0.018], [p.headSize * 0.8, p.headSize * 1.02, p.headSize * 0.74]),
    ellipsoid("mandible", [0, headY - p.headSize * 0.68, 0.045], [p.headSize * 0.58, p.headSize * 0.32, p.headSize * 0.54]),
    ellipsoid("masseterL", [-0.035, headY - 0.035, p.headSize * 0.7], [0.027, 0.06, 0.018], [0, 0, -0.18]),
    ellipsoid("masseterR", [0.035, headY - 0.035, p.headSize * 0.7], [0.027, 0.06, 0.018], [0, 0, 0.18]),

    capsule("deepNeck", [0, torsoTop + 0.028, 0], 0.05, 0.12),
    capsule("sternocleidomastoidL", [-0.032, torsoTop + 0.015, frontZ * 0.38], 0.018, 0.17, [0.34, 0, -0.34]),
    capsule("sternocleidomastoidR", [0.032, torsoTop + 0.015, frontZ * 0.38], 0.018, 0.17, [0.34, 0, 0.34]),
    ellipsoid("upperTrapeziusMass", [0, shoulderY + 0.01, backZ * 0.42], [p.shoulderWidth * 0.3, 0.08, 0.07]),

    ellipsoid("thoracicCage", [0, chestY, -0.004], [p.shoulderWidth * 0.43, 0.315, p.chestDepth * 0.56]),
    ellipsoid("pectoralisBaseL", [-p.shoulderWidth * 0.14, chestY + 0.02, frontZ], [p.shoulderWidth * 0.19, 0.13, 0.055], [0, 0.06, -0.08]),
    ellipsoid("pectoralisBaseR", [p.shoulderWidth * 0.14, chestY + 0.02, frontZ], [p.shoulderWidth * 0.19, 0.13, 0.055], [0, -0.06, 0.08]),
    ellipsoid("serratusWallL", [-p.shoulderWidth * 0.32, chestY - 0.02, frontZ * 0.48], [0.045, 0.18, 0.04], [0, 0, -0.22]),
    ellipsoid("serratusWallR", [p.shoulderWidth * 0.32, chestY - 0.02, frontZ * 0.48], [0.045, 0.18, 0.04], [0, 0, 0.22]),
    ellipsoid("abdominalWall", [0, abdomenY, frontZ * 0.3], [p.waistWidth * 0.47, 0.29, p.chestDepth * 0.35]),
    ellipsoid("pelvicBowl", [0, p.legLength - 0.03, -0.006], [p.hipWidth * 0.56, 0.17, p.hipDepth * 0.6]),
    ellipsoid("sacrum", [0, p.legLength + 0.035, -p.hipDepth * 0.58], [0.08, 0.13, 0.035]),

    ellipsoid("latissimusBaseL", [-p.shoulderWidth * 0.28, chestY - 0.08, backZ], [0.09, 0.24, 0.052], [0, 0, -0.18]),
    ellipsoid("latissimusBaseR", [p.shoulderWidth * 0.28, chestY - 0.08, backZ], [0.09, 0.24, 0.052], [0, 0, 0.18]),
    ellipsoid("erectorColumnL", [-0.045, torsoBase + 0.35, backZ - 0.025], [0.033, 0.33, 0.028]),
    ellipsoid("erectorColumnR", [0.045, torsoBase + 0.35, backZ - 0.025], [0.033, 0.33, 0.028]),

    ellipsoid("deltoidCapL", [-p.shoulderWidth / 2, shoulderY, 0], [p.muscleBulk * 0.98, p.muscleBulk * 0.86, p.muscleBulk * 0.82]),
    ellipsoid("deltoidCapR", [p.shoulderWidth / 2, shoulderY, 0], [p.muscleBulk * 0.98, p.muscleBulk * 0.86, p.muscleBulk * 0.82]),

    capsule("humerusCoreL", [-armX, shoulderY - p.armLength * 0.25, 0], p.limbThickness * 0.9, p.armLength * 0.34, [0, 0, 0.08], [0.72, 1, 0.92]),
    capsule("humerusCoreR", [armX, shoulderY - p.armLength * 0.25, 0], p.limbThickness * 0.9, p.armLength * 0.34, [0, 0, -0.08], [0.72, 1, 0.92]),
    ellipsoid("bicepsMassL", [-armX, shoulderY - p.armLength * 0.25, 0.092], [0.052, 0.15, 0.04]),
    ellipsoid("bicepsMassR", [armX, shoulderY - p.armLength * 0.25, 0.092], [0.052, 0.15, 0.04]),
    ellipsoid("tricepsMassL", [-armX, shoulderY - p.armLength * 0.25, -0.092], [0.052, 0.16, 0.042]),
    ellipsoid("tricepsMassR", [armX, shoulderY - p.armLength * 0.25, -0.092], [0.052, 0.16, 0.042]),
    capsule("forearmCoreL", [-armX + 0.01, shoulderY - p.armLength * 0.66, 0.004], p.limbThickness * 0.58, p.armLength * 0.31, [0, 0, 0.04], [0.62, 1, 0.86]),
    capsule("forearmCoreR", [armX - 0.01, shoulderY - p.armLength * 0.66, 0.004], p.limbThickness * 0.58, p.armLength * 0.31, [0, 0, -0.04], [0.62, 1, 0.86]),
    capsule("forearmFlexorMassL", [-armX + 0.014, shoulderY - p.armLength * 0.66, 0.078], p.limbThickness * 0.58, p.armLength * 0.31, [0, 0, 0.04], [0.68, 1, 0.92]),
    capsule("forearmFlexorMassR", [armX - 0.014, shoulderY - p.armLength * 0.66, 0.078], p.limbThickness * 0.58, p.armLength * 0.31, [0, 0, -0.04], [0.68, 1, 0.92]),
    capsule("forearmExtensorMassL", [-armX + 0.006, shoulderY - p.armLength * 0.66, -0.072], p.limbThickness * 0.52, p.armLength * 0.29, [0, 0, 0.02], [0.64, 1, 0.9]),
    capsule("forearmExtensorMassR", [armX - 0.006, shoulderY - p.armLength * 0.66, -0.072], p.limbThickness * 0.52, p.armLength * 0.29, [0, 0, -0.02], [0.64, 1, 0.9]),
    ellipsoid("handL", [-armX + 0.035, shoulderY - p.armLength * 0.88, 0.035], [0.04, 0.08, 0.035], [0, 0, 0.1]),
    ellipsoid("handR", [armX - 0.035, shoulderY - p.armLength * 0.88, 0.035], [0.04, 0.08, 0.035], [0, 0, -0.1]),

    capsule("thighCoreL", [-thighX, p.legLength * 0.68, 0], p.limbThickness * 1.12, p.legLength * 0.37, undefined, [0.72, 1, 0.86]),
    capsule("thighCoreR", [thighX, p.legLength * 0.68, 0], p.limbThickness * 1.12, p.legLength * 0.37, undefined, [0.72, 1, 0.86]),
    ellipsoid("rectusFemorisL", [-thighX, p.legLength * 0.69, legFrontZ + 0.03], [0.052, 0.23, 0.042]),
    ellipsoid("rectusFemorisR", [thighX, p.legLength * 0.69, legFrontZ + 0.03], [0.052, 0.23, 0.042]),
    ellipsoid("vastusLateralisL", [-thighX - 0.052, p.legLength * 0.69, legFrontZ * 0.86], [0.056, 0.22, 0.038], [0, 0, 0.08]),
    ellipsoid("vastusLateralisR", [thighX + 0.052, p.legLength * 0.69, legFrontZ * 0.86], [0.056, 0.22, 0.038], [0, 0, -0.08]),
    ellipsoid("hamstringBaseL", [-thighX, p.legLength * 0.67, legBackZ - 0.034], [0.08, 0.22, 0.046]),
    ellipsoid("hamstringBaseR", [thighX, p.legLength * 0.67, legBackZ - 0.034], [0.08, 0.22, 0.046]),
    ellipsoid("gluteusMaximusL", [-p.hipWidth * 0.18, p.legLength + 0.01, -p.hipDepth * 0.58], [p.hipWidth * 0.22, 0.13, 0.09]),
    ellipsoid("gluteusMaximusR", [p.hipWidth * 0.18, p.legLength + 0.01, -p.hipDepth * 0.58], [p.hipWidth * 0.22, 0.13, 0.09]),
    capsule("lowerLegCoreL", [-thighX, p.legLength * 0.27, 0.004], p.limbThickness * 0.72, p.legLength * 0.35, undefined, [0.62, 1, 0.82]),
    capsule("lowerLegCoreR", [thighX, p.legLength * 0.27, 0.004], p.limbThickness * 0.72, p.legLength * 0.35, undefined, [0.62, 1, 0.82]),
    ellipsoid("gastrocnemiusL", [-thighX, p.legLength * 0.3, legBackZ - 0.032], [0.064, 0.165, 0.052]),
    ellipsoid("gastrocnemiusR", [thighX, p.legLength * 0.3, legBackZ - 0.032], [0.064, 0.165, 0.052]),
    ellipsoid("tibialisAnteriorL", [-thighX, p.legLength * 0.27, legFrontZ + 0.018], [0.032, 0.18, 0.028]),
    ellipsoid("tibialisAnteriorR", [thighX, p.legLength * 0.27, legFrontZ + 0.018], [0.032, 0.18, 0.028]),
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
        ellipsoid("clavicularPecL", [-p.shoulderWidth * 0.15, chestY + 0.105, frontZ + 0.016], [p.shoulderWidth * 0.17, 0.052, 0.034], [0, 0.03, -0.2]),
        ellipsoid("clavicularPecR", [p.shoulderWidth * 0.15, chestY + 0.105, frontZ + 0.016], [p.shoulderWidth * 0.17, 0.052, 0.034], [0, -0.03, 0.2]),
        ellipsoid("pecL", [-p.shoulderWidth * 0.16, chestY + 0.035, frontZ + 0.012], [p.shoulderWidth * 0.19, 0.115, 0.042], [0, 0.04, -0.08]),
        ellipsoid("pecR", [p.shoulderWidth * 0.16, chestY + 0.035, frontZ + 0.012], [p.shoulderWidth * 0.19, 0.115, 0.042], [0, -0.04, 0.08]),
        ellipsoid("lowerPecL", [-p.shoulderWidth * 0.13, chestY - 0.08, frontZ + 0.01], [p.shoulderWidth * 0.15, 0.06, 0.035], [0, 0, -0.18]),
        ellipsoid("lowerPecR", [p.shoulderWidth * 0.13, chestY - 0.08, frontZ + 0.01], [p.shoulderWidth * 0.15, 0.06, 0.035], [0, 0, 0.18]),
        ellipsoid("sternalPecTieL", [-0.035, chestY + 0.005, frontZ + 0.02], [0.036, 0.115, 0.026], [0, 0, -0.05]),
        ellipsoid("sternalPecTieR", [0.035, chestY + 0.005, frontZ + 0.02], [0.036, 0.115, 0.026], [0, 0, 0.05]),
      ],
    },
    {
      muscle: "abs",
      parts: [
        ...[-1.5, -0.5, 0.5, 1.5].flatMap((row) => [
          ellipsoid(`absL${row}`, [-0.055, abdomenY + row * 0.085, frontZ + 0.014], [0.045, 0.042, 0.026]),
          ellipsoid(`absR${row}`, [0.055, abdomenY + row * 0.085, frontZ + 0.014], [0.045, 0.042, 0.026]),
        ]),
        ellipsoid("transverseAbLower", [0, abdomenY - 0.21, frontZ + 0.008], [0.12, 0.047, 0.024]),
      ],
    },
    {
      muscle: "obliques",
      parts: [
        ellipsoid("obliqueL", [-p.waistWidth * 0.46, abdomenY, frontZ * 0.62], [0.045, 0.18, 0.035], [0, 0, 0.22]),
        ellipsoid("obliqueR", [p.waistWidth * 0.46, abdomenY, frontZ * 0.62], [0.045, 0.18, 0.035], [0, 0, -0.22]),
        ellipsoid("obliqueFanUpperL", [-p.waistWidth * 0.58, abdomenY + 0.11, frontZ * 0.54], [0.036, 0.11, 0.032], [0, 0, 0.42]),
        ellipsoid("obliqueFanUpperR", [p.waistWidth * 0.58, abdomenY + 0.11, frontZ * 0.54], [0.036, 0.11, 0.032], [0, 0, -0.42]),
        ellipsoid("obliqueFanLowerL", [-p.waistWidth * 0.55, abdomenY - 0.13, frontZ * 0.56], [0.04, 0.11, 0.032], [0, 0, -0.22]),
        ellipsoid("obliqueFanLowerR", [p.waistWidth * 0.55, abdomenY - 0.13, frontZ * 0.56], [0.04, 0.11, 0.032], [0, 0, 0.22]),
      ],
    },
    {
      muscle: "upper_back",
      parts: [
        ellipsoid("midBack", [0, chestY + 0.02, backZ - 0.012], [p.shoulderWidth * 0.28, 0.17, 0.04]),
        ellipsoid("upperBackL", [-p.shoulderWidth * 0.18, chestY + 0.085, backZ - 0.012], [p.shoulderWidth * 0.16, 0.11, 0.035], [0, 0.08, -0.12]),
        ellipsoid("upperBackR", [p.shoulderWidth * 0.18, chestY + 0.085, backZ - 0.012], [p.shoulderWidth * 0.16, 0.11, 0.035], [0, -0.08, 0.12]),
        ellipsoid("rhomboidL", [-p.shoulderWidth * 0.1, chestY + 0.055, backZ - 0.025], [0.075, 0.13, 0.03], [0, 0, -0.4]),
        ellipsoid("rhomboidR", [p.shoulderWidth * 0.1, chestY + 0.055, backZ - 0.025], [0.075, 0.13, 0.03], [0, 0, 0.4]),
        ellipsoid("teresMajorL", [-p.shoulderWidth * 0.31, chestY + 0.04, backZ - 0.018], [0.065, 0.058, 0.034], [0, 0, -0.18]),
        ellipsoid("teresMajorR", [p.shoulderWidth * 0.31, chestY + 0.04, backZ - 0.018], [0.065, 0.058, 0.034], [0, 0, 0.18]),
      ],
    },
    {
      muscle: "lats",
      parts: [
        ellipsoid("latUpperL", [-p.shoulderWidth * 0.31, chestY + 0.005, backZ - 0.012], [0.07, 0.13, 0.038], [0, 0, -0.26]),
        ellipsoid("latUpperR", [p.shoulderWidth * 0.31, chestY + 0.005, backZ - 0.012], [0.07, 0.13, 0.038], [0, 0, 0.26]),
        ellipsoid("latL", [-p.shoulderWidth * 0.3, chestY - 0.08, backZ - 0.01], [0.078, 0.23, 0.043], [0, 0, -0.18]),
        ellipsoid("latR", [p.shoulderWidth * 0.3, chestY - 0.08, backZ - 0.01], [0.078, 0.23, 0.043], [0, 0, 0.18]),
        ellipsoid("latLowerL", [-p.shoulderWidth * 0.2, chestY - 0.22, backZ - 0.012], [0.07, 0.115, 0.036], [0, 0, -0.05]),
        ellipsoid("latLowerR", [p.shoulderWidth * 0.2, chestY - 0.22, backZ - 0.012], [0.07, 0.115, 0.036], [0, 0, 0.05]),
      ],
    },
    {
      muscle: "traps",
      parts: [
        ellipsoid("trapCenter", [0, shoulderY + 0.045, backZ - 0.005], [0.09, 0.08, 0.045]),
        ellipsoid("trapL", [-p.shoulderWidth * 0.16, shoulderY + 0.005, backZ - 0.005], [0.12, 0.055, 0.036], [0, 0, -0.35]),
        ellipsoid("trapR", [p.shoulderWidth * 0.16, shoulderY + 0.005, backZ - 0.005], [0.12, 0.055, 0.036], [0, 0, 0.35]),
        ellipsoid("lowerTrapL", [-p.shoulderWidth * 0.08, shoulderY - 0.11, backZ - 0.018], [0.07, 0.15, 0.032], [0, 0, 0.28]),
        ellipsoid("lowerTrapR", [p.shoulderWidth * 0.08, shoulderY - 0.11, backZ - 0.018], [0.07, 0.15, 0.032], [0, 0, -0.28]),
      ],
    },
    {
      muscle: "front_delts",
      parts: [
        ellipsoid("frontDeltL", [-p.shoulderWidth / 2 + 0.01, shoulderY - 0.035, 0.075], [0.07, 0.075, 0.052], [0.15, 0, -0.08]),
        ellipsoid("frontDeltR", [p.shoulderWidth / 2 - 0.01, shoulderY - 0.035, 0.075], [0.07, 0.075, 0.052], [0.15, 0, 0.08]),
        ellipsoid("frontDeltClavicleL", [-p.shoulderWidth / 2 + 0.04, shoulderY + 0.015, 0.06], [0.052, 0.048, 0.038], [0.1, 0, -0.36]),
        ellipsoid("frontDeltClavicleR", [p.shoulderWidth / 2 - 0.04, shoulderY + 0.015, 0.06], [0.052, 0.048, 0.038], [0.1, 0, 0.36]),
      ],
    },
    {
      muscle: "side_delts",
      parts: [
        ellipsoid("sideDeltL", [-p.shoulderWidth / 2 - 0.055, shoulderY - 0.045, 0], [0.072, 0.08, 0.062]),
        ellipsoid("sideDeltR", [p.shoulderWidth / 2 + 0.055, shoulderY - 0.045, 0], [0.072, 0.08, 0.062]),
        ellipsoid("middleDeltLowerL", [-p.shoulderWidth / 2 - 0.04, shoulderY - 0.105, -0.005], [0.052, 0.07, 0.046], [0, 0, -0.12]),
        ellipsoid("middleDeltLowerR", [p.shoulderWidth / 2 + 0.04, shoulderY - 0.105, -0.005], [0.052, 0.07, 0.046], [0, 0, 0.12]),
      ],
    },
    {
      muscle: "rear_delts",
      parts: [
        ellipsoid("rearDeltL", [-p.shoulderWidth / 2 + 0.01, shoulderY - 0.045, -0.075], [0.068, 0.072, 0.048], [-0.15, 0, -0.08]),
        ellipsoid("rearDeltR", [p.shoulderWidth / 2 - 0.01, shoulderY - 0.045, -0.075], [0.068, 0.072, 0.048], [-0.15, 0, 0.08]),
        ellipsoid("rearDeltSpineL", [-p.shoulderWidth / 2 + 0.055, shoulderY - 0.005, -0.07], [0.045, 0.045, 0.034], [-0.14, 0, -0.42]),
        ellipsoid("rearDeltSpineR", [p.shoulderWidth / 2 - 0.055, shoulderY - 0.005, -0.07], [0.045, 0.045, 0.034], [-0.14, 0, 0.42]),
      ],
    },
    {
      muscle: "biceps",
      parts: [
        ellipsoid("bicepsLongHeadL", [-armX - 0.017, shoulderY - p.armLength * 0.25, 0.104], [0.038, 0.145, 0.035]),
        ellipsoid("bicepsShortHeadL", [-armX + 0.022, shoulderY - p.armLength * 0.25, 0.108], [0.038, 0.135, 0.036]),
        ellipsoid("bicepsLongHeadR", [armX + 0.017, shoulderY - p.armLength * 0.25, 0.104], [0.038, 0.145, 0.035]),
        ellipsoid("bicepsShortHeadR", [armX - 0.022, shoulderY - p.armLength * 0.25, 0.108], [0.038, 0.135, 0.036]),
        ellipsoid("brachialisL", [-armX - 0.046, shoulderY - p.armLength * 0.32, 0.02], [0.027, 0.1, 0.03]),
        ellipsoid("brachialisR", [armX + 0.046, shoulderY - p.armLength * 0.32, 0.02], [0.027, 0.1, 0.03]),
      ],
    },
    {
      muscle: "triceps",
      parts: [
        ellipsoid("tricepsLongHeadL", [-armX + 0.014, shoulderY - p.armLength * 0.25, -0.108], [0.042, 0.158, 0.038]),
        ellipsoid("tricepsLateralHeadL", [-armX - 0.028, shoulderY - p.armLength * 0.28, -0.098], [0.038, 0.135, 0.035]),
        ellipsoid("tricepsLongHeadR", [armX - 0.014, shoulderY - p.armLength * 0.25, -0.108], [0.042, 0.158, 0.038]),
        ellipsoid("tricepsLateralHeadR", [armX + 0.028, shoulderY - p.armLength * 0.28, -0.098], [0.038, 0.135, 0.035]),
        ellipsoid("tricepsMedialL", [-armX, shoulderY - p.armLength * 0.4, -0.074], [0.033, 0.06, 0.028]),
        ellipsoid("tricepsMedialR", [armX, shoulderY - p.armLength * 0.4, -0.074], [0.033, 0.06, 0.028]),
      ],
    },
    {
      muscle: "forearms",
      parts: [
        ellipsoid("forearmFlexorL", [-armX + 0.012, shoulderY - p.armLength * 0.67, 0.082], [0.044, 0.15, 0.035]),
        ellipsoid("forearmFlexorR", [armX - 0.012, shoulderY - p.armLength * 0.67, 0.082], [0.044, 0.15, 0.035]),
        ellipsoid("forearmExtensorL", [-armX - 0.018, shoulderY - p.armLength * 0.66, -0.064], [0.034, 0.13, 0.029]),
        ellipsoid("forearmExtensorR", [armX + 0.018, shoulderY - p.armLength * 0.66, -0.064], [0.034, 0.13, 0.029]),
        ellipsoid("brachioradialisL", [-armX - 0.042, shoulderY - p.armLength * 0.59, 0.064], [0.028, 0.11, 0.029], [0, 0, -0.12]),
        ellipsoid("brachioradialisR", [armX + 0.042, shoulderY - p.armLength * 0.59, 0.064], [0.028, 0.11, 0.029], [0, 0, 0.12]),
      ],
    },
    {
      muscle: "quads",
      parts: [
        ellipsoid("rectusFemorisL", [-thighX, p.legLength * 0.7, legFrontZ + 0.038], [0.047, 0.235, 0.037]),
        ellipsoid("rectusFemorisR", [thighX, p.legLength * 0.7, legFrontZ + 0.038], [0.047, 0.235, 0.037]),
        ellipsoid("quadOuterL", [-thighX - 0.037, p.legLength * 0.69, legFrontZ + 0.026], [0.052, 0.22, 0.036], [0, 0, 0.08]),
        ellipsoid("quadInnerL", [-thighX + 0.037, p.legLength * 0.65, legFrontZ + 0.03], [0.046, 0.2, 0.034], [0, 0, -0.12]),
        ellipsoid("quadOuterR", [thighX + 0.037, p.legLength * 0.69, legFrontZ + 0.026], [0.052, 0.22, 0.036], [0, 0, -0.08]),
        ellipsoid("quadInnerR", [thighX - 0.037, p.legLength * 0.65, legFrontZ + 0.03], [0.046, 0.2, 0.034], [0, 0, 0.12]),
        ellipsoid("vastusMedialisTeardropL", [-thighX + 0.05, p.legLength * 0.51, legFrontZ + 0.036], [0.042, 0.074, 0.034], [0, 0, -0.35]),
        ellipsoid("vastusMedialisTeardropR", [thighX - 0.05, p.legLength * 0.51, legFrontZ + 0.036], [0.042, 0.074, 0.034], [0, 0, 0.35]),
      ],
    },
    {
      muscle: "hamstrings",
      parts: [
        ellipsoid("bicepsFemorisL", [-thighX - 0.035, p.legLength * 0.68, legBackZ], [0.048, 0.22, 0.04], [0, 0, 0.08]),
        ellipsoid("semitendinosusL", [-thighX + 0.03, p.legLength * 0.66, legBackZ - 0.003], [0.043, 0.205, 0.036], [0, 0, -0.1]),
        ellipsoid("bicepsFemorisR", [thighX + 0.035, p.legLength * 0.68, legBackZ], [0.048, 0.22, 0.04], [0, 0, -0.08]),
        ellipsoid("semitendinosusR", [thighX - 0.03, p.legLength * 0.66, legBackZ - 0.003], [0.043, 0.205, 0.036], [0, 0, 0.1]),
      ],
    },
    {
      muscle: "glutes",
      parts: [
        ellipsoid("gluteL", [-p.hipWidth * 0.18, p.legLength + 0.01, -p.hipDepth * 0.58], [p.hipWidth * 0.22, 0.13, 0.085]),
        ellipsoid("gluteR", [p.hipWidth * 0.18, p.legLength + 0.01, -p.hipDepth * 0.58], [p.hipWidth * 0.22, 0.13, 0.085]),
        ellipsoid("gluteMedL", [-p.hipWidth * 0.31, p.legLength + 0.11, -p.hipDepth * 0.38], [0.07, 0.085, 0.045], [0, 0, -0.14]),
        ellipsoid("gluteMedR", [p.hipWidth * 0.31, p.legLength + 0.11, -p.hipDepth * 0.38], [0.07, 0.085, 0.045], [0, 0, 0.14]),
      ],
    },
    {
      muscle: "calves",
      parts: [
        ellipsoid("gastrocnemiusMedialL", [-thighX + 0.026, p.legLength * 0.29, legBackZ * 0.86], [0.039, 0.16, 0.044]),
        ellipsoid("gastrocnemiusLateralL", [-thighX - 0.026, p.legLength * 0.29, legBackZ * 0.86], [0.039, 0.15, 0.042]),
        ellipsoid("gastrocnemiusMedialR", [thighX - 0.026, p.legLength * 0.29, legBackZ * 0.86], [0.039, 0.16, 0.044]),
        ellipsoid("gastrocnemiusLateralR", [thighX + 0.026, p.legLength * 0.29, legBackZ * 0.86], [0.039, 0.15, 0.042]),
        ellipsoid("soleusL", [-thighX, p.legLength * 0.21, legBackZ * 0.62], [0.05, 0.105, 0.034]),
        ellipsoid("soleusR", [thighX, p.legLength * 0.21, legBackZ * 0.62], [0.05, 0.105, 0.034]),
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

  [-2, -1, 0, 1, 2].forEach((rib) => {
    add("deep", capsule(`intercostal${rib}`, [0, chestY + rib * 0.045, frontZ + 0.046], 0.0035, p.shoulderWidth * 0.5, [0, 0, Math.PI / 2]), 0.54);
  });

  [-1.5, -0.5, 0.5, 1.5].forEach((row) => {
    add("tendon", capsule(`abTendon${row}`, [0, abdomenY + row * 0.085, frontZ + 0.061], 0.0045, 0.18, [0, 0, Math.PI / 2]), 0.9);
  });

  [-1, 1].forEach((side) => {
    add("fiber", capsule(`pecFiberHigh${side}`, [side * p.shoulderWidth * 0.14, chestY + 0.095, frontZ + 0.068], 0.004, p.shoulderWidth * 0.24, [0, 0, side * 0.92]), 0.78);
    add("fiber", capsule(`pecFiberMid${side}`, [side * p.shoulderWidth * 0.14, chestY + 0.035, frontZ + 0.07], 0.004, p.shoulderWidth * 0.22, [0, 0, side * 1.15]), 0.78);
    add("fiber", capsule(`pecFiberLow${side}`, [side * p.shoulderWidth * 0.13, chestY - 0.04, frontZ + 0.064], 0.004, p.shoulderWidth * 0.18, [0, 0, side * 1.35]), 0.74);
    add("fiber", capsule(`deltFiberFront${side}`, [side * (p.shoulderWidth / 2 - 0.01), shoulderY - 0.045, frontZ * 0.7], 0.0045, 0.12, [0, 0, side * 0.28]), 0.76);
    add("fiber", capsule(`deltFiberSide${side}`, [side * (p.shoulderWidth / 2 + 0.055), shoulderY - 0.045, 0.006], 0.0045, 0.12, [0, 0, side * -0.12]), 0.76);
    add("fiber", capsule(`deltFiberRear${side}`, [side * (p.shoulderWidth / 2 - 0.02), shoulderY - 0.052, -frontZ * 0.74], 0.0045, 0.11, [0, 0, side * -0.26]), 0.76);
    add("fiber", capsule(`bicepsSplit${side}`, [side * armX, shoulderY - p.armLength * 0.25, 0.092], 0.0045, p.armLength * 0.23), 0.78);
    add("tendon", capsule(`distalBicepsTendon${side}`, [side * armX, shoulderY - p.armLength * 0.43, 0.072], 0.0045, 0.11), 0.86);
    add("fiber", capsule(`forearmFlexor${side}`, [side * (armX - 0.002), shoulderY - p.armLength * 0.68, 0.064], 0.004, p.armLength * 0.25, [0, 0, side * 0.1]), 0.78);
    add("fiber", capsule(`forearmExtensor${side}`, [side * (armX + 0.015), shoulderY - p.armLength * 0.66, -0.046], 0.0038, p.armLength * 0.22, [0, 0, side * -0.08]), 0.72);
    add("tendon", capsule(`wristTendon${side}`, [side * (armX - 0.012), shoulderY - p.armLength * 0.83, 0.065], 0.0045, 0.11), 0.86);

    [0, 1, 2, 3].forEach((slip) => {
      add("fiber", capsule(`serratusSlip${side}${slip}`, [side * p.shoulderWidth * 0.35, chestY + 0.035 - slip * 0.055, frontZ * 0.7], 0.0038, 0.1, [0, 0, side * 1.05]), 0.76);
    });
    [-1, 0, 1].forEach((band) => {
      add("fiber", capsule(`obliqueFiber${side}${band}`, [side * p.waistWidth * 0.45, abdomenY + band * 0.07, frontZ * 0.66], 0.004, 0.16, [0, 0, side * -0.55]), 0.74);
    });

    add("fiber", capsule(`quadCenter${side}`, [side * thighX, p.legLength * 0.68, legFrontZ + 0.056], 0.005, p.legLength * 0.32), 0.78);
    add("fiber", capsule(`quadOuter${side}`, [side * (thighX + 0.045), p.legLength * 0.69, legFrontZ + 0.045], 0.0045, p.legLength * 0.29, [0, 0, side * -0.12]), 0.74);
    add("fiber", capsule(`quadInner${side}`, [side * (thighX - 0.042), p.legLength * 0.64, legFrontZ + 0.047], 0.0045, p.legLength * 0.25, [0, 0, side * 0.16]), 0.74);
    add("tendon", capsule(`kneeTendon${side}`, [side * thighX, p.legLength * 0.48, legFrontZ + 0.055], 0.006, 0.1), 0.86);
    add("tendon", capsule(`itBand${side}`, [side * (thighX + 0.071), p.legLength * 0.66, 0.02], 0.0055, p.legLength * 0.36), 0.62);
    add("fiber", capsule(`shinFiber${side}`, [side * thighX, p.legLength * 0.27, legFrontZ + 0.036], 0.004, p.legLength * 0.23), 0.68);
    add("tendon", capsule(`tibialCrest${side}`, [side * thighX, p.legLength * 0.26, legFrontZ + 0.055], 0.004, p.legLength * 0.28), 0.84);
    add("tendon", capsule(`ankleTendonFront${side}`, [side * thighX, p.legLength * 0.095, legFrontZ + 0.045], 0.0045, 0.12), 0.88);

    add("fiber", capsule(`latFiber${side}`, [side * p.shoulderWidth * 0.29, chestY - 0.07, backZ - 0.065], 0.0045, 0.32, [0, 0, side * -0.28]), 0.76);
    add("fiber", capsule(`latFanLower${side}`, [side * p.shoulderWidth * 0.22, chestY - 0.21, backZ - 0.061], 0.004, 0.26, [0, 0, side * -0.08]), 0.7);
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
