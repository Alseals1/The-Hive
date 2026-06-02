export type SupplyItem = {
  id: string;
  event_id: string;
  team_id: string;
  label: string;
  sort_order: number;
  created_at: string;
  claimer_name: string | null;
  claimer_user_id: string | null;
  claimed_by_me: boolean;
};

export type SupplyItemInsert = {
  event_id: string;
  team_id: string;
  label: string;
};
