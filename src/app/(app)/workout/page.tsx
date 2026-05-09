import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MannequinLoader } from "@/components/workout/mannequin-loader";
import { MuscleList } from "@/components/workout/muscle-list";
import { ExercisePanel } from "@/components/workout/exercise-panel";
import { SessionDock } from "@/components/workout/session-dock";

export default async function WorkoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_360px]">
        <MuscleList className="hidden lg:block self-start sticky top-20" />
        <div className="aspect-square lg:aspect-auto lg:h-[640px] min-h-[420px]">
          <MannequinLoader />
        </div>
        <ExercisePanel className="lg:max-h-[640px] lg:sticky lg:top-20" />
      </div>

      <details className="lg:hidden mt-4 rounded-md border bg-card">
        <summary className="px-3 py-2 text-sm font-medium cursor-pointer">
          Pick from list
        </summary>
        <MuscleList className="border-0 rounded-none" />
      </details>

      <SessionDock />
    </div>
  );
}
