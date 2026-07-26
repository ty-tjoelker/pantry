import { getRestrictions } from "@/lib/db/dietary-restrictions";
import NewRecipeClient from "@/components/new-recipe-client";

export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
  const restrictions = await getRestrictions();
  return <NewRecipeClient restrictions={restrictions} />;
}
