import type { Recipe } from "./recipe";

export type Meal = "breakfast" | "lunch" | "dinner";

export const MEALS: Meal[] = ["breakfast", "lunch", "dinner"];

export interface MealPlanEntry {
  id: string;
  date: string;
  meal: Meal;
  recipe_id: string | null;
  note: string | null;
  created_at: string;
}

export interface MealPlanEntryWithRecipe extends MealPlanEntry {
  recipe: Recipe | null;
}
