-- 1. Create custom enum for user roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- 2. Profiles (Linked to auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role DEFAULT 'user',
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 5. Animals (Owned by profiles)
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  species TEXT,
  age_months INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Predictions (Linked to animals and owner)
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT,
  predicted_breed TEXT,
  predicted_disease TEXT,
  confidence_breed NUMERIC,
  confidence_disease NUMERIC,
  ai_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile.
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);


-- Animals: Users can perform all actions on their own animals.
CREATE POLICY "Users can manage own animals" ON animals FOR ALL USING (auth.uid() = owner_id);

-- Predictions: Users can perform all actions on their own predictions.
CREATE POLICY "Users can manage own predictions" ON predictions FOR ALL USING (auth.uid() = owner_id);


-- ==============================================
-- TRIGGERS
-- ==============================================

-- Function to handle new user signup and create a profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
