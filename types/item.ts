export interface Item {
  id: string;
  name: string;
  default_unit: string | null;
  category: string | null;
  dietary_tags: string[];
  is_staple: boolean;
  created_at: string;
}
