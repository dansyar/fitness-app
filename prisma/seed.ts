import { PrismaClient } from "@prisma/client";
import { SEED_EXERCISES } from "../src/data/exercises";
import { computeResearchScore } from "../src/lib/exercise-mapping";

const prisma = new PrismaClient();

async function main() {
  console.log(`Seeding ${SEED_EXERCISES.length} exercises…`);

  for (const ex of SEED_EXERCISES) {
    const computedScore = computeResearchScore(ex.scoreBreakdown);
    await prisma.exercise.upsert({
      where: { slug: ex.slug },
      create: {
        slug: ex.slug,
        name: ex.name,
        primaryMuscle: ex.primaryMuscle,
        secondaryMuscles: JSON.stringify(ex.secondaryMuscles),
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        setsRepsByGoal: JSON.stringify(ex.setsRepsByGoal),
        restSeconds: ex.restSeconds,
        researchScore: computedScore,
        scoreBreakdown: JSON.stringify(ex.scoreBreakdown),
        evidenceCitations: JSON.stringify(ex.evidenceCitations),
        techniqueSteps: JSON.stringify(ex.techniqueSteps),
        commonMistakes: JSON.stringify(ex.commonMistakes),
        safetyNotes: ex.safetyNotes,
        videoUrl: ex.videoUrl ?? null,
      },
      update: {
        name: ex.name,
        primaryMuscle: ex.primaryMuscle,
        secondaryMuscles: JSON.stringify(ex.secondaryMuscles),
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        setsRepsByGoal: JSON.stringify(ex.setsRepsByGoal),
        restSeconds: ex.restSeconds,
        researchScore: computedScore,
        scoreBreakdown: JSON.stringify(ex.scoreBreakdown),
        evidenceCitations: JSON.stringify(ex.evidenceCitations),
        techniqueSteps: JSON.stringify(ex.techniqueSteps),
        commonMistakes: JSON.stringify(ex.commonMistakes),
        safetyNotes: ex.safetyNotes,
        videoUrl: ex.videoUrl ?? null,
      },
    });
  }

  const counts = await prisma.exercise.groupBy({ by: ["primaryMuscle"], _count: true });
  console.log("Per-muscle counts:");
  for (const c of counts.sort((a, b) => a.primaryMuscle.localeCompare(b.primaryMuscle))) {
    console.log(`  ${c.primaryMuscle.padEnd(14)} ${c._count}`);
  }
  console.log(`Done. Total: ${SEED_EXERCISES.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
