// Database Types for Supabase Schema

// Authentication Types (matching Supabase auth types)
export interface User {
  id: string;
  email?: string;
  created_at: string;
  updated_at?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

// Profile Types
export interface Profile {
  id: string; // UUID, matches auth.users.id
  name: string;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Omit<Profile, "created_at" | "updated_at">;
export type ProfileUpdate = Partial<
  Omit<Profile, "id" | "created_at" | "updated_at">
>;

// Category Types
export interface Category {
  id: string; // Primary key (text)
  name: string;
  icon?: string; // Optional emoji or icon
  created_at: string;
}

export type CategoryInsert = Omit<Category, "created_at">;

// Group Types
export interface Group {
  id: string; // UUID
  name: string;
  owner_id: string; // UUID, references profiles.id
  created_at: string;
  updated_at: string;
}

export type GroupInsert = Omit<Group, "id" | "created_at" | "updated_at">;
export type GroupUpdate = Partial<
  Omit<Group, "id" | "owner_id" | "created_at" | "updated_at">
>;

// Group Member Types
export interface GroupMember {
  id: string; // UUID
  group_id: string; // UUID, references groups.id
  profile_id: string; // UUID, references profiles.id
  joined_at: string;
}

export type GroupMemberInsert = Omit<GroupMember, "id" | "joined_at">;

// Extended Group with Members
export interface GroupWithMembers extends Group {
  members: Profile[];
  member_count: number;
}

// Split Details Types
export interface SplitDetails {
  type: "equal" | "percentage" | "custom";
  participants: {
    profile_id: string;
    amount: number;
    percentage?: number;
  }[];
}

// Expense Types
export interface Expense {
  id: string; // UUID
  description: string;
  amount: number; // Decimal with 2 places
  category_id: string | null; // Foreign key to categories
  expense_date: string; // ISO timestamp
  is_group_expense: boolean;
  group_id: string | null; // UUID, foreign key to groups (if group expense)
  paid_by_profile_id: string; // UUID, foreign key to profiles
  involved_profile_ids: string[]; // Array of UUIDs
  split_details: SplitDetails | null; // JSONB
  notes?: string; // Optional
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export type ExpenseInsert = Omit<Expense, "id" | "created_at" | "updated_at">;
export type ExpenseUpdate = Partial<
  Omit<Expense, "id" | "created_at" | "updated_at">
>;

// Extended Expense with joined data
export interface ExpenseWithDetails extends Expense {
  category?: Category;
  paid_by_profile?: Profile;
  involved_profiles?: Profile[];
  group?: Group;
}

// Common response types
export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface DatabaseListResponse<T> {
  data: T[] | null;
  error: Error | null;
}

// Filter types for queries
export interface ExpenseFilters {
  category_id?: string;
  is_group_expense?: boolean;
  group_id?: string;
  paid_by_profile_id?: string;
  date_from?: string;
  date_to?: string;
  involved_profile_id?: string;
}

export interface DateRange {
  start: string;
  end: string;
}

// Statistics types
export interface ExpenseStats {
  total_amount: number;
  expense_count: number;
  average_amount: number;
  category_breakdown: {
    category_id: string;
    category_name: string;
    total_amount: number;
    expense_count: number;
  }[];
  monthly_totals: {
    month: string;
    total_amount: number;
    expense_count: number;
  }[];
}

// Authentication event types
export type AuthEvent =
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED"
  | "PASSWORD_RECOVERY";

export interface AuthStateChangeCallback {
  (event: AuthEvent, session: Session | null): void;
}
