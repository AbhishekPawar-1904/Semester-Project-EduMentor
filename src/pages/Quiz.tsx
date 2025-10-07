import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const questions = [
  {
    id: 1,
    question: "Which activity do you enjoy most?",
    options: [
      { value: "analyzing", label: "Analyzing data and solving problems", skills: ["analytical", "problem-solving"] },
      { value: "creating", label: "Creating and designing things", skills: ["creative", "artistic"] },
      { value: "helping", label: "Helping and teaching others", skills: ["empathy", "communication"] },
      { value: "organizing", label: "Organizing and managing projects", skills: ["leadership", "planning"] },
    ],
  },
  {
    id: 2,
    question: "What type of work environment suits you best?",
    options: [
      { value: "structured", label: "Structured with clear rules and procedures", skills: ["organized", "detail-oriented"] },
      { value: "flexible", label: "Flexible and dynamic", skills: ["adaptable", "independent"] },
      { value: "collaborative", label: "Collaborative and team-oriented", skills: ["teamwork", "social"] },
      { value: "independent", label: "Independent with minimal supervision", skills: ["self-motivated", "autonomous"] },
    ],
  },
  {
    id: 3,
    question: "Which subject interests you most?",
    options: [
      { value: "science", label: "Science and Technology", skills: ["technical", "logical"] },
      { value: "arts", label: "Arts and Humanities", skills: ["creative", "expressive"] },
      { value: "business", label: "Business and Economics", skills: ["strategic", "analytical"] },
      { value: "social", label: "Social Sciences", skills: ["empathetic", "research"] },
    ],
  },
  {
    id: 4,
    question: "What motivates you most in a career?",
    options: [
      { value: "innovation", label: "Innovation and creativity", skills: ["innovative", "visionary"] },
      { value: "stability", label: "Stability and security", skills: ["reliable", "consistent"] },
      { value: "impact", label: "Making a positive impact", skills: ["purposeful", "altruistic"] },
      { value: "growth", label: "Personal growth and learning", skills: ["curious", "ambitious"] },
    ],
  },
];

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Calculate skill scores
      const skillScores: Record<string, number> = {};
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        const option = question?.options.find(o => o.value === answer);
        option?.skills.forEach(skill => {
          skillScores[skill] = (skillScores[skill] || 0) + 1;
        });
      });

      // Call AI recommendation function
      const { data, error } = await supabase.functions.invoke('career-recommendations', {
        body: { answers, skillScores }
      });

      if (error) throw error;

      // Save quiz results
      await supabase.from("quiz_results").insert({
        student_id: user.id,
        quiz_data: answers,
        scores: skillScores,
        recommended_careers: data.recommendedCareerIds || []
      });

      toast.success("Quiz completed! See your recommendations.");
      navigate("/quiz-results");
    } catch (error: any) {
      console.error("Quiz error:", error);
      toast.error("Failed to process quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="shadow-glow animate-fade-in hover-lift">
          <CardHeader>
            <CardTitle className="text-3xl bg-gradient-primary bg-clip-text text-transparent animate-slide-in-left">
              Career Assessment Quiz
            </CardTitle>
            <CardDescription className="animate-slide-in-right" style={{animationDelay: '0.1s'}}>
              Answer these questions to discover careers that match your interests and skills
            </CardDescription>
            <div className="w-full bg-muted rounded-full h-3 mt-4 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-500 ease-out animate-pulse"
                style={{ 
                  width: `${progress}%`,
                  background: 'var(--gradient-primary)'
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2 animate-fade-in">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div key={currentQuestion} className="animate-slide-in-right">
              <h3 className="text-xl font-semibold mb-6 text-foreground">
                {questions[currentQuestion].question}
              </h3>
              <RadioGroup
                value={answers[questions[currentQuestion].id]}
                onValueChange={handleAnswer}
              >
                {questions[currentQuestion].options.map((option, idx) => (
                  <div 
                    key={option.value} 
                    className="flex items-center space-x-3 mb-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/5 transition-all duration-300 cursor-pointer animate-fade-in hover-lift"
                    style={{animationDelay: `${idx * 0.1}s`}}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1 text-base">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between pt-4 gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="hover:scale-105 transition-transform"
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!answers[questions[currentQuestion].id] || loading}
                className="hover:scale-105 transition-transform hover-glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : currentQuestion === questions.length - 1 ? (
                  "Submit Quiz"
                ) : (
                  "Next Question"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
