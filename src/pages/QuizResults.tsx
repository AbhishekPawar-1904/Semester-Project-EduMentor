import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Briefcase, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

interface QuizResult {
  id: string;
  created_at: string;
  recommended_careers: string[];
  scores: any;
}

interface Career {
  id: string;
  name: string;
  description: string;
  average_salary: string;
  growth_rate: string;
  education_requirements: string;
  required_skills: string[];
  image_url: string;
}

export default function QuizResults() {
  const [results, setResults] = useState<QuizResult | null>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchQuizResults();
  }, []);

  const fetchQuizResults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: quizData, error: quizError } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (quizError) throw quizError;

      if (!quizData) {
        toast({
          title: "No Results Found",
          description: "Please take the career assessment quiz first.",
          variant: "destructive",
        });
        navigate("/quiz");
        return;
      }

      setResults(quizData);

      if (quizData.recommended_careers && quizData.recommended_careers.length > 0) {
        const { data: careersData, error: careersError } = await supabase
          .from("careers")
          .select("*")
          .in("name", quizData.recommended_careers);

        if (careersError) throw careersError;
        setCareers(careersData || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Your Career Assessment Results</h1>
            <p className="text-muted-foreground">
              Based on your responses, here are your personalized career recommendations
            </p>
          </div>

          {results && (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Your Aptitude Scores
                  </CardTitle>
                  <CardDescription>Areas where you excel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(results.scores).map(([category, score]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{category}</span>
                          <span className="text-sm text-muted-foreground">{String(score)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Briefcase className="h-6 w-6" />
                  Recommended Careers
                </h2>
              </div>

              {careers.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {careers.map((career) => (
                    <Card key={career.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="h-48 overflow-hidden">
                        <img
                          src={career.image_url}
                          alt={career.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle>{career.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {career.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Average Salary</p>
                          <Badge variant="secondary">{career.average_salary}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Growth Rate</p>
                          <Badge variant="secondary">{career.growth_rate}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Required Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {career.required_skills.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={() => navigate("/careers")}
                          className="w-full"
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Explore Career Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No matching careers found. Please try taking the quiz again.
                    </p>
                    <Button onClick={() => navigate("/quiz")} className="mt-4">
                      Retake Quiz
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="mt-8 flex justify-center gap-4">
                <Button onClick={() => navigate("/mentors")} size="lg">
                  Find a Mentor
                </Button>
                <Button onClick={() => navigate("/quiz")} variant="outline" size="lg">
                  Retake Assessment
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
