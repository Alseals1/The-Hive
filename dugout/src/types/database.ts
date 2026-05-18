// Placeholder for auto-generated Supabase types.
// After creating your Supabase project, run:
//   npx supabase gen types typescript --linked > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          sport: string;
          season: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sport?: string;
          season?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sport?: string;
          season?: string | null;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: "admin" | "coach" | "manager" | "player" | "parent";
          joined_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role?: "admin" | "coach" | "manager" | "player" | "parent";
          joined_at?: string;
        };
        Update: {
          role?: "admin" | "coach" | "manager" | "player" | "parent";
        };
      };
      team_invites: {
        Row: {
          id: string;
          team_id: string;
          token: string;
          role: "admin" | "coach" | "manager" | "player" | "parent";
          created_by: string | null;
          expires_at: string | null;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          token?: string;
          role?: "admin" | "coach" | "manager" | "player" | "parent";
          created_by?: string | null;
          expires_at?: string | null;
        };
        Update: {
          used_at?: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          team_id: string;
          title: string;
          type: "game" | "practice" | "tournament" | "other";
          description: string | null;
          location: string | null;
          starts_at: string;
          ends_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          title: string;
          type?: "game" | "practice" | "tournament" | "other";
          description?: string | null;
          location?: string | null;
          starts_at: string;
          ends_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          title?: string;
          type?: "game" | "practice" | "tournament" | "other";
          description?: string | null;
          location?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          updated_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: "yes" | "no" | "maybe";
          note: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status: "yes" | "no" | "maybe";
          note?: string | null;
        };
        Update: {
          status?: "yes" | "no" | "maybe";
          note?: string | null;
          updated_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          team_id: string;
          author_id: string | null;
          title: string;
          body: string;
          pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          author_id?: string | null;
          title: string;
          body: string;
          pinned?: boolean;
        };
        Update: {
          title?: string;
          body?: string;
          pinned?: boolean;
          updated_at?: string;
        };
      };
      walkup_songs: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          song_title: string;
          artist: string | null;
          url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          song_title: string;
          artist?: string | null;
          url?: string | null;
        };
        Update: {
          song_title?: string;
          artist?: string | null;
          url?: string | null;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          amount_cents: number;
          description: string;
          due_date: string | null;
          status: "pending" | "paid" | "waived" | "overdue";
          stripe_session_id: string | null;
          paid_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          amount_cents: number;
          description: string;
          due_date?: string | null;
          status?: "pending" | "paid" | "waived" | "overdue";
          created_by?: string | null;
        };
        Update: {
          status?: "pending" | "paid" | "waived" | "overdue";
          stripe_session_id?: string | null;
          paid_at?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      team_role: "admin" | "coach" | "manager" | "player" | "parent";
      event_type: "game" | "practice" | "tournament" | "other";
      attendance_status: "yes" | "no" | "maybe";
      payment_status: "pending" | "paid" | "waived" | "overdue";
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
