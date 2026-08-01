import { createFileRoute } from "@tanstack/react-router";
import { TeamSettingsPage } from "@/features/teams/components/TeamSettingsPage";

export const Route = createFileRoute("/teams/$teamId/settings")({
  component: TeamSettingsPage,
});
