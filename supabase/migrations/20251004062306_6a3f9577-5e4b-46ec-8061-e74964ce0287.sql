-- Create enum types
CREATE TYPE public.user_role AS ENUM ('student', 'mentor', 'admin');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'accepted', 'completed', 'cancelled');
CREATE TYPE public.mentor_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.resource_type AS ENUM ('pdf', 'article', 'video', 'course');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student profiles
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  grade TEXT,
  city TEXT,
  preferred_language TEXT DEFAULT 'English',
  interests TEXT[],
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mentor profiles
CREATE TABLE public.mentor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  expertise TEXT[],
  experience_years INTEGER,
  bio TEXT,
  education TEXT,
  company TEXT,
  status public.mentor_status DEFAULT 'pending',
  hourly_rate DECIMAL(10,2),
  availability JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Careers table
CREATE TABLE public.careers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  average_salary TEXT,
  required_skills TEXT[],
  growth_rate TEXT,
  education_requirements TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Colleges table
CREATE TABLE public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  ranking INTEGER,
  website_url TEXT,
  courses_offered TEXT[],
  admission_requirements TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quiz results table
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_data JSONB NOT NULL,
  scores JSONB NOT NULL,
  recommended_careers UUID[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status public.appointment_status DEFAULT 'pending',
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Resources table
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type public.resource_type NOT NULL,
  url TEXT NOT NULL,
  language TEXT DEFAULT 'English',
  career_id UUID REFERENCES public.careers(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scholarships table
CREATE TABLE public.scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  amount TEXT,
  deadline DATE,
  eligibility TEXT,
  application_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for student_profiles
CREATE POLICY "Students can view own profile"
  ON public.student_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can update own profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mentor_profiles
CREATE POLICY "Everyone can view approved mentors"
  ON public.mentor_profiles FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Mentors can update own profile"
  ON public.mentor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Mentors can insert own profile"
  ON public.mentor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for careers (public read)
CREATE POLICY "Everyone can view careers"
  ON public.careers FOR SELECT
  USING (true);

-- RLS Policies for colleges (public read)
CREATE POLICY "Everyone can view colleges"
  ON public.colleges FOR SELECT
  USING (true);

-- RLS Policies for quiz_results
CREATE POLICY "Students can view own quiz results"
  ON public.quiz_results FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own quiz results"
  ON public.quiz_results FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- RLS Policies for appointments
CREATE POLICY "Users can view their appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = mentor_id);

CREATE POLICY "Students can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Mentors and students can update their appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = student_id OR auth.uid() = mentor_id);

-- RLS Policies for resources (public read)
CREATE POLICY "Everyone can view resources"
  ON public.resources FOR SELECT
  USING (true);

-- RLS Policies for scholarships (public read)
CREATE POLICY "Everyone can view scholarships"
  ON public.scholarships FOR SELECT
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();