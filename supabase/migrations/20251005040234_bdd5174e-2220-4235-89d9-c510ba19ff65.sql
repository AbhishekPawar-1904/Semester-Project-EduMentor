-- Fix role security by creating separate user_roles table
CREATE TYPE public.app_role AS ENUM ('student', 'mentor', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own student role"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id AND role = 'student');

-- Update handle_new_user function to use user_roles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student')
  );
  
  -- Insert default student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Insert sample careers data
INSERT INTO public.careers (name, description, average_salary, growth_rate, education_requirements, required_skills, image_url) VALUES
('Software Engineer', 'Design, develop, and maintain software applications and systems', '$95,000 - $150,000', '22% (Much faster than average)', 'Bachelor''s degree in Computer Science or related field', ARRAY['Programming', 'Problem Solving', 'Algorithms', 'Data Structures', 'Software Development'], 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'),
('Data Scientist', 'Analyze complex data to help companies make better decisions', '$100,000 - $160,000', '36% (Much faster than average)', 'Bachelor''s degree in Statistics, Mathematics, or Computer Science', ARRAY['Statistics', 'Machine Learning', 'Python', 'Data Analysis', 'SQL'], 'https://images.unsplash.com/photo-1551288049-bebda4e38f71'),
('Mechanical Engineer', 'Design and build mechanical systems and devices', '$75,000 - $120,000', '7% (As fast as average)', 'Bachelor''s degree in Mechanical Engineering', ARRAY['CAD', 'Thermodynamics', 'Mechanics', 'Problem Solving', 'Mathematics'], 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789'),
('Graphic Designer', 'Create visual concepts to communicate ideas that inspire and inform', '$45,000 - $75,000', '3% (As fast as average)', 'Bachelor''s degree in Graphic Design or related field', ARRAY['Adobe Creative Suite', 'Typography', 'Color Theory', 'Creativity', 'Communication'], 'https://images.unsplash.com/photo-1561070791-2526d30994b5'),
('Civil Engineer', 'Design and oversee construction of infrastructure projects', '$70,000 - $110,000', '8% (Faster than average)', 'Bachelor''s degree in Civil Engineering', ARRAY['AutoCAD', 'Project Management', 'Structural Analysis', 'Problem Solving', 'Mathematics'], 'https://images.unsplash.com/photo-1503387762-592deb58ef4e'),
('Physician', 'Diagnose and treat illnesses and injuries', '$200,000 - $350,000', '3% (As fast as average)', 'Medical degree (MD or DO) and residency', ARRAY['Medical Knowledge', 'Patient Care', 'Communication', 'Critical Thinking', 'Empathy'], 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d');

-- Insert sample colleges
INSERT INTO public.colleges (name, location, ranking, website_url, courses_offered, admission_requirements) VALUES
('Massachusetts Institute of Technology', 'Cambridge, MA', 1, 'https://www.mit.edu', ARRAY['Computer Science', 'Engineering', 'Physics', 'Mathematics'], 'SAT: 1500+, GPA: 4.0+, Strong essays and recommendations'),
('Stanford University', 'Stanford, CA', 2, 'https://www.stanford.edu', ARRAY['Computer Science', 'Engineering', 'Business', 'Medicine'], 'SAT: 1470+, GPA: 3.9+, Leadership experience'),
('Harvard University', 'Cambridge, MA', 3, 'https://www.harvard.edu', ARRAY['Medicine', 'Law', 'Business', 'Liberal Arts'], 'SAT: 1480+, GPA: 4.0+, Exceptional achievements'),
('California Institute of Technology', 'Pasadena, CA', 4, 'https://www.caltech.edu', ARRAY['Physics', 'Engineering', 'Chemistry', 'Mathematics'], 'SAT: 1530+, GPA: 4.0+, Strong STEM background'),
('Carnegie Mellon University', 'Pittsburgh, PA', 5, 'https://www.cmu.edu', ARRAY['Computer Science', 'Engineering', 'Robotics', 'Design'], 'SAT: 1460+, GPA: 3.9+, Portfolio for design programs');

-- Insert sample scholarships
INSERT INTO public.scholarships (title, description, amount, eligibility, deadline, application_url) VALUES
('STEM Excellence Scholarship', 'Merit-based scholarship for students pursuing STEM degrees', '$5,000 - $10,000', 'Minimum 3.5 GPA, pursuing STEM degree, US citizen or permanent resident', '2025-03-15', 'https://example.com/stem-scholarship'),
('First Generation College Student Grant', 'Support for first-generation college students', '$2,500 - $7,500', 'First-generation college student, family income below $75,000', '2025-04-30', 'https://example.com/first-gen-grant'),
('Women in Technology Scholarship', 'Encouraging women to pursue careers in technology', '$3,000 - $8,000', 'Female students pursuing computer science or related field', '2025-02-28', 'https://example.com/women-tech'),
('National Merit Scholarship', 'Academic excellence scholarship', '$2,500 - $10,000', 'PSAT/NMSQT scores in top 1%, US citizen', '2025-05-31', 'https://example.com/merit-scholarship');

-- Insert sample resources
INSERT INTO public.resources (title, description, type, url, language, thumbnail_url, career_id) VALUES
('Introduction to Programming', 'Learn the basics of programming with Python', 'video', 'https://www.youtube.com/watch?v=example', 'English', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea', (SELECT id FROM careers WHERE name = 'Software Engineer' LIMIT 1)),
('Data Science Handbook', 'Comprehensive guide to data science concepts and techniques', 'pdf', 'https://example.com/data-science.pdf', 'English', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71', (SELECT id FROM careers WHERE name = 'Data Scientist' LIMIT 1)),
('Mechanical Engineering Fundamentals', 'Core principles of mechanical engineering', 'course', 'https://example.com/mech-eng-course', 'English', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789', (SELECT id FROM careers WHERE name = 'Mechanical Engineer' LIMIT 1)),
('Design Thinking Workshop', 'Learn human-centered design principles', 'article', 'https://example.com/design-thinking', 'English', 'https://images.unsplash.com/photo-1561070791-2526d30994b5', (SELECT id FROM careers WHERE name = 'Graphic Designer' LIMIT 1));