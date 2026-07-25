import { getMealPlanWeek } from "@/lib/db/meal-plan";
import { startOfWeek, toISODate } from "@/lib/dates";
import MealPlanWeek from "@/components/meal-plan-week";

export const dynamic = "force-dynamic";

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const weekStart = week ?? startOfWeek(toISODate(new Date()));
  const entries = await getMealPlanWeek(weekStart);

  return <MealPlanWeek weekStart={weekStart} initialEntries={entries} />;
}
