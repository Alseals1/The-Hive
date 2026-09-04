import { createFileRoute } from "@tanstack/react-router";
import { RosterPage } from "@/features/roster/components/RosterPage";

export const Route = createFileRoute("/teams/$teamId/roster")({
  component: RosterPage,
});
