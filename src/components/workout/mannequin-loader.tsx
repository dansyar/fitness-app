"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useWorkoutStore } from "@/store/workout-store";
import { RotateCcw } from "lucide-react";

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

export function MannequinLoader() {
  const cameraView = useWorkoutStore((s) => s.cameraView);
  const setCameraView = useWorkoutStore((s) => s.setCameraView);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-secondary/40 to-background rounded-md border overflow-hidden">
      <MannequinScene />

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
