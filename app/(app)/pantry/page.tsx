import { getPantry } from "@/lib/db/pantry";
import PantryList from "@/components/pantry-list";

export const dynamic = "force-dynamic";

export default async function PantryPage() {
  const items = await getPantry();
  return <PantryList initialItems={items} />;
}
