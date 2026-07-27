import { getPantry } from "@/lib/db/pantry";
import { getRestrictions } from "@/lib/db/dietary-restrictions";
import { getDistinctCategories } from "@/lib/db/items";
import PantryList from "@/components/pantry-list";

export const dynamic = "force-dynamic";

export default async function PantryPage() {
  const [items, restrictions, categories] = await Promise.all([
    getPantry(),
    getRestrictions(),
    getDistinctCategories(),
  ]);
  return <PantryList initialItems={items} restrictions={restrictions} categories={categories} />;
}
