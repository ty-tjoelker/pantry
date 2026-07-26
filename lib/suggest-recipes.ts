import type { DietaryRestriction } from "@/types/dietary-restriction";
import type { RecipeWithIngredients } from "@/types/recipe";

export interface ScoredRecipe {
  recipe: RecipeWithIngredients;
  score: number;
  note: string | null;
}

interface ScoreOptions {
  pantryItemIds: Set<string>;
  recentTags: string[];
  restrictions: DietaryRestriction[];
}

/**
 * Ranks recipes for "what should we cook" suggestions. A recipe is dropped entirely
 * only when it has a conflicting ingredient with no noted substitute — a swappable
 * conflict is kept (with a score penalty and a note) rather than discarding an
 * otherwise-good recipe. Pure function — no data fetching — so it's easy to test and
 * to reuse from both the meal-plan slot picker and the "Surprise me" button.
 */
export function scoreRecipes(
  recipes: RecipeWithIngredients[],
  { pantryItemIds, recentTags, restrictions }: ScoreOptions,
): ScoredRecipe[] {
  const excludedTags = new Set(restrictions.filter((r) => r.mode === "exclude").map((r) => r.tag));
  const limitedTags = new Set(restrictions.filter((r) => r.mode === "limit").map((r) => r.tag));

  const scored: ScoredRecipe[] = [];

  for (const recipe of recipes) {
    let blocked = false;
    let score = 0;
    const notes: string[] = [];

    if (recipe.last_cooked_on) {
      const daysSince = (Date.now() - new Date(recipe.last_cooked_on).getTime()) / 86_400_000;
      score += Math.min(daysSince, 30);
    } else {
      score += 30; // never cooked — treat like it's been a while
    }

    const tagOverlap = recipe.tags.filter((tag) => recentTags.includes(tag)).length;
    score -= tagOverlap * 5;

    if (recipe.ingredients.length > 0) {
      const haveCount = recipe.ingredients.filter((i) => pantryItemIds.has(i.item_id)).length;
      score += (haveCount / recipe.ingredients.length) * 5;
    }

    for (const ingredient of recipe.ingredients) {
      const conflicting = ingredient.item.dietary_tags.filter((t) => excludedTags.has(t));
      if (conflicting.length > 0) {
        if (ingredient.substitute_note) {
          score -= 3;
          notes.push(`Swap ${ingredient.item.name} — ${ingredient.substitute_note}`);
        } else {
          blocked = true;
        }
      }

      const limited = ingredient.item.dietary_tags.filter((t) => limitedTags.has(t));
      if (limited.length > 0) {
        score -= 2;
        notes.push(`Contains ${limited.map((t) => t.replace(/_/g, " ")).join(", ")} — limit`);
      }
    }

    if (blocked) continue;

    scored.push({ recipe, score, note: notes[0] ?? null });
  }

  return scored.sort((a, b) => b.score - a.score);
}
