"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useWorkoutStore } from "@/store/workout-store";
import type { Gender } from "./mannequin-geometry";

const MannequinScene = dynamic(
  () => import("./mannequin-scene").then((m) => m.MannequinScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <Skeleton className="w-2/3 h-3/4" />
      </div>
    ),
  },
);

export function MannequinLoader({ initialGender }: { initialGender: Gender }) {
  const [gender, setGender] = useState<Gender>(initialGender);
  const [viewCommand, setViewCommand] = useState(0);
  const cameraView = useWorkoutStore((s) => s.cameraView);
  const setCameraView = useWorkoutStore((s) => s.setCameraView);

  function showView(view: "front" | "back") {
    setCameraView(view);
    setViewCommand((current) => current + 1);
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-secondary/40 to-background rounded-md border overflow-hidden">
      <MannequinScene gender={gender} viewCommand={viewCommand} />

      <div className="absolute inset-x-3 top-3 flex flex-wrap gap-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={gender === "male" ? "default" : "outline"}
            onClick={() => setGender("male")}
            className="h-8 px-3"
          >
            Male
          </Button>
          <Button
            size="sm"
            variant={gender === "female" ? "default" : "outline"}
            onClick={() => setGender("female")}
            className="h-8 px-3"
          >
            Female
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={cameraView === "front" ? "default" : "outline"}
            size="sm"
            onClick={() => showView("front")}
            className="h-8 px-3"
          >
            Front
          </Button>
          <Button
            variant={cameraView === "back" ? "default" : "outline"}
            size="sm"
            onClick={() => showView("back")}
            className="h-8 px-3"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
