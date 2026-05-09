"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useWorkoutStore } from "@/store/workout-store";
import { RotateCcw } from "lucide-react";
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
  const cameraView = useWorkoutStore((s) => s.cameraView);
  const setCameraView = useWorkoutStore((s) => s.setCameraView);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-secondary/40 to-background rounded-md border overflow-hidden">
      <MannequinScene gender={gender} />

      <div className="absolute top-3 left-3 flex gap-2">
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

      <Button
        variant="outline"
        size="sm"
        onClick={() => setCameraView(cameraView === "front" ? "back" : "front")}
        className="absolute top-3 right-3 h-8"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {cameraView === "front" ? "Show back" : "Show front"}
      </Button>
    </div>
  );
}
