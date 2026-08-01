import { useState, lazy, Suspense } from "react";
import { AttendanceDetailSheet } from "@/features/attendance/components/AttendanceDetailSheet";
import type { FC } from "react";
import { CalendarPlus, Calendar } from "lucide-react";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import { PageShell, PageHeader } from "@/components/shared/PageShell";
import { TeamBottomNav } from "@/components/shared/BottomNav";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useTeamEvents, useDeleteEvent } from "../hooks/useEvents";
import { EventCard } from "./EventCard";
import { CreateEventSheet } from "./CreateEventSheet";
import type { EventWithAttendance } from "../types";
import { isEventPast } from "../utils/eventTiming";
import { WelcomeFlow } from "@/features/onboarding/components/WelcomeFlow";
import { useWelcomeFlow } from "@/features/onboarding/hooks/useWelcomeFlow";
import { useUser } from "@/hooks/useAuth";
import { useProfile } from "@/features/profile/hooks/useProfile";

const TournamentSheet = lazy(() => import("./TournamentSheet").then((m) => ({ default: m.TournamentSheet })));
const SupplyListSheet = lazy(() => import("./SupplyListSheet").then((m) => ({ default: m.SupplyListSheet })));

export const SchedulePage: FC = () => {
  const { teamId } = useParams({ from: "/teams/$teamId/schedule" });
  const { userRole } = useRouteContext({ from: "/teams/$teamId" });
  const { data: events, isLoading, error, refetch } = useTeamEvents(teamId);
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent(teamId);
  const { visible: showWelcome, dismiss: dismissWelcome } = useWelcomeFlow();
  const { user } = useUser();
  const { data: profile } = useProfile(user?.id ?? "");
  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<EventWithAttendance | undefined>(undefined);
  const [tournament, setTournament] = useState<EventWithAttendance | undefined>(undefined);
  const [suppliesEvent, setSuppliesEvent] = useState<EventWithAttendance | undefined>(undefined);
  const [rosterEvent, setRosterEvent] = useState<EventWithAttendance | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
  const upcoming = (events ?? []).filter((e) => !isEventPast(e.starts_at, now));
  const past = (events ?? []).filter((e) => isEventPast(e.starts_at, now));

  return (
    <>
    <Helmet><title>Schedule | Dugout</title></Helmet>
    {showWelcome && <WelcomeFlow firstName={firstName} onDismiss={dismissWelcome} />}
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
        <Suspense fallback={null}>
          <TournamentSheet
            tournament={tournament}
            teamId={teamId}
            canManage={canManage}
            onClose={() => setTournament(undefined)}
          />
        </Suspense>
      )}

      {suppliesEvent && (
        <Suspense fallback={null}>
          <SupplyListSheet
            event={suppliesEvent}
            teamId={teamId}
            userRole={userRole}
            onClose={() => setSuppliesEvent(undefined)}
          />
        </Suspense>
      )}

      {rosterEvent && (
        <AttendanceDetailSheet
          event={rosterEvent}
          onClose={() => setRosterEvent(undefined)}
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
              error instanceof Error ? error.message : "Couldn't load the schedule."
            }
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !error && (events ?? []).length === 0 && (
          <EmptyState
            icon={<Calendar size={24} />}
            title="No games on the board yet"
            description={
              canManage
                ? "Add your first event and let the season begin."
                : "Nothing scheduled yet. Your coach is probably working on it — check back soon."
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
                <h2 className="font-display text-xs font-600 uppercase tracking-widest text-zinc-300 mb-3">
                  Upcoming · {upcoming.length}
                </h2>
                <div className="space-y-3">
                  {upcoming.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      teamId={teamId}
                      isPast={false}
                      canDelete={canManage}
                      onDelete={canManage ? setDeleteConfirmId : undefined}
                      onEdit={canManage ? handleEdit : undefined}
                      onViewTournament={setTournament}
                      onViewSupplies={setSuppliesEvent}
                      onViewRoster={canManage ? setRosterEvent : undefined}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Past */}
            {past.length > 0 && (
              <section>
                <h2 className="font-display text-xs font-600 uppercase tracking-widest text-zinc-300 mb-3">
                  Past · {past.length}
                </h2>
                <div className="space-y-3 opacity-50">
                  {past.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      teamId={teamId}
                      isPast={true}
                      canDelete={canManage}
                      onDelete={canManage ? setDeleteConfirmId : undefined}
                      onEdit={canManage ? handleEdit : undefined}
                      onViewTournament={setTournament}
                      onViewSupplies={setSuppliesEvent}
                      onViewRoster={canManage ? setRosterEvent : undefined}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteEvent(deleteConfirmId, {
              onSuccess: () => setDeleteConfirmId(null),
            });
          }
        }}
        title="Delete Event?"
        description="This will permanently delete the event and all attendance data."
        isPending={isDeleting}
      />
    </PageShell>
    </>
  );
};
