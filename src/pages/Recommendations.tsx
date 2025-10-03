import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Briefcase,
  DollarSign,
  GraduationCap,
  Star,
  ArrowRight,
  BarChart3
} from "lucide-react";

interface Career {
  id: string;
  title: string;
  description: string;
  required_education: string;
  average_salary: string;
  growth_outlook: string;
  skills_required: string[];
  related_fields: string[];
  match_score?: number;
}

interface QuizResult {
  id: string;
  scores: Record<string, { correct: number; total: number }>;
  completed_at: string;
}

const Recommendations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [careers, setCareers] = useState<Career[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (quizError) throw quizError;

      if (!quizData) {
        navigate('/aptitude-quiz');
        return;
      }

      setQuizResult(quizData);

      const { data: careersData, error: careersError } = await supabase
        .from('careers')
        .select('*');

      if (careersError) throw careersError;

      const careerMappings = await supabase
        .from('career_skill_mapping')
        .select('*');

      const rankedCareers = rankCareers(
        careersData || [],
        quizData.scores,
        careerMappings.data || []
      );

      setCareers(rankedCareers.slice(0, 6));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading recommendations",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const rankCareers = (
    careers: Career[],
    scores: Record<string, { correct: number; total: number }>,
    mappings: any[]
  ): Career[] => {
    return careers.map(career => {
      const careerMappings = mappings.filter(m => m.career_id === career.id);
      let totalScore = 0;
      let totalWeight = 0;

      careerMappings.forEach(mapping => {
        const categoryScore = scores[mapping.skill_category];
        if (categoryScore) {
          const percentage = categoryScore.correct / categoryScore.total;
          totalScore += percentage * mapping.weight;
          totalWeight += mapping.weight;
        }
      });

      const matchScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 50;
      return { ...career, match_score: Math.round(matchScore) };
    }).sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <p>Loading recommendations...</p>
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
          <div className="max-w-6xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center text-3xl">
                  <Star className="h-8 w-8 mr-3 text-primary" />
                  Your Personalized Career Recommendations
                </CardTitle>
                <CardDescription>
                  Based on your aptitude assessment completed on{" "}
                  {quizResult && new Date(quizResult.completed_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4">
                  {quizResult && Object.entries(quizResult.scores).map(([category, score]) => (
                    <div key={category} className="text-center">
                      <div className="text-sm font-medium capitalize mb-2">{category}</div>
                      <Progress
                        value={(score.correct / score.total) * 100}
                        className="h-2 mb-1"
                      />
                      <div className="text-xs text-muted-foreground">
                        {score.correct}/{score.total}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {careers.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No Recommendations Available</h3>
                  <p className="text-muted-foreground mb-4">
                    We're still building our career database. Check back soon!
                  </p>
                  <Button onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-primary" />
                  Top Career Matches
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {careers.map((career) => (
                    <Card key={career.id} className="hover:shadow-custom-md transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{career.title}</CardTitle>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="secondary">
                                {career.match_score}% Match
                              </Badge>
                              <span className={`text-sm font-semibold ${getMatchColor(career.match_score || 0)}`}>
                                {career.match_score && career.match_score >= 80
                                  ? "Excellent Fit"
                                  : career.match_score && career.match_score >= 60
                                  ? "Good Fit"
                                  : "Consider"}
                              </span>
                            </div>
                          </div>
                          <Briefcase className="h-8 w-8 text-primary opacity-20" />
                        </div>
                        <CardDescription className="line-clamp-2">
                          {career.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <GraduationCap className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div className="text-sm">
                              <span className="font-medium">Education: </span>
                              <span className="text-muted-foreground">{career.required_education}</span>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <DollarSign className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div className="text-sm">
                              <span className="font-medium">Avg. Salary: </span>
                              <span className="text-muted-foreground">{career.average_salary}</span>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <TrendingUp className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div className="text-sm">
                              <span className="font-medium">Outlook: </span>
                              <span className="text-muted-foreground">{career.growth_outlook}</span>
                            </div>
                          </div>
                        </div>

                        {career.skills_required && career.skills_required.length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-2">Key Skills:</div>
                            <div className="flex flex-wrap gap-2">
                              {career.skills_required.slice(0, 4).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button className="w-full" variant="outline">
                          Learn More <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">Want more personalized guidance?</h3>
                        <p className="text-sm text-muted-foreground">
                          Connect with a mentor who can help you explore these career paths
                        </p>
                      </div>
                      <Button onClick={() => navigate('/dashboard')}>
                        Find a Mentor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Recommendations;
