


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."attendance_status" AS ENUM (
    'yes',
    'no',
    'maybe'
);


ALTER TYPE "public"."attendance_status" OWNER TO "postgres";


CREATE TYPE "public"."event_type" AS ENUM (
    'game',
    'practice',
    'tournament',
    'other'
);


ALTER TYPE "public"."event_type" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'pending',
    'paid',
    'waived',
    'overdue'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."team_role" AS ENUM (
    'admin',
    'coach',
    'manager',
    'player',
    'parent'
);


ALTER TYPE "public"."team_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_team_admin"("p_team_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id
      and user_id = auth.uid()
      and role in ('admin', 'coach')
  )
$$;


ALTER FUNCTION "public"."is_team_admin"("p_team_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_team_member"("p_team_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id
      and user_id = auth.uid()
  )
$$;


ALTER FUNCTION "public"."is_team_member"("p_team_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_teams_created_by"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  new.created_by = auth.uid();
  
  -- Ensure profile exists for this user (upsert to avoid conflicts)
  insert into public.profiles (id)
  values (auth.uid())
  on conflict (id) do nothing;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."set_teams_created_by"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."announcements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "author_id" "uuid",
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "pinned" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."announcements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."attendance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "public"."attendance_status" NOT NULL,
    "note" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."attendance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "type" "public"."event_type" DEFAULT 'practice'::"public"."event_type" NOT NULL,
    "description" "text",
    "location" "text",
    "starts_at" timestamp with time zone NOT NULL,
    "ends_at" timestamp with time zone,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "amount_cents" integer NOT NULL,
    "description" "text" NOT NULL,
    "due_date" "date",
    "status" "public"."payment_status" DEFAULT 'pending'::"public"."payment_status" NOT NULL,
    "stripe_session_id" "text",
    "paid_at" timestamp with time zone,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "payments_amount_cents_check" CHECK (("amount_cents" > 0))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_invites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "token" "text" DEFAULT ("gen_random_uuid"())::"text" NOT NULL,
    "role" "public"."team_role" DEFAULT 'parent'::"public"."team_role" NOT NULL,
    "created_by" "uuid",
    "expires_at" timestamp with time zone,
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."team_invites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."team_role" DEFAULT 'parent'::"public"."team_role" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "sport" "text" DEFAULT 'baseball'::"text" NOT NULL,
    "season" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."walkup_songs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "song_title" "text" NOT NULL,
    "artist" "text",
    "url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."walkup_songs" OWNER TO "postgres";


ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attendance"
    ADD CONSTRAINT "attendance_event_id_user_id_key" UNIQUE ("event_id", "user_id");



ALTER TABLE ONLY "public"."attendance"
    ADD CONSTRAINT "attendance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_invites"
    ADD CONSTRAINT "team_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_invites"
    ADD CONSTRAINT "team_invites_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_user_id_key" UNIQUE ("team_id", "user_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."walkup_songs"
    ADD CONSTRAINT "walkup_songs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."walkup_songs"
    ADD CONSTRAINT "walkup_songs_team_id_user_id_key" UNIQUE ("team_id", "user_id");



CREATE INDEX "announcements_team_id_created_at_idx" ON "public"."announcements" USING "btree" ("team_id", "created_at" DESC);



CREATE INDEX "attendance_event_id_idx" ON "public"."attendance" USING "btree" ("event_id");



CREATE INDEX "attendance_user_id_event_id_idx" ON "public"."attendance" USING "btree" ("user_id", "event_id");



CREATE INDEX "events_team_id_starts_at_idx" ON "public"."events" USING "btree" ("team_id", "starts_at");



CREATE INDEX "payments_team_id_status_idx" ON "public"."payments" USING "btree" ("team_id", "status");



CREATE INDEX "payments_user_id_status_idx" ON "public"."payments" USING "btree" ("user_id", "status");



CREATE INDEX "team_members_team_id_idx" ON "public"."team_members" USING "btree" ("team_id");



CREATE INDEX "team_members_user_id_idx" ON "public"."team_members" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "before_teams_insert" BEFORE INSERT ON "public"."teams" FOR EACH ROW EXECUTE FUNCTION "public"."set_teams_created_by"();



CREATE OR REPLACE TRIGGER "set_announcements_updated_at" BEFORE UPDATE ON "public"."announcements" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_attendance_updated_at" BEFORE UPDATE ON "public"."attendance" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_events_updated_at" BEFORE UPDATE ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_payments_updated_at" BEFORE UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_teams_updated_at" BEFORE UPDATE ON "public"."teams" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_walkup_songs_updated_at" BEFORE UPDATE ON "public"."walkup_songs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attendance"
    ADD CONSTRAINT "attendance_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attendance"
    ADD CONSTRAINT "attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_invites"
    ADD CONSTRAINT "team_invites_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."team_invites"
    ADD CONSTRAINT "team_invites_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."walkup_songs"
    ADD CONSTRAINT "walkup_songs_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."walkup_songs"
    ADD CONSTRAINT "walkup_songs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE "public"."announcements" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "announcements_select_members" ON "public"."announcements" FOR SELECT TO "authenticated" USING ("public"."is_team_member"("team_id"));



CREATE POLICY "announcements_write_admins" ON "public"."announcements" TO "authenticated" USING ("public"."is_team_admin"("team_id")) WITH CHECK ("public"."is_team_admin"("team_id"));



ALTER TABLE "public"."attendance" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "attendance_select_members" ON "public"."attendance" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."events" "e"
     JOIN "public"."team_members" "tm" ON (("tm"."team_id" = "e"."team_id")))
  WHERE (("e"."id" = "attendance"."event_id") AND ("tm"."user_id" = "auth"."uid"())))));



