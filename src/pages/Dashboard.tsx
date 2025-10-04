import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
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
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();
    setProfile(data);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name}!</h1>
          <p className="text-muted-foreground">
            {profile?.role === "student" 
              ? "Continue your career exploration journey"
              : "Manage your mentorship sessions"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-soft transition-shadow cursor-pointer" onClick={() => navigate("/quiz")}>
            <CardHeader>
              <Brain className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Career Quiz</CardTitle>
              <CardDescription>Discover your perfect career path</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-soft transition-shadow cursor-pointer" onClick={() => navigate("/appointments")}>
            <CardHeader>
              <Calendar className="h-8 w-8 text-accent mb-2" />
              <CardTitle>Sessions</CardTitle>
              <CardDescription>Manage your mentorship meetings</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-soft transition-shadow cursor-pointer" onClick={() => navigate("/resources")}>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-secondary mb-2" />
              <CardTitle>Resources</CardTitle>
              <CardDescription>Explore educational materials</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-soft transition-shadow cursor-pointer" onClick={() => navigate("/scholarships")}>
            <CardHeader>
              <Award className="h-8 w-8 text-success mb-2" />
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
    </div>
  );
};

export default Dashboard;
