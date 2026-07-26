"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import MealSlot from "./meal-slot";
import GroceryPreview from "./grocery-preview";
import {
  clearMealPlanSlot,
  getMealPlanWeek,
  setMealPlanNote,
  setMealPlanRecipe,
} from "@/lib/db/meal-plan";
import { addDays, formatDayLabel, formatWeekRangeLabel } from "@/lib/dates";
import { MEALS } from "@/types/meal-plan";
import type { Meal, MealPlanEntryWithRecipe } from "@/types/meal-plan";
import type { Recipe } from "@/types/recipe";

const MEAL_LABELS: Record<Meal, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export default function MealPlanWeek({
  weekStart,
  initialEntries,
}: {
  weekStart: string;
  initialEntries: MealPlanEntryWithRecipe[];
}) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [showPreview, setShowPreview] = useState(false);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function findEntry(date: string, meal: Meal) {
    return entries.find((e) => e.date === date && e.meal === meal);
  }

  async function refresh() {
    setEntries(await getMealPlanWeek(weekStart));
  }

  async function handlePickRecipe(date: string, meal: Meal, recipe: Recipe) {
    setEntries((prev) =>
      upsertLocal(prev, date, meal, { recipe_id: recipe.id, recipe, note: null }),
    );
    try {
      await setMealPlanRecipe(date, meal, recipe.id);
    } catch {
      await refresh();
    }
  }

  async function handleSaveNote(date: string, meal: Meal, note: string) {
    setEntries((prev) => upsertLocal(prev, date, meal, { recipe_id: null, recipe: null, note }));
    try {
      await setMealPlanNote(date, meal, note);
    } catch {
      await refresh();
    }
  }

  async function handleClear(date: string, meal: Meal) {
    setEntries((prev) => prev.filter((e) => !(e.date === date && e.meal === meal)));
    try {
      await clearMealPlanSlot(date, meal);
    } catch {
      await refresh();
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-24 pt-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push(`/plan?week=${addDays(weekStart, -7)}`)}
          className="px-2 py-1 text-lg text-zinc-500 dark:text-zinc-400"
          aria-label="Previous week"
        >
          ←
        </button>
        <p className="text-sm font-medium">{formatWeekRangeLabel(weekStart)}</p>
        <button
          type="button"
          onClick={() => router.push(`/plan?week=${addDays(weekStart, 7)}`)}
          className="px-2 py-1 text-lg text-zinc-500 dark:text-zinc-400"
          aria-label="Next week"
        >
          →
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {days.map((date) => (
          <div key={date}>
            <h2 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {formatDayLabel(date)}
            </h2>
            <div className="space-y-1.5">
              {MEALS.map((meal) => (
                <div key={meal} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs text-zinc-500 dark:text-zinc-400">{MEAL_LABELS[meal]}</span>
                  <div className="flex-1">
                    <MealSlot
                      entry={findEntry(date, meal)}
                      onPickRecipe={(recipe) => handlePickRecipe(date, meal, recipe)}
                      onSaveNote={(note) => handleSaveNote(date, meal, note)}
                      onClear={() => handleClear(date, meal)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowPreview(true)}
        className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white shadow-lg active:bg-emerald-700"
      >
        Build my list
      </button>

      {showPreview && (
        <GroceryPreview weekStart={weekStart} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}

function upsertLocal(
  entries: MealPlanEntryWithRecipe[],
  date: string,
  meal: Meal,
  fields: Partial<MealPlanEntryWithRecipe>,
): MealPlanEntryWithRecipe[] {
  const existing = entries.find((e) => e.date === date && e.meal === meal);
  if (existing) {
    return entries.map((e) => (e === existing ? { ...e, ...fields } : e));
  }
  const now = new Date().toISOString();
  return [
    ...entries,
    {
      id: `temp-${date}-${meal}`,
      date,
      meal,
      recipe_id: null,
      note: null,
      created_at: now,
      recipe: null,
      ...fields,
    },
  ];
}
