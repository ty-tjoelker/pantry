export type DietaryRestrictionMode = "exclude" | "limit";

export interface DietaryRestriction {
  id: string;
  tag: string;
  mode: DietaryRestrictionMode;
  created_at: string;
}
