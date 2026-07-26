import { supabase } from "./client";
import { adjustPantryQuantity, getPantry } from "./pantry";
import { addGroceryItemByItemId } from "./grocery-list";
import type {
  Recipe,
  RecipeIngredientWithItem,
  RecipeInput,
  RecipeWithIngredients,
} from "@/types/recipe";

export async function getRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("last_cooked_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Recipe[];
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .ilike("title", `%${trimmed}%`)
    .order("title", { ascending: true })
    .limit(8);

  if (error) throw new Error(error.message);
  return data as Recipe[];
}

export async function getRecipe(id: string): Promise<RecipeWithIngredients> {
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (recipeError) throw new Error(recipeError.message);

  const { data: ingredients, error: ingredientsError } = await supabase
    .from("recipe_ingredients")
    .select("*, item:items(*)")
    .eq("recipe_id", id)
    .order("sort_order", { ascending: true });

  if (ingredientsError) throw new Error(ingredientsError.message);

  return {
    ...(recipe as Recipe),
    ingredients: ingredients as unknown as RecipeIngredientWithItem[],
  };
}

export async function createRecipe(input: RecipeInput): Promise<string> {
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      title: input.title,
      description: input.description,
      servings: input.servings,
      prep_minutes: input.prep_minutes,
      cook_minutes: input.cook_minutes,
      instructions: input.instructions,
      source_url: input.source_url,
      tags: input.tags,
    })
    .select("id")
    .single();

  if (recipeError) throw new Error(recipeError.message);

  await replaceIngredients(recipe.id, input);
  return recipe.id as string;
}

export async function updateRecipe(id: string, input: RecipeInput): Promise<void> {
  const { error: recipeError } = await supabase
    .from("recipes")
    .update({
      title: input.title,
      description: input.description,
      servings: input.servings,
      prep_minutes: input.prep_minutes,
      cook_minutes: input.cook_minutes,
      instructions: input.instructions,
      source_url: input.source_url,
      tags: input.tags,
    })
    .eq("id", id);

  if (recipeError) throw new Error(recipeError.message);

  const { error: deleteError } = await supabase
    .from("recipe_ingredients")
    .delete()
    .eq("recipe_id", id);
  if (deleteError) throw new Error(deleteError.message);

  await replaceIngredients(id, input);
}

async function replaceIngredients(recipeId: string, input: RecipeInput) {
  if (input.ingredients.length === 0) return;

  const rows = input.ingredients.map((ingredient, index) => ({
    recipe_id: recipeId,
    item_id: ingredient.item_id,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    note: ingredient.note,
    substitute_note: ingredient.substitute_note,
    sort_order: index,
  }));

  const { error } = await supabase.from("recipe_ingredients").insert(rows);
  if (error) throw new Error(error.message);
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function addMissingIngredientsToGroceryList(
  recipe: RecipeWithIngredients,
): Promise<void> {
  const pantry = await getPantry();
  const haveItemIds = new Set(pantry.filter((p) => p.quantity > 0).map((p) => p.item_id));

  const missing = recipe.ingredients.filter((i) => !haveItemIds.has(i.item_id));
  for (const ingredient of missing) {
    await addGroceryItemByItemId(ingredient.item_id, ingredient.unit);
  }
}

export async function markCooked(
  recipe: RecipeWithIngredients,
  decrementPantry: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("recipes")
    .update({
      times_cooked: recipe.times_cooked + 1,
      last_cooked_on: new Date().toISOString().slice(0, 10),
    })
    .eq("id", recipe.id);

  if (error) throw new Error(error.message);

  if (!decrementPantry) return;

  const pantry = await getPantry();
  for (const ingredient of recipe.ingredients) {
    const entry = pantry.find((p) => p.item_id === ingredient.item_id);
    if (entry && ingredient.quantity) {
      await adjustPantryQuantity(entry.id, -ingredient.quantity);
    }
  }
}
