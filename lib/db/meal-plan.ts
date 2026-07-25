import { supabase } from "./client";
import { getRecipe } from "./recipes";
import { getPantry } from "./pantry";
import { getStapleItems } from "./items";
import { addDays } from "../dates";
import { buildGroceryPreview, type GroceryPreviewRow } from "../meal-plan-grocery";
import type { MealPlanEntryWithRecipe, Meal } from "@/types/meal-plan";
import type { RecipeWithIngredients } from "@/types/recipe";

export async function getMealPlanWeek(weekStart: string): Promise<MealPlanEntryWithRecipe[]> {
  const weekEnd = addDays(weekStart, 6);
  const { data, error } = await supabase
    .from("meal_plan")
    .select("*, recipe:recipes(*)")
    .gte("date", weekStart)
    .lte("date", weekEnd);

  if (error) throw new Error(error.message);
  return data as unknown as MealPlanEntryWithRecipe[];
}

export async function setMealPlanRecipe(
  date: string,
  meal: Meal,
  recipeId: string,
): Promise<void> {
  const { error } = await supabase
    .from("meal_plan")
    .upsert({ date, meal, recipe_id: recipeId, note: null }, { onConflict: "date,meal" });
  if (error) throw new Error(error.message);
}

export async function setMealPlanNote(date: string, meal: Meal, note: string): Promise<void> {
  const { error } = await supabase
    .from("meal_plan")
    .upsert({ date, meal, recipe_id: null, note }, { onConflict: "date,meal" });
  if (error) throw new Error(error.message);
}

export async function clearMealPlanSlot(date: string, meal: Meal): Promise<void> {
  const { error } = await supabase.from("meal_plan").delete().eq("date", date).eq("meal", meal);
  if (error) throw new Error(error.message);
}

export async function getGroceryPreviewForWeek(weekStart: string): Promise<GroceryPreviewRow[]> {
  const weekEnd = addDays(weekStart, 6);
  const { data: slots, error } = await supabase
    .from("meal_plan")
    .select("recipe_id")
    .gte("date", weekStart)
    .lte("date", weekEnd)
    .not("recipe_id", "is", null);

  if (error) throw new Error(error.message);

  const recipeIds = (slots ?? []).map((s) => s.recipe_id as string);
  const recipesById = new Map<string, RecipeWithIngredients>();
  for (const id of new Set(recipeIds)) {
    recipesById.set(id, await getRecipe(id));
  }
  const plannedRecipes = recipeIds.map((id) => recipesById.get(id)!);

  const [pantry, staples] = await Promise.all([getPantry(), getStapleItems()]);
  return buildGroceryPreview(plannedRecipes, pantry, staples);
}
