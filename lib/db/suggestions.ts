import { getAllRecipesWithIngredients } from "./recipes";
import { getPantry } from "./pantry";
import { getRestrictions } from "./dietary-restrictions";
import { getRecentMealTags } from "./meal-plan";
import { scoreRecipes, type ScoredRecipe } from "../suggest-recipes";

export async function getSuggestedRecipes(): Promise<ScoredRecipe[]> {
  const [recipes, pantry, restrictions, recentTags] = await Promise.all([
    getAllRecipesWithIngredients(),
    getPantry(),
    getRestrictions(),
    getRecentMealTags(),
  ]);

  const pantryItemIds = new Set(pantry.filter((p) => p.quantity > 0).map((p) => p.item_id));

  return scoreRecipes(recipes, { pantryItemIds, recentTags, restrictions });
}
