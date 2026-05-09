// Maps each muscle group id (matches the canonical list in src/lib/muscles.ts)
// to a set of name patterns the GLB loader looks for in the model's submeshes.
// Patterns are matched case-insensitively as substrings against each mesh's
// .name property — so "biceps_brachii_left" and "Biceps Brachii L" both
// match a pattern of "biceps". Patterns use anatomical Latin terminology
// common to medical and ecorché reference models (Z-Anatomy, Sketchfab
// anatomy assets, BodyParts3D).
//
// If a model uses different naming, edit this file. No code changes needed.

import type { MuscleGroupId } from "@/lib/muscles";

export const MUSCLE_MESH_PATTERNS: Record<MuscleGroupId, string[]> = {
  chest: ["pectoralis", "pec_major", "pec_minor"],
  upper_back: ["rhomboid", "trapezius_middle", "trapezius_lower", "infraspinatus", "teres_major", "teres_minor"],
  lats: ["latissimus", "lat_dorsi"],
  traps: ["trapezius_upper", "trapezius_descending", "upper_trap"],
  front_delts: ["deltoid_anterior", "anterior_deltoid", "deltoid_clavicular", "front_delt"],
  side_delts: ["deltoid_lateral", "lateral_deltoid", "deltoid_acromial", "middle_delt", "side_delt"],
  rear_delts: ["deltoid_posterior", "posterior_deltoid", "deltoid_spinal", "rear_delt"],
  biceps: ["biceps_brachii", "brachialis"],
  triceps: ["triceps_brachii", "anconeus"],
  forearms: [
    "brachioradialis",
    "flexor_carpi",
    "flexor_digitorum",
    "extensor_carpi",
    "extensor_digitorum",
    "pronator_teres",
    "supinator",
  ],
  abs: ["rectus_abdominis"],
  obliques: ["obliquus_externus", "obliquus_internus", "external_oblique", "internal_oblique"],
  quads: ["rectus_femoris", "vastus_lateralis", "vastus_medialis", "vastus_intermedius", "quadriceps"],
  hamstrings: [
    "biceps_femoris",
    "semitendinosus",
    "semimembranosus",
    "hamstring",
  ],
  glutes: ["gluteus_maximus", "gluteus_medius", "gluteus_minimus", "glute"],
  calves: ["gastrocnemius", "soleus", "plantaris"],
};

/** Normalise a mesh name for matching: lowercase, collapse whitespace/dashes to underscores. */
export function normaliseMeshName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s-.]+/g, "_")
    .replace(/_+/g, "_");
}

/** Find which muscle group (if any) a mesh name belongs to. Returns null if no match. */
export function muscleForMeshName(name: string): MuscleGroupId | null {
  const n = normaliseMeshName(name);
  for (const [muscle, patterns] of Object.entries(MUSCLE_MESH_PATTERNS) as [
    MuscleGroupId,
    string[],
  ][]) {
    for (const pattern of patterns) {
      if (n.includes(pattern)) return muscle;
    }
  }
  return null;
}
