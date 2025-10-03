import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, Clock, CircleCheck as CheckCircle2 } from "lucide-react";

interface QuizQuestion {
  id: string;
  category: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
}

const AptitudeQuiz = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('category');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading quiz",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScores = () => {
    const categoryScores: Record<string, { correct: number; total: number }> = {};

    questions.forEach((question, index) => {
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { correct: 0, total: 0 };
      }
      categoryScores[question.category].total++;

      if (answers[index] === question.correct_answer) {
        categoryScores[question.category].correct++;
      }
    });

    return categoryScores;
  };

  const handleSubmit = async () => {
    try {
      const scores = calculateScores();
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      const { error } = await supabase
        .from('quiz_results')
        .insert({
          user_id: user?.id,
          quiz_type: 'aptitude',
          scores: scores,
          recommended_careers: [],
        });

      if (error) throw error;

      toast({
        title: "Quiz completed!",
        description: "Your results have been saved. Generating recommendations...",
      });

      setIsCompleted(true);
      setTimeout(() => {
        navigate('/recommendations');
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error submitting quiz",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <p>Loading quiz...</p>
          </div>
        </main>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
            <p className="text-muted-foreground">Generating your personalized career recommendations...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">No Quiz Available</h2>
                <p className="text-muted-foreground mb-4">
                  The aptitude quiz is currently being set up. Please check back later.
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-primary" />
                  Aptitude Assessment
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  Question {currentQuestion + 1} of {questions.length}
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary capitalize">
                  {currentQ.category}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground capitalize">
                  {currentQ.difficulty}
                </span>
              </div>
              <CardTitle className="text-xl">{currentQ.question_text}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={answers[currentQuestion] || ""}
                onValueChange={handleAnswerSelect}
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>

                {currentQuestion === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!answers[currentQuestion]}
                    className="min-w-32"
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!answers[currentQuestion]}
                  >
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Answered: {Object.keys(answers).length} / {questions.length}
                </span>
                <span className="text-muted-foreground">
                  Progress: {Math.round(progress)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AptitudeQuiz;
