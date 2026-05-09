// Canonical list of muscle groups exposed by the mannequin and used as the
// primaryMuscle key for exercises. Keep in sync with prisma seed data and
// MannequinScene.tsx mesh ids.

export const MUSCLE_GROUPS = [
  { id: "chest", label: "Chest", side: "front", description: "Pectoralis major; horizontal pressing and adduction." },
  { id: "upper_back", label: "Upper Back", side: "back", description: "Rhomboids and mid-traps; scapular retraction and posture." },
  { id: "lats", label: "Lats", side: "back", description: "Latissimus dorsi; vertical pulling and shoulder extension." },
  { id: "traps", label: "Traps", side: "back", description: "Upper trapezius; scapular elevation and shrugging." },
  { id: "front_delts", label: "Front Delts", side: "front", description: "Anterior deltoid; shoulder flexion and pressing." },
  { id: "side_delts", label: "Side Delts", side: "front", description: "Lateral deltoid; shoulder abduction." },
  { id: "rear_delts", label: "Rear Delts", side: "back", description: "Posterior deltoid; horizontal abduction and posture." },
  { id: "biceps", label: "Biceps", side: "front", description: "Biceps brachii and brachialis; elbow flexion and supination." },
  { id: "triceps", label: "Triceps", side: "back", description: "Triceps brachii; elbow extension." },
  { id: "forearms", label: "Forearms", side: "front", description: "Wrist flexors/extensors and grip musculature." },
  { id: "abs", label: "Abs", side: "front", description: "Rectus abdominis; trunk flexion and bracing." },
  { id: "obliques", label: "Obliques", side: "front", description: "Internal and external obliques; rotation and anti-lateral-flexion." },
  { id: "quads", label: "Quads", side: "front", description: "Quadriceps femoris; knee extension." },
  { id: "hamstrings", label: "Hamstrings", side: "back", description: "Biceps femoris, semitendinosus, semimembranosus; hip extension and knee flexion." },
  { id: "glutes", label: "Glutes", side: "back", description: "Gluteus maximus, medius, minimus; hip extension and abduction." },
  { id: "calves", label: "Calves", side: "back", description: "Gastrocnemius and soleus; ankle plantarflexion." },
] as const;

export type MuscleGroupId = (typeof MUSCLE_GROUPS)[number]["id"];
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const MUSCLE_GROUP_IDS: MuscleGroupId[] = MUSCLE_GROUPS.map((m) => m.id);

export function getMuscleGroup(id: string): MuscleGroup | undefined {
  return MUSCLE_GROUPS.find((m) => m.id === id);
}
