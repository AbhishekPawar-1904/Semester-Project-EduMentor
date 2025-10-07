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
    <div className="min-h-screen bg-background bg-grid-pattern">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
              Your Career Assessment Results
            </h1>
            <p className="text-lg text-muted-foreground">
              Based on your responses, here are your personalized career recommendations
            </p>
          </div>

          {results && (
            <>
              <Card className="mb-8 shadow-glow animate-fade-in hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Your Aptitude Scores
                  </CardTitle>
                  <CardDescription>Areas where you excel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {Object.entries(results.scores).map(([category, score], idx) => (
                      <div key={category} className="space-y-2 animate-slide-up" style={{animationDelay: `${idx * 0.1}s`}}>
                        <div className="flex justify-between items-center">
                          <span className="text-base font-semibold capitalize">{category}</span>
                          <span className="text-sm text-muted-foreground font-medium">{String(score)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 rounded-full transition-all duration-1000 ease-out"
                            style={{ 
                              width: `${score}%`,
                              background: 'var(--gradient-primary)'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="mb-6 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                  <Briefcase className="h-7 w-7 text-primary" />
                  Recommended Careers
                </h2>
              </div>

              {careers.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {careers.map((career, idx) => (
                    <Card 
                      key={career.id} 
                      className="overflow-hidden shadow-glow hover-lift animate-fade-in border-2 border-transparent hover:border-primary transition-all"
                      style={{animationDelay: `${idx * 0.15}s`}}
                    >
                      <div className="h-52 overflow-hidden relative">
                        <img
                          src={career.image_url}
                          alt={career.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-2xl">{career.name}</CardTitle>
                        <CardDescription className="line-clamp-2 text-base">
                          {career.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2 text-muted-foreground">Average Salary</p>
                            <Badge variant="secondary" className="text-sm px-3 py-1">{career.average_salary}</Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2 text-muted-foreground">Growth Rate</p>
                            <Badge variant="secondary" className="text-sm px-3 py-1">{career.growth_rate}</Badge>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Required Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {career.required_skills.slice(0, 3).map((skill, skillIdx) => (
                              <Badge key={skillIdx} variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={() => navigate("/careers")}
                          className="w-full hover:scale-105 transition-transform hover-glow"
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Explore Career Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="animate-fade-in shadow-glow">
                  <CardContent className="py-16 text-center">
                    <p className="text-lg text-muted-foreground mb-4">
                      No matching careers found. Please try taking the quiz again.
                    </p>
                    <Button onClick={() => navigate("/quiz")} className="mt-4 hover:scale-105 transition-transform hover-glow">
                      Retake Quiz
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-fade-in" style={{animationDelay: '0.5s'}}>
                <Button 
                  onClick={() => navigate("/mentors")} 
                  size="lg"
                  className="hover:scale-105 transition-transform hover-glow"
                >
                  Find a Mentor
                </Button>
                <Button 
                  onClick={() => navigate("/quiz")} 
                  variant="outline" 
                  size="lg"
                  className="hover:scale-105 transition-transform"
                >
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
