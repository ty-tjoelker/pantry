import { getGroceryList } from "@/lib/db/grocery-list";
import GroceryList from "@/components/grocery-list";

export const dynamic = "force-dynamic";

export default async function GroceryListPage() {
  const items = await getGroceryList();
  return <GroceryList initialItems={items} />;
}
