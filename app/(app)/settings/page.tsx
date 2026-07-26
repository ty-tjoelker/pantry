import { getRestrictions } from "@/lib/db/dietary-restrictions";
import DietaryRestrictionsList from "@/components/dietary-restrictions-list";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const restrictions = await getRestrictions();
  return <DietaryRestrictionsList initialRestrictions={restrictions} />;
}
