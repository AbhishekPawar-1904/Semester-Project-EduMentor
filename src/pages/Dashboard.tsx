import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Target, 
  Calendar, 
  MessageCircle, 
  BookOpen, 
  Award, 
  TrendingUp,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
}

interface StudentProfile {
  grade: string | null;
  interests: string[] | null;
  location: string | null;
  academic_goal: string | null;
  preferred_field: string | null;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch student-specific profile if user is a student
      if (profileData.role === 'student') {
        const { data: studentData, error: studentError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', user?.id)
          .maybeSingle();

        if (studentError && studentError.code !== 'PGRST116') throw studentError;
        setStudentProfile(studentData);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading profile",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <div className="grid gap-6 md:grid-cols-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              Welcome back, {profile?.full_name || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              {profile?.role === 'student' 
                ? "Continue your career discovery journey" 
                : "Help students discover their potential"}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-custom-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-2xl font-bold text-primary">{studentProfile ? 100 : 50}%</span>
                </div>
                <h3 className="font-semibold mb-1">Profile Complete</h3>
                <Progress value={studentProfile ? 100 : 50} className="h-2" />
              </CardContent>
            </Card>

            <Card className="hover:shadow-custom-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Target className="h-5 w-5 text-success" />
                  </div>
                  <span className="text-2xl font-bold text-success">0%</span>
                </div>
                <h3 className="font-semibold mb-1">Career Match</h3>
                <p className="text-sm text-muted-foreground">Take assessment quiz</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-custom-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="w-3 h-3 bg-warning rounded-full animate-pulse"></div>
                </div>
                <h3 className="font-semibold mb-1">Next Session</h3>
                <p className="text-sm text-muted-foreground">No upcoming sessions</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-custom-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-warning/10 rounded-lg">
                  <Award className="h-5 w-5 text-warning" />
                  </div>
                  <Award className="h-5 w-5 text-warning" />
                </div>
                <h3 className="font-semibold mb-1">Achievement</h3>
                <p className="text-sm text-muted-foreground">Quiz Master</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Career Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    Recommended Career Paths
                  </CardTitle>
                  <CardDescription>
                    Based on your aptitude assessment and interests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Complete your profile and take assessments to get personalized career recommendations</p>
                    <Button className="mt-4">Take Assessment Quiz</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-secondary" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No activities yet. Start exploring!</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="hero" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with Mentor
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Retake Assessment
                  </Button>
                  <Button variant="outline" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Explore Colleges
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Award className="h-4 w-4 mr-2" />
                    View Scholarships
                  </Button>
                </CardContent>
              </Card>

              {/* Current Mentor */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Mentor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No mentor assigned yet</p>
                    <Button variant="link" className="mt-2">Find a Mentor</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Profile Completion</span>
                      <span>{studentProfile ? 100 : 50}%</span>
                    </div>
                    <Progress value={studentProfile ? 100 : 50} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Assessments</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Career Exploration</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;