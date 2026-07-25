import { notFound } from "next/navigation";
import { getRecipe } from "@/lib/db/recipes";
import RecipeForm, { type RecipeDraft } from "@/components/recipe-form";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let recipe;
  try {
    recipe = await getRecipe(id);
  } catch {
    notFound();
  }

  const draft: RecipeDraft = {
    title: recipe.title,
    description: recipe.description ?? "",
    servings: recipe.servings?.toString() ?? "",
    prepMinutes: recipe.prep_minutes?.toString() ?? "",
    cookMinutes: recipe.cook_minutes?.toString() ?? "",
    instructions: recipe.instructions,
    sourceUrl: recipe.source_url ?? "",
    tags: recipe.tags.join(", "),
    ingredients: recipe.ingredients.map((i) => ({
      tempId: i.id,
      itemId: i.item_id,
      name: i.item.name,
      quantity: i.quantity,
      unit: i.unit,
      note: i.note,
    })),
  };

  return <RecipeForm recipeId={recipe.id} initial={draft} />;
}
