import { notFound } from "next/navigation";
import { getPantry } from "@/lib/db/pantry";
import { getRecipe } from "@/lib/db/recipes";
import RecipeDetail from "@/components/recipe-detail";

export const dynamic = "force-dynamic";

export default async function RecipeDetailPage({
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

  const pantry = await getPantry();
  const haveItemIds = pantry.filter((p) => p.quantity > 0).map((p) => p.item_id);

  return <RecipeDetail recipe={recipe} haveItemIds={haveItemIds} />;
}
