"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Sparkles, Loader2, Trash2 } from "lucide-react";
import type { AnalysisResult, AnalyzedItem } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface LogMealDialogProps {
  trigger?: React.ReactNode;
  defaultDate?: Date;
}

export function LogMealDialog({ trigger, defaultDate }: LogMealDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"capture" | "review">("capture");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [items, setItems] = useState<AnalyzedItem[]>([]);
  const [mealType, setMealType] = useState<MealType>(suggestMealType());
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload-meal-photo", { method: "POST", body: fd });
      if (!r.ok) {
        const text = await r.json().catch(() => ({}));
        throw new Error(text.error ?? `Upload failed (${r.status})`);
      }
      const { url } = (await r.json()) as { url: string };
      return url;
    },
    onSuccess: (url) => setPhotoUrl(url),
    onError: (e) => setErrorMsg((e as Error).message),
  });

  const analyze = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      const r = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          imageUrl: photoUrl ?? undefined,
          description: description.trim() || undefined,
        }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error ?? `Analysis failed (${r.status})`);
      return json as AnalysisResult;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setItems(data.items);
      setName(suggestMealName(data.items));
      setStep("review");
    },
    onError: (e) => setErrorMsg((e as Error).message),
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name || "Meal",
        mealType,
        loggedAt: defaultDate?.toISOString(),
        photoUrl: photoUrl ?? undefined,
        description: description || undefined,
        items,
        aiConfidence: analysis?.overallConfidence,
        aiCaveats: analysis?.caveats ?? [],
      };
      const r = await fetch("/api/meals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const text = await r.json().catch(() => ({}));
        throw new Error(text.error ?? `Save failed (${r.status})`);
      }
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meals"] });
      reset();
      setOpen(false);
    },
    onError: (e) => setErrorMsg((e as Error).message),
  });

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoPreview(URL.createObjectURL(f));
    upload.mutate(f);
  }

  function reset() {
    setStep("capture");
    setPhotoUrl(null);
    setPhotoPreview(null);
    setDescription("");
    setAnalysis(null);
    setItems([]);
    setName("");
    setMealType(suggestMealType());
    setErrorMsg(null);
  }

  const totals = items.reduce(
    (acc, i) => ({
      calories: acc.calories + i.calories,
      proteinG: acc.proteinG + i.proteinG,
      carbsG: acc.carbsG + i.carbsG,
      fatG: acc.fatG + i.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>{trigger ?? <Button>Log meal</Button>}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{step === "capture" ? "Log a meal" : "Review & save"}</DialogTitle>
          <DialogDescription>
            {step === "capture"
              ? "Snap or pick a photo. Add a description for accuracy. The AI estimates macros — you confirm."
              : "Adjust any item; save when it looks right. Nothing commits until you click Save."}
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="text-sm text-destructive border border-destructive/30 bg-destructive/5 rounded p-2">
            {errorMsg}
          </div>
        )}

        {step === "capture" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-[180px_1fr] gap-4">
              <div className="space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full aspect-square rounded-md border-2 border-dashed border-input flex flex-col items-center justify-center text-xs text-muted-foreground gap-1 hover:bg-secondary/50 transition-colors overflow-hidden"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="meal preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <Camera className="h-6 w-6" />
                      Tap to capture or upload
                    </>
                  )}
                </button>
                {upload.isPending && (
                  <p className="text-xs text-muted-foreground">Uploading…</p>
                )}
                {!process.env.NEXT_PUBLIC_BLOB_CONFIGURED && (
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    No Blob token? Skip the photo and describe the meal instead.
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="grilled chicken breast about 200g with brown rice and roasted vegetables"
                    className="mt-1 min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => analyze.mutate()}
                disabled={analyze.isPending || (!photoUrl && !description.trim())}
              >
                {analyze.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "review" && analysis && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="meal-name">Name</Label>
                <Input
                  id="meal-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meal-type">Meal</Label>
                <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
                  <SelectTrigger id="meal-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto scrollbar-thin pr-1">
              {items.map((item, idx) => (
                <ItemRow
                  key={idx}
                  item={item}
                  onChange={(patch) =>
                    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
                  }
                  onRemove={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                />
              ))}
              {items.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No items left.</p>
              )}
            </div>

            <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-1">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{Math.round(totals.calories)} kcal</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>P / C / F</span>
                <span>
                  {totals.proteinG.toFixed(1)} / {totals.carbsG.toFixed(1)} /{" "}
                  {totals.fatG.toFixed(1)} g
                </span>
              </div>
            </div>

            {analysis.caveats.length > 0 && (
              <div className="rounded-md border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 p-3 text-xs space-y-1">
                <div className="font-medium text-amber-900 dark:text-amber-200">AI caveats</div>
                <ul className="list-disc pl-4 space-y-0.5 text-amber-900/80 dark:text-amber-200/80">
                  {analysis.caveats.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.suggestedClarifications.length > 0 && (
              <details className="rounded-md border bg-card p-3 text-xs">
                <summary className="font-medium cursor-pointer">
                  Improve accuracy ({analysis.suggestedClarifications.length})
                </summary>
                <ul className="list-disc pl-4 mt-2 space-y-1 text-muted-foreground">
                  {analysis.suggestedClarifications.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </details>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("capture")}>
                Back
              </Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending || items.length === 0}>
                {save.isPending ? "Saving…" : "Save to log"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ItemRow({
  item,
  onChange,
  onRemove,
}: {
  item: AnalyzedItem;
  onChange: (patch: Partial<AnalyzedItem>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-md border p-2 space-y-2 text-xs">
      <div className="flex items-start gap-2">
        <Input
          value={item.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="h-7 flex-1"
        />
        <Badge variant={`confidence_${item.confidence}` as const}>{item.confidence}</Badge>
        <Button size="icon" variant="ghost" onClick={onRemove} className="h-7 w-7" aria-label="Remove item">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        <NumField label="g" value={item.estimatedGrams} onChange={(v) => recalc(item, onChange, { estimatedGrams: v })} />
        <NumField label="kcal" value={item.calories} onChange={(v) => onChange({ calories: v })} />
        <NumField label="P" value={item.proteinG} onChange={(v) => onChange({ proteinG: v })} />
        <NumField label="C" value={item.carbsG} onChange={(v) => onChange({ carbsG: v })} />
        <NumField label="F" value={item.fatG} onChange={(v) => onChange({ fatG: v })} />
      </div>
      {item.notes && <p className="text-muted-foreground italic">{item.notes}</p>}
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <Input
        type="number"
        inputMode="decimal"
        step="0.1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-7"
      />
    </label>
  );
}

// Recompute macros proportionally when grams are edited.
function recalc(
  item: AnalyzedItem,
  onChange: (patch: Partial<AnalyzedItem>) => void,
  patch: { estimatedGrams: number },
) {
  const oldG = item.estimatedGrams || 1;
  const ratio = patch.estimatedGrams / oldG;
  onChange({
    estimatedGrams: patch.estimatedGrams,
    calories: Math.round(item.calories * ratio),
    proteinG: round1(item.proteinG * ratio),
    carbsG: round1(item.carbsG * ratio),
    fatG: round1(item.fatG * ratio),
  });
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function suggestMealType(): MealType {
  const h = new Date().getHours();
  if (h < 10) return "breakfast";
  if (h < 14) return "lunch";
  if (h < 17) return "snack";
  if (h < 21) return "dinner";
  return "snack";
}

function suggestMealName(items: AnalyzedItem[]): string {
  if (items.length === 0) return "Meal";
  if (items.length === 1) return items[0].name;
  return items
    .slice(0, 3)
    .map((i) => i.name)
    .join(", ");
}
