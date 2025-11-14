import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Calendar, BookOpen, Award } from "lucide-react";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name}!</h1>
          <p className="text-muted-foreground">
            {profile?.role === "student" 
              ? "Continue your career exploration journey"
              : "Manage your mentorship sessions"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover-lift hover:border-primary transition-all cursor-pointer animate-fade-in" onClick={() => navigate("/quiz")} style={{animationDelay: '0.1s'}}>
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Career Quiz</CardTitle>
              <CardDescription>Discover your perfect career path</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift hover:border-accent transition-all cursor-pointer animate-fade-in" onClick={() => navigate("/careers")} style={{animationDelay: '0.2s'}}>
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Careers</CardTitle>
              <CardDescription>Explore career opportunities</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift hover:border-secondary transition-all cursor-pointer animate-fade-in" onClick={() => navigate("/mentors")} style={{animationDelay: '0.3s'}}>
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
                <BookOpen className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Mentors</CardTitle>
              <CardDescription>Connect with experts</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift hover:border-success transition-all cursor-pointer animate-fade-in" onClick={() => navigate("/scholarships")} style={{animationDelay: '0.4s'}}>
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-2">
                <Award className="h-6 w-6 text-success" />
              </div>
              <CardTitle>Scholarships</CardTitle>
              <CardDescription>Find funding opportunities</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {profile?.role === "student" && (
          <Card>
            <CardHeader>
              <CardTitle>Your Career Journey</CardTitle>
              <CardDescription>Start exploring your future today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={() => navigate("/quiz")} className="w-full md:w-auto">
                  Take Career Assessment
                </Button>
                <p className="text-sm text-muted-foreground">
                  Our AI-powered quiz analyzes your interests, skills, and goals to recommend the best career paths for you.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