CREATE POLICY "attendance_update_own" ON "public"."attendance" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "attendance_upsert_own" ON "public"."attendance" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "events_select_members" ON "public"."events" FOR SELECT TO "authenticated" USING ("public"."is_team_member"("team_id"));



CREATE POLICY "events_write_admins" ON "public"."events" TO "authenticated" USING ("public"."is_team_admin"("team_id")) WITH CHECK ("public"."is_team_admin"("team_id"));



ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payments_insert_admins" ON "public"."payments" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_team_admin"("team_id"));



CREATE POLICY "payments_select_own" ON "public"."payments" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_team_admin"("team_id")));



CREATE POLICY "payments_update_admins" ON "public"."payments" FOR UPDATE TO "authenticated" USING ("public"."is_team_admin"("team_id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_select_authenticated" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



ALTER TABLE "public"."team_invites" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "team_invites_insert_admins" ON "public"."team_invites" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_team_admin"("team_id"));



CREATE POLICY "team_invites_select_admins" ON "public"."team_invites" FOR SELECT TO "authenticated" USING ("public"."is_team_admin"("team_id"));



CREATE POLICY "team_invites_select_by_token" ON "public"."team_invites" FOR SELECT USING ((("used_at" IS NULL) AND (("expires_at" IS NULL) OR ("expires_at" > "now"()))));



CREATE POLICY "team_invites_update_admins" ON "public"."team_invites" FOR UPDATE TO "authenticated" USING ("public"."is_team_admin"("team_id"));



CREATE POLICY "team_members_delete_admins" ON "public"."team_members" FOR DELETE TO "authenticated" USING (("public"."is_team_admin"("team_id") OR ("user_id" = "auth"."uid"())));



CREATE POLICY "team_members_insert_admins" ON "public"."team_members" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_team_admin"("team_id"));



CREATE POLICY "team_members_select" ON "public"."team_members" FOR SELECT TO "authenticated" USING ("public"."is_team_member"("team_id"));



CREATE POLICY "teams_delete_admins" ON "public"."teams" FOR DELETE TO "authenticated" USING ("public"."is_team_admin"("id"));



CREATE POLICY "teams_insert_authenticated" ON "public"."teams" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" IS NULL) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "teams_select_members" ON "public"."teams" FOR SELECT TO "authenticated" USING ("public"."is_team_member"("id"));



CREATE POLICY "teams_update_admins" ON "public"."teams" FOR UPDATE TO "authenticated" USING ("public"."is_team_admin"("id"));



ALTER TABLE "public"."walkup_songs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "walkup_songs_delete_admins" ON "public"."walkup_songs" FOR DELETE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_team_admin"("team_id")));



CREATE POLICY "walkup_songs_select_members" ON "public"."walkup_songs" FOR SELECT TO "authenticated" USING ("public"."is_team_member"("team_id"));



CREATE POLICY "walkup_songs_update_own" ON "public"."walkup_songs" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "walkup_songs_upsert_own" ON "public"."walkup_songs" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND "public"."is_team_member"("team_id")));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_team_admin"("p_team_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_team_admin"("p_team_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_team_admin"("p_team_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_team_member"("p_team_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_team_member"("p_team_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_team_member"("p_team_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_teams_created_by"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_teams_created_by"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_teams_created_by"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."announcements" TO "anon";
GRANT ALL ON TABLE "public"."announcements" TO "authenticated";
GRANT ALL ON TABLE "public"."announcements" TO "service_role";



GRANT ALL ON TABLE "public"."attendance" TO "anon";
GRANT ALL ON TABLE "public"."attendance" TO "authenticated";
GRANT ALL ON TABLE "public"."attendance" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."team_invites" TO "anon";
GRANT ALL ON TABLE "public"."team_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."team_invites" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."walkup_songs" TO "anon";
GRANT ALL ON TABLE "public"."walkup_songs" TO "authenticated";
GRANT ALL ON TABLE "public"."walkup_songs" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


