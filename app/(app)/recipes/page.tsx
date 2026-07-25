import { getRecipes } from "@/lib/db/recipes";
import RecipeList from "@/components/recipe-list";

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const recipes = await getRecipes();
  return <RecipeList recipes={recipes} />;
}
