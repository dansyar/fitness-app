"use client";

import { cn } from "@/lib/utils";

interface RingProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

function Ring({ label, current, target, unit, color }: RingProps) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;
  const remaining = Math.max(0, target - current);
  return (
    <div className="flex flex-col items-center text-center gap-1">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-base font-semibold tabular-nums leading-tight">
            {Math.round(current)}
          </div>
          <div className="text-[10px] text-muted-foreground">/ {Math.round(target)}</div>
        </div>
      </div>
      <div className="text-xs">
        <div className="font-medium">{label}</div>
        <div className="text-muted-foreground">
          {remaining > 0 ? `${Math.round(remaining)}${unit} left` : "complete"}
        </div>
      </div>
    </div>
  );
}

export interface MacroTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export function MacroRings({
  current,
  target,
  className,
}: {
  current: MacroTotals;
  target: MacroTotals;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
      <Ring
        label="Calories"
        current={current.calories}
        target={target.calories}
        unit="kcal"
        color="hsl(var(--primary))"
      />
      <Ring
        label="Protein"
        current={current.proteinG}
        target={target.proteinG}
        unit="g"
        color="hsl(145 50% 45%)"
      />
      <Ring
        label="Carbs"
        current={current.carbsG}
        target={target.carbsG}
        unit="g"
        color="hsl(35 65% 50%)"
      />
      <Ring
        label="Fat"
        current={current.fatG}
        target={target.fatG}
        unit="g"
        color="hsl(215 50% 50%)"
      />
    </div>
  );
}
