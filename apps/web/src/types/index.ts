// Re-export generated Supabase types for convenience
export type { Database, Tables, TablesInsert, TablesUpdate } from "./database";

// Enum aliases derived from the database schema
import type { Database } from "./database";

export type TeamRole = Database["public"]["Enums"]["team_role"];
export type EventType = Database["public"]["Enums"]["event_type"];
export type AttendanceStatus = Database["public"]["Enums"]["attendance_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
