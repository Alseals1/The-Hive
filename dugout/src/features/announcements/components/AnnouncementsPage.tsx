import { useState } from "react";
import type { FC } from "react";
import { PenLine, Megaphone } from "lucide-react";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import { PageShell, PageHeader } from "@/components/shared/PageShell";
import { TeamBottomNav } from "@/components/shared/BottomNav";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useTeamAnnouncements, useDeleteAnnouncement } from "../hooks/useAnnouncements";
import { AnnouncementCard } from "./AnnouncementCard";
import { CreateAnnouncementSheet } from "./CreateAnnouncementSheet";
import type { AnnouncementWithReactions } from "../types";

export const AnnouncementsPage: FC = () => {
  const { teamId } = useParams({ from: "/teams/$teamId/announcements" });
  const { userRole } = useRouteContext({ from: "/teams/$teamId" });
  const { data: announcements, isLoading, error, refetch } =
    useTeamAnnouncements(teamId);
  const { mutate: deleteAnnouncement, isPending: isDeleting } = useDeleteAnnouncement(teamId);

  const [showSheet, setShowSheet] = useState(false);
  const [editing, setEditing] = useState<AnnouncementWithReactions | undefined>(
    undefined,
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const canPost = userRole === "admin" || userRole === "coach";

  function handleEdit(a: AnnouncementWithReactions) {
    setEditing(a);
    setShowSheet(true);
  }

  function handleCloseSheet() {
    setShowSheet(false);
    setEditing(undefined);
  }

  return (
    <>
    <Helmet><title>Announcements | Dugout</title></Helmet>
    <PageShell
      header={
        <PageHeader
          title="News"
          backTo="/teams"
          action={
            canPost ? (
              <button
                onClick={() => setShowSheet(true)}
                className="p-2 rounded-lg text-pitch-300 active:bg-pitch-700"
                aria-label="New announcement"
              >
                <PenLine size={22} />
              </button>
            ) : undefined
          }
        />
      }
      footer={<TeamBottomNav teamId={teamId} />}
      withNav
    >
      {showSheet && (
        <CreateAnnouncementSheet
          teamId={teamId}
          onClose={handleCloseSheet}
          existing={editing}
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
              error instanceof Error
                ? error.message
                : "Failed to load announcements"
            }
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !error && (announcements ?? []).length === 0 && (
          <EmptyState
            icon={<Megaphone size={24} />}
            title={canPost ? "First announcement?" : "Nothing from Coach yet"}
            description={
              canPost
                ? "Your team is listening."
                : "Stay tuned."
            }
            action={
              canPost
                ? { label: "Write a Post", onClick: () => setShowSheet(true) }
                : undefined
            }
          />
        )}

        {!isLoading && !error && (announcements ?? []).length > 0 && (
          <div className="space-y-3">
            {announcements!.map((a) => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                teamId={teamId}
                canPost={canPost}
                onEdit={handleEdit}
                onDelete={setDeleteConfirmId}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteAnnouncement(deleteConfirmId, {
              onSuccess: () => setDeleteConfirmId(null),
            });
          }
        }}
        title="Delete Announcement?"
        description="This announcement will be permanently removed."
        isPending={isDeleting}
      />
    </PageShell>
    </>
  );
};
