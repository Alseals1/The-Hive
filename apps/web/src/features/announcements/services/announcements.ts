import { supabase } from "@/lib/supabase";
import type {
  AnnouncementInsert,
  AnnouncementPatch,
  AnnouncementWithReactions,
  ReactionEmoji,
} from "../types";
import { REACTION_OPTIONS } from "../types";

export async function getTeamAnnouncements(
  teamId: string,
): Promise<AnnouncementWithReactions[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("announcements")
    .select(
      `
      id, team_id, author_id, title, body, pinned, created_at, updated_at,
      profiles!announcements_author_id_fkey (full_name),
      announcement_reactions!announcement_reactions_announcement_id_fkey (emoji, user_id)
    `,
    )
    .eq("team_id", teamId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const rawReactions = row.announcement_reactions ?? [];

    const reactions = REACTION_OPTIONS.map(({ emoji }) => ({
      emoji,
      count: rawReactions.filter((r) => r.emoji === emoji).length,
      reacted: rawReactions.some(
        (r) => r.emoji === emoji && r.user_id === user?.id,
      ),
    }));

    const profileRow = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;

    return {
      id: row.id,
      team_id: row.team_id,
      author_id: row.author_id,
      title: row.title,
      body: row.body,
      pinned: row.pinned,
      created_at: row.created_at,
      updated_at: row.updated_at,
      authorName: profileRow?.full_name ?? null,
      reactions,
    };
  });
}

export async function createAnnouncement(
  input: AnnouncementInsert,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("announcements").insert({
    ...input,
    author_id: user?.id ?? null,
  });

  if (error) throw new Error(error.message);
}

export async function updateAnnouncement(
  id: string,
  patch: AnnouncementPatch,
): Promise<void> {
  const { error } = await supabase
    .from("announcements")
    .update(patch)
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function toggleReaction(
  announcementId: string,
  emoji: ReactionEmoji,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("announcement_reactions")
    .select("id")
    .eq("announcement_id", announcementId)
    .eq("user_id", user.id)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("announcement_reactions")
      .delete()
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("announcement_reactions").insert({
      announcement_id: announcementId,
      user_id: user.id,
      emoji,
    });
    if (error) throw new Error(error.message);
  }
}
