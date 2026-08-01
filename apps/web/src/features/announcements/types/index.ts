import type { Tables } from "@/types";

export type Announcement = Tables<"announcements">;

export type ReactionEmoji = "thumbsup" | "heart" | "star" | "cheer" | "fire";

export const REACTION_OPTIONS: {
  emoji: ReactionEmoji;
  label: string;
  icon: string;
}[] = [
  { emoji: "thumbsup", label: "Nice",  icon: "👍" },
  { emoji: "heart",    label: "Love",  icon: "❤️" },
  { emoji: "star",     label: "Star",  icon: "⭐" },
  { emoji: "cheer",    label: "Hype",  icon: "🙌" },
  { emoji: "fire",     label: "Fire",  icon: "🔥" },
];

export interface AnnouncementReaction {
  emoji: ReactionEmoji;
  count: number;
  reacted: boolean;
}

export interface AnnouncementWithReactions extends Announcement {
  authorName: string | null;
  reactions: AnnouncementReaction[];
}

export type AnnouncementInsert = {
  team_id: string;
  title: string;
  body: string;
  pinned?: boolean;
};

export type AnnouncementPatch = {
  title?: string;
  body?: string;
  pinned?: boolean;
};
