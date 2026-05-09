"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import type { Citation, ScoreBreakdown } from "@/lib/types";

interface ScorePopoverProps {
  score: number;
  breakdown: ScoreBreakdown;
  citations: Citation[];
  children: React.ReactNode;
}

export function ScorePopover({ score, breakdown, citations, children }: ScorePopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-left underline decoration-dotted underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-0.5"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Research score
            </div>
            <div className="text-2xl font-semibold">{score.toFixed(1)} / 10</div>
          </div>

          <div className="space-y-2">
            <ScoreRow label="EMG / activation evidence" value={breakdown.emg} max={3} />
            <ScoreRow
              label="Hypertrophy meta-analysis"
              value={breakdown.hypertrophyMeta}
              max={3}
            />
            <ScoreRow label="Replication / sample size" value={breakdown.replication} max={2} />
            <ScoreRow label="Practical efficacy" value={breakdown.practical} max={2} />
          </div>

          {citations.length > 0 && (
            <div className="pt-2 border-t">
              <div className="text-xs font-medium mb-2">Citations</div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {citations.map((c, i) => (
                  <li key={i}>
                    <span className="text-foreground">{c.author} ({c.year}).</span> {c.title}.{" "}
                    <em>{c.journal}</em>. {c.summary}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground pt-2 border-t italic">
            Scores are evidence-informed approximations, not absolute rankings. Your individual
            response to an exercise can deviate from population averages — track your own
            progress.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ScoreRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="text-xs">
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {value} / {max}
        </span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}
