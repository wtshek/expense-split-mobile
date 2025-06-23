-- --- Cleanup Section (ensure this is at the top) ---
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS categories CASCADE; -- Ensure categories is dropped here too
DROP TABLE IF EXISTS profiles CASCADE;

-- --- Table Creation Section ---
-- (Your existing table creation code goes here)

-- 1. Create the profiles table
CREATE TABLE profiles (
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
name TEXT,
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the categories table
CREATE TABLE categories (
id TEXT PRIMARY KEY,
name TEXT NOT NULL UNIQUE,
icon TEXT,
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- Initial Category Data ---
INSERT INTO public.categories (id, name, icon) VALUES
('food', 'Food & Dining', '🍽️'),
('grocery', 'Groceries', '🛒'), -- Added 'grocery' category
('transport', 'Transportation', '🚗'),
('home', 'Home & Utilities', '🏠'),
('entertainment', 'Entertainment', '🎬'),
('shopping', 'Shopping', '🛍️'),
('health', 'Health & Fitness', '🏥'),
('travel', 'Travel', '✈️'),
('education', 'Education', '📚'),
('other', 'Other', '📦');

-- 3. Create the groups table
CREATE TABLE groups (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name TEXT NOT NULL,
created_at TIMESTAMPTZ DEFAULT NOW(),
owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- 4. Create the group_members table
CREATE TABLE group_members (
group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
joined_at TIMESTAMPTZ DEFAULT NOW(),
PRIMARY KEY (group_id, profile_id)
);

-- 5. Create the expenses table
CREATE TABLE expenses (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
description TEXT NOT NULL,
amount NUMERIC(10, 2) NOT NULL,
category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
expense_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
is_group_expense BOOLEAN NOT NULL DEFAULT FALSE,
group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
paid_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
involved_profile_ids UUID[] NOT NULL DEFAULT '{}',
split_details JSONB,
notes TEXT,
created_at TIMESTAMPTZ DEFAULT NOW(),
CONSTRAINT chk_group_expense_group_id CHECK (NOT is_group_expense OR (is_group_expense AND group_id IS NOT NULL))
);

-- --- Rest of your script (RLS, Functions, Triggers) follows here ---

-- --- Row Level Security (RLS) Configuration Section ---
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- --- SECURITY DEFINER FUNCTIONS ---
CREATE OR REPLACE FUNCTION public.is_member_of_group(p_group_id UUID, p_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
RETURN EXISTS (SELECT 1 FROM public.group_members WHERE group_id = p_group_id AND profile_id = p_profile_id);
END;

$$
;

--- Profiles RLS Policies ---
CREATE POLICY "Users can view their own profile." ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Group members can view other group members' profiles." ON profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm1
    JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.profile_id = auth.uid()
    AND gm2.profile_id = profiles.id
  )
);
CREATE POLICY "Users can create their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete their own profile." ON profiles FOR DELETE USING (auth.uid() = id);

--- Categories RLS Policies ---
CREATE POLICY "All authenticated users can read categories." ON categories FOR SELECT USING (auth.uid() IS NOT NULL);

--- Groups RLS Policies ---
CREATE POLICY "Group owners can manage their groups." ON groups FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Group members can view their groups." ON groups FOR SELECT USING (public.is_member_of_group(groups.id, auth.uid()));

--- Group Members RLS Policies ---
CREATE POLICY "Group owners can manage group members." ON group_members FOR ALL USING (EXISTS (SELECT 1 FROM groups WHERE id = group_id AND owner_id = auth.uid()));
CREATE POLICY "Users can remove themselves from groups." ON group_members FOR DELETE USING (profile_id = auth.uid());
CREATE POLICY "Users can join groups." ON group_members FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Group members can view other members in their group." ON group_members FOR SELECT USING (public.is_member_of_group(group_id, auth.uid()));

--- Expenses RLS Policies ---
CREATE POLICY "Expenses are viewable by group members or the paying user." ON expenses FOR SELECT USING (
    (is_group_expense AND public.is_member_of_group(expenses.group_id, auth.uid())) OR
    (NOT is_group_expense AND paid_by_profile_id = auth.uid())
);
CREATE POLICY "Users can create expenses." ON expenses FOR INSERT WITH CHECK (
    (is_group_expense AND public.is_member_of_group(expenses.group_id, auth.uid())) OR
    (NOT is_group_expense AND paid_by_profile_id = auth.uid())
);
CREATE POLICY "Users can update expenses." ON expenses FOR UPDATE USING (
    (is_group_expense AND public.is_member_of_group(expenses.group_id, auth.uid())) OR
    (NOT is_group_expense AND paid_by_profile_id = auth.uid())
);
CREATE POLICY "Users can delete expenses." ON expenses FOR DELETE USING (
    (is_group_expense AND public.is_member_of_group(expenses.group_id, auth.uid())) OR
    (NOT is_group_expense AND paid_by_profile_id = auth.uid())
);

--- Auth Trigger Function Section ---
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS
$$

BEGIN
INSERT INTO public.profiles (id)
VALUES (NEW.id);
RETURN NEW;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
$$
