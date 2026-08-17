-- ============================================
-- HOUSEHOLDS
-- ============================================
CREATE TABLE households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  auth_user_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE households ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  display_name text NOT NULL,
  avatar_color text NOT NULL DEFAULT '#6366f1',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON profiles(household_id);
CREATE UNIQUE INDEX ON profiles(household_id, display_name);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PLANTS
-- ============================================
CREATE TABLE plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  species text,
  location text,
  photo_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON plants(household_id);

ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plants_updated_at
  BEFORE UPDATE ON plants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  -- ============================================
-- PLANT CARE TASKS
-- ============================================
CREATE TABLE plant_care_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid REFERENCES plants(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL CHECK (action IN ('water', 'fertilize', 'repot', 'prune', 'mist', 'rotate')),
  interval_days integer NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ON plant_care_tasks(plant_id, action);

ALTER TABLE plant_care_tasks ENABLE ROW LEVEL SECURITY;
-- ============================================
-- CARE LOGS
-- ============================================
CREATE TABLE care_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid REFERENCES plants(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) NOT NULL,
  action text NOT NULL CHECK (action IN ('water', 'fertilize', 'repot', 'prune', 'mist', 'rotate', 'note')),
  note text,
  logged_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON care_logs(plant_id);
CREATE INDEX ON care_logs(plant_id, action, logged_at DESC);

ALTER TABLE care_logs ENABLE ROW LEVEL SECURITY;

-- PRIVACY MEASURES --

-- ============================================
-- RLS HELPER FUNCTION - Household id lookup
-- ============================================
CREATE OR REPLACE FUNCTION get_household_id_for_auth()
RETURNS uuid AS $$
  SELECT id FROM households WHERE auth_user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;
-- ============================================
-- RLS POLICIES
-- ============================================

-- HOUSEHOLDS
CREATE POLICY "households_select" ON households FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "households_insert" ON households FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "households_update" ON households FOR UPDATE
  USING (auth_user_id = auth.uid());

-- PROFILES
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (household_id = get_household_id_for_auth());

CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (household_id = get_household_id_for_auth());

CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (household_id = get_household_id_for_auth());

CREATE POLICY "profiles_delete" ON profiles FOR DELETE
  USING (household_id = get_household_id_for_auth());

-- PLANTS
CREATE POLICY "plants_select" ON plants FOR SELECT
  USING (household_id = get_household_id_for_auth());

CREATE POLICY "plants_insert" ON plants FOR INSERT
  WITH CHECK (household_id = get_household_id_for_auth());

CREATE POLICY "plants_update" ON plants FOR UPDATE
  USING (household_id = get_household_id_for_auth());

CREATE POLICY "plants_delete" ON plants FOR DELETE
  USING (household_id = get_household_id_for_auth());

-- PLANT CARE TASKS
CREATE POLICY "plant_care_tasks_select" ON plant_care_tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM plants
    WHERE plants.id = plant_care_tasks.plant_id
      AND plants.household_id = get_household_id_for_auth()
  ));

CREATE POLICY "plant_care_tasks_insert" ON plant_care_tasks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM plants
    WHERE plants.id = plant_care_tasks.plant_id
      AND plants.household_id = get_household_id_for_auth()
  ));

CREATE POLICY "plant_care_tasks_update" ON plant_care_tasks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM plants
    WHERE plants.id = plant_care_tasks.plant_id
      AND plants.household_id = get_household_id_for_auth()
  ));

CREATE POLICY "plant_care_tasks_delete" ON plant_care_tasks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM plants
    WHERE plants.id = plant_care_tasks.plant_id
      AND plants.household_id = get_household_id_for_auth()
  ));

-- CARE LOGS
CREATE POLICY "care_logs_select" ON care_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM plants
    WHERE plants.id = care_logs.plant_id
      AND plants.household_id = get_household_id_for_auth()
  ));

CREATE POLICY "care_logs_insert" ON care_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM plants
    WHERE plants.id = care_logs.plant_id
      AND plants.household_id = get_household_id_for_auth()
  ));

CREATE POLICY "care_logs_delete" ON care_logs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM plants
    WHERE plants.id = care_logs.plant_id
      AND plants.household_id = get_household_id_for_auth()
  ));
  -- ============================================
-- STORAGE
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'plant-photos',
  'plant-photos',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

CREATE POLICY "storage_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'plant-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "storage_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'plant-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "storage_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'plant-photos' AND auth.uid() IS NOT NULL);