"use client";

import { MUSCLE_GROUPS } from "@/lib/muscles";
import { useWorkoutStore } from "@/store/workout-store";
import { cn } from "@/lib/utils";

export function MuscleList({ className }: { className?: string }) {
  const selected = useWorkoutStore((s) => s.selectedMuscle);
  const select = useWorkoutStore((s) => s.selectMuscle);
  const setHover = useWorkoutStore((s) => s.setHoveredMuscle);

  const front = MUSCLE_GROUPS.filter((m) => m.side === "front");
  const back = MUSCLE_GROUPS.filter((m) => m.side === "back");

  return (
    <nav
      aria-label="Muscle groups"
      className={cn(
        "rounded-md border bg-card text-sm divide-y overflow-hidden",
        className,
      )}
    >
      <div className="px-3 py-2 text-xs font-medium uppercase text-muted-foreground tracking-wider bg-muted/50">
        Front
      </div>
      <ul role="list" className="divide-y">
        {front.map((m) => (
          <MuscleListItem
            key={m.id}
            id={m.id}
            label={m.label}
            selected={selected === m.id}
            onSelect={() => select(selected === m.id ? null : m.id)}
            onHover={(h) => setHover(h ? m.id : null)}
          />
        ))}
      </ul>
      <div className="px-3 py-2 text-xs font-medium uppercase text-muted-foreground tracking-wider bg-muted/50">
        Back
      </div>
      <ul role="list" className="divide-y">
        {back.map((m) => (
          <MuscleListItem
            key={m.id}
            id={m.id}
            label={m.label}
            selected={selected === m.id}
            onSelect={() => select(selected === m.id ? null : m.id)}
            onHover={(h) => setHover(h ? m.id : null)}
          />
        ))}
      </ul>
    </nav>
  );
}

function MuscleListItem({
  id,
  label,
  selected,
  onSelect,
  onHover,
}: {
  id: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
}) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        onClick={onSelect}
        className={cn(
          "w-full text-left px-3 py-2 transition-colors",
          selected
            ? "bg-primary/10 text-primary font-medium"
            : "hover:bg-secondary/60 text-foreground",
        )}
        data-muscle-id={id}
      >
        {label}
      </button>
    </li>
  );
}
