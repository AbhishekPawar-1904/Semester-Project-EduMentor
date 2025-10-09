import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Briefcase, BookOpen, Award, GraduationCap, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

interface QuizResult {
  id: string;
  created_at: string;
  recommended_careers: string[];
  scores: {
    skills: Record<string, number>;
    streams: Record<string, number>;
  };
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

const streamInfo: Record<string, { title: string; description: string; degrees: string[]; careers: string[] }> = {
  science: {
    title: "Science Stream",
    description: "Perfect for analytical minds interested in technology, research, and innovation",
    degrees: ["B.Tech", "B.Sc", "MBBS", "BCA", "B.Pharm"],
    careers: ["Engineer", "Doctor", "Scientist", "Data Analyst", "Researcher"]
  },
  medical: {
    title: "Medical/Healthcare Stream",
    description: "Ideal for those passionate about healthcare and helping people",
    degrees: ["MBBS", "BDS", "B.Pharm", "B.Sc Nursing", "BAMS"],
    careers: ["Doctor", "Dentist", "Pharmacist", "Nurse", "Medical Researcher"]
  },
  commerce: {
    title: "Commerce Stream",
    description: "Great for business-minded individuals interested in finance and management",
    degrees: ["B.Com", "BBA", "CA", "CS", "B.Econ"],
    careers: ["Accountant", "Business Manager", "Entrepreneur", "Financial Analyst", "Banking Professional"]
  },
  arts: {
    title: "Arts/Humanities Stream",
    description: "Excellent for creative and socially conscious individuals",
    degrees: ["B.A", "B.F.A", "B.Ed", "LLB", "B.J.M.C"],
    careers: ["Teacher", "Lawyer", "Journalist", "Designer", "Social Worker"]
  },
  humanities: {
    title: "Humanities Stream",
    description: "Perfect for those interested in society, culture, and human behavior",
    degrees: ["B.A", "B.S.W", "B.Ed", "B.A (Psychology)", "LLB"],
    careers: ["Psychologist", "Social Worker", "Teacher", "Civil Services", "HR Professional"]
  },
  vocational: {
    title: "Vocational/Skill-Based Stream",
    description: "Ideal for hands-on learners who want practical, job-ready skills",
    degrees: ["ITI Courses", "Diploma", "Polytechnic", "Certificate Programs"],
    careers: ["Technician", "Skilled Worker", "Craftsperson", "Service Professional"]
  }
};

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

      setResults(quizData as unknown as QuizResult);

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

  const topStreams = results?.scores.streams 
    ? Object.entries(results.scores.streams)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
    : [];

  const topSkills = results?.scores.skills
    ? Object.entries(results.scores.skills)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
    : [];

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center animate-slide-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
              Your Personalized Guidance Report
            </h1>
            <p className="text-lg text-muted-foreground">
              Based on your assessment, here's your customized stream and career recommendations
            </p>
          </div>

          {results && (
            <>
              {/* Stream Recommendations */}
              <div className="mb-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <GraduationCap className="h-7 w-7 text-primary" />
                  Recommended Academic Streams
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {topStreams.map(([stream, score], idx) => {
                    const info = streamInfo[stream];
                    if (!info) return null;
                    
                    return (
                      <Card 
                        key={stream}
                        className="shadow-glow hover-lift animate-slide-up border-t-4 border-t-primary"
                        style={{animationDelay: `${0.2 + idx * 0.1}s`}}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <CardTitle className="text-xl">{info.title}</CardTitle>
                            <Badge variant="secondary" className="text-lg font-bold">{score}%</Badge>
                          </div>
                          <CardDescription className="text-sm">{info.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <Award className="h-4 w-4 text-primary" />
                              Degree Options
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {info.degrees.map((degree, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {degree}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-primary" />
                              Career Opportunities
                            </p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {info.careers.slice(0, 3).map((career, i) => (
                                <li key={i}>• {career}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Skills Profile */}
              <Card className="mb-8 shadow-glow animate-fade-in hover-lift" style={{animationDelay: '0.4s'}}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Your Skills Profile
                  </CardTitle>
                  <CardDescription>Your strongest aptitudes and abilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {topSkills.map(([skill, score], idx) => (
                      <div key={skill} className="space-y-2 animate-slide-up" style={{animationDelay: `${0.5 + idx * 0.05}s`}}>
                        <div className="flex justify-between items-center">
                          <span className="text-base font-semibold capitalize">{skill.replace(/-/g, ' ')}</span>
                          <span className="text-sm text-muted-foreground font-medium">{score}%</span>
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

              {/* Career Recommendations */}
              <div className="mb-6 animate-slide-in-left" style={{animationDelay: '0.6s'}}>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                  <Briefcase className="h-7 w-7 text-primary" />
                  Recommended Career Paths
                </h2>
                <p className="text-muted-foreground mb-6">
                  Explore these career options that align with your interests and strengths
                </p>
              </div>

              {careers.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {careers.map((career, idx) => (
                    <Card 
                      key={career.id} 
                      className="overflow-hidden shadow-glow hover-lift animate-fade-in border-2 border-transparent hover:border-primary transition-all"
                      style={{animationDelay: `${0.7 + idx * 0.1}s`}}
                    >
                      <div className="h-52 overflow-hidden relative">
                        <img
                          src={career.image_url || "/placeholder.svg"}
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
                      We're generating your personalized career recommendations. Please check back soon or explore our careers database.
                    </p>
                    <Button onClick={() => navigate("/careers")} className="mt-4 hover:scale-105 transition-transform hover-glow">
                      Browse All Careers
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Next Steps */}
              <div className="mt-10 space-y-6 animate-fade-in" style={{animationDelay: '0.9s'}}>
                <h2 className="text-2xl font-bold text-center">What's Next?</h2>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    onClick={() => navigate("/colleges")} 
                    size="lg"
                    className="hover:scale-105 transition-transform hover-glow"
                  >
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Find Colleges
                  </Button>
                  <Button 
                    onClick={() => navigate("/mentors")} 
                    size="lg"
                    variant="outline"
                    className="hover:scale-105 transition-transform"
                  >
                    Connect with Mentors
                  </Button>
                  <Button 
                    onClick={() => navigate("/resources")} 
                    size="lg"
                    variant="outline"
                    className="hover:scale-105 transition-transform"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Learning Resources
                  </Button>
                </div>
                <div className="text-center">
                  <Button 
                    onClick={() => navigate("/quiz")} 
                    variant="ghost"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Retake Assessment
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}