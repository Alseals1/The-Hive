import { useState } from "react";
import type { FC } from "react";
import { CalendarPlus, Calendar } from "lucide-react";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/shared/PageShell";
import { TeamBottomNav } from "@/components/shared/BottomNav";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyState } from "@/components/shared/EmptyState";
import { useTeamEvents, useDeleteEvent } from "../hooks/useEvents";
import { EventCard } from "./EventCard";
import { CreateEventSheet } from "./CreateEventSheet";
import { TournamentSheet } from "./TournamentSheet";
import type { EventWithAttendance } from "../types";

export const SchedulePage: FC = () => {
  const { teamId } = useParams({ from: "/teams/$teamId/schedule" });
  const { userRole } = useRouteContext({ from: "/teams/$teamId" });
  const { data: events, isLoading, error, refetch } = useTeamEvents(teamId);
  const { mutate: deleteEvent } = useDeleteEvent(teamId);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<EventWithAttendance | undefined>(undefined);
  const [tournament, setTournament] = useState<EventWithAttendance | undefined>(undefined);

  function handleEdit(event: EventWithAttendance) {
    setEditing(event);
    setShowCreate(true);
  }

  function handleCloseSheet() {
    setShowCreate(false);
    setEditing(undefined);
  }

  const canManage = userRole === "admin" || userRole === "coach";

  // Separate upcoming vs past
  const now = new Date();
  const upcoming = (events ?? []).filter(
    (e) => new Date(e.starts_at) >= now,
  );
  const past = (events ?? []).filter((e) => new Date(e.starts_at) < now);

  return (
    <PageShell
      header={
        <PageHeader
          title="Schedule"
          backTo="/teams"
          action={
            canManage ? (
              <button
                onClick={() => setShowCreate(true)}
                className="p-2 rounded-lg text-pitch-300 active:bg-pitch-700"
                aria-label="Add event"
              >
                <CalendarPlus size={22} />
              </button>
            ) : undefined
          }
        />
      }
      footer={<TeamBottomNav teamId={teamId} />}
      withNav
    >
      {showCreate && (
        <CreateEventSheet
          teamId={teamId}
          onClose={handleCloseSheet}
          existing={editing}
        />
      )}

      {tournament && (
        <TournamentSheet
          tournament={tournament}
          teamId={teamId}
          canManage={canManage}
          onClose={() => setTournament(undefined)}
        />
      )}

      <div className="px-4 py-6">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && !isLoading && (
          <ErrorMessage
            message={
              error instanceof Error ? error.message : "Failed to load schedule"
            }
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !error && (events ?? []).length === 0 && (
          <EmptyState
            icon={<Calendar size={24} />}
            title="No events yet"
            description={
              canManage
                ? "Tap the + button to add your first event"
                : "Your coach hasn't added any events yet"
            }
            action={
              canManage
                ? {
                    label: "Add Event",
                    onClick: () => setShowCreate(true),
                  }
                : undefined
            }
          />
        )}

        {!isLoading && !error && (events ?? []).length > 0 && (
          <div className="space-y-8">
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section>
                <h2 className="font-display text-xs font-600 uppercase tracking-widest text-pitch-400 mb-3">
                  Upcoming · {upcoming.length}
                </h2>
                <div className="space-y-3">
                  {upcoming.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      teamId={teamId}
                      canDelete={canManage}
                      onDelete={deleteEvent}
                      onEdit={canManage ? handleEdit : undefined}
                      onViewTournament={setTournament}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Past */}
            {past.length > 0 && (
              <section>
                <h2 className="font-display text-xs font-600 uppercase tracking-widest text-pitch-500 mb-3">
                  Past · {past.length}
                </h2>
                <div className="space-y-3 opacity-50">
                  {past.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      teamId={teamId}
                      canDelete={canManage}
                      onDelete={deleteEvent}
                      onEdit={canManage ? handleEdit : undefined}
                      onViewTournament={setTournament}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
};
