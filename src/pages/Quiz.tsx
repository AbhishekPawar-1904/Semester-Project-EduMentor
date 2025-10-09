import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2, GraduationCap } from "lucide-react";

interface QuestionOption {
  value: string;
  label: string;
  streams: string[];
  skills: string[];
}

interface Question {
  id: number;
  question: string;
  category: string;
  options: QuestionOption[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "Which subjects do you enjoy the most in school?",
    category: "Academic Interest",
    options: [
      { value: "math_physics", label: "Mathematics and Physics", streams: ["science"], skills: ["analytical", "technical", "problem-solving"] },
      { value: "biology_chemistry", label: "Biology and Chemistry", streams: ["science", "medical"], skills: ["analytical", "research", "detail-oriented"] },
      { value: "history_literature", label: "History and Literature", streams: ["arts", "humanities"], skills: ["communication", "creative", "critical-thinking"] },
      { value: "economics_accounts", label: "Economics and Accounts", streams: ["commerce"], skills: ["analytical", "business", "financial"] },
    ],
  },
  {
    id: 2,
    question: "What kind of career sounds most appealing to you?",
    category: "Career Aspiration",
    options: [
      { value: "engineer_tech", label: "Engineer, Software Developer, or Scientist", streams: ["science"], skills: ["technical", "analytical", "innovation"] },
      { value: "doctor_health", label: "Doctor, Nurse, or Healthcare Professional", streams: ["science", "medical"], skills: ["empathy", "analytical", "detail-oriented"] },
      { value: "business_entrepreneur", label: "Business Owner, Manager, or Accountant", streams: ["commerce"], skills: ["leadership", "business", "financial"] },
      { value: "creative_social", label: "Teacher, Writer, Artist, or Social Worker", streams: ["arts", "humanities"], skills: ["communication", "creative", "empathy"] },
    ],
  },
  {
    id: 3,
    question: "How do you prefer to solve problems?",
    category: "Problem-Solving Style",
    options: [
      { value: "logical_systematic", label: "Using logic and systematic methods", streams: ["science", "commerce"], skills: ["analytical", "technical", "structured"] },
      { value: "creative_innovative", label: "Thinking creatively and finding new approaches", streams: ["arts", "humanities"], skills: ["creative", "innovation", "flexible"] },
      { value: "research_data", label: "Researching and analyzing data", streams: ["science", "commerce"], skills: ["research", "analytical", "detail-oriented"] },
      { value: "discussion_collaboration", label: "Through discussion and collaboration", streams: ["arts", "humanities", "commerce"], skills: ["communication", "teamwork", "empathy"] },
    ],
  },
  {
    id: 4,
    question: "What kind of work environment appeals to you?",
    category: "Work Preference",
    options: [
      { value: "lab_tech", label: "Laboratory or Technical workspace", streams: ["science"], skills: ["technical", "research", "precision"] },
      { value: "office_corporate", label: "Office or Corporate setting", streams: ["commerce"], skills: ["business", "professional", "organized"] },
      { value: "creative_flexible", label: "Creative studio or Flexible environment", streams: ["arts", "humanities"], skills: ["creative", "flexible", "innovation"] },
      { value: "field_community", label: "Field work or Community interaction", streams: ["arts", "humanities", "vocational"], skills: ["communication", "empathy", "practical"] },
    ],
  },
  {
    id: 5,
    question: "Which activities do you enjoy outside of school?",
    category: "Personal Interest",
    options: [
      { value: "coding_experiments", label: "Coding, experiments, or building things", streams: ["science"], skills: ["technical", "innovation", "practical"] },
      { value: "reading_writing", label: "Reading, writing, or debating", streams: ["arts", "humanities"], skills: ["communication", "creative", "critical-thinking"] },
      { value: "business_money", label: "Managing money or small business ventures", streams: ["commerce"], skills: ["business", "financial", "entrepreneurial"] },
      { value: "helping_teaching", label: "Volunteering or teaching others", streams: ["arts", "humanities", "vocational"], skills: ["empathy", "communication", "leadership"] },
    ],
  },
  {
    id: 6,
    question: "What are your strengths?",
    category: "Personal Strengths",
    options: [
      { value: "numbers_logic", label: "Working with numbers and logical reasoning", streams: ["science", "commerce"], skills: ["analytical", "mathematical", "logical"] },
      { value: "communication_expression", label: "Communication and self-expression", streams: ["arts", "humanities"], skills: ["communication", "creative", "presentation"] },
      { value: "attention_detail", label: "Attention to detail and accuracy", streams: ["science", "commerce"], skills: ["detail-oriented", "precision", "organized"] },
      { value: "people_skills", label: "Understanding people and building relationships", streams: ["arts", "humanities", "commerce"], skills: ["empathy", "interpersonal", "leadership"] },
    ],
  },
  {
    id: 7,
    question: "What type of projects excite you?",
    category: "Project Preference",
    options: [
      { value: "tech_innovation", label: "Building apps, robots, or conducting experiments", streams: ["science"], skills: ["technical", "innovation", "problem-solving"] },
      { value: "financial_planning", label: "Creating business plans or financial models", streams: ["commerce"], skills: ["business", "analytical", "strategic"] },
      { value: "creative_content", label: "Writing stories, creating art, or making videos", streams: ["arts", "humanities"], skills: ["creative", "communication", "artistic"] },
      { value: "social_impact", label: "Community service or awareness campaigns", streams: ["arts", "humanities", "vocational"], skills: ["empathy", "leadership", "social"] },
    ],
  },
  {
    id: 8,
    question: "How important is earning a high income to you?",
    category: "Career Goals",
    options: [
      { value: "very_important", label: "Very important - I want financial success", streams: ["commerce", "science"], skills: ["ambitious", "business", "financial"] },
      { value: "balanced", label: "Important, but work satisfaction matters more", streams: ["commerce", "science", "arts"], skills: ["balanced", "practical", "motivated"] },
      { value: "not_priority", label: "Not a priority - I value passion and purpose", streams: ["arts", "humanities", "vocational"], skills: ["passionate", "purpose-driven", "creative"] },
      { value: "stable_income", label: "I want a stable and secure income", streams: ["commerce", "vocational"], skills: ["security-focused", "practical", "reliable"] },
    ],
  },
  {
    id: 9,
    question: "What kind of impact do you want to make?",
    category: "Social Impact",
    options: [
      { value: "innovation_tech", label: "Drive innovation and technological advancement", streams: ["science"], skills: ["innovation", "technical", "forward-thinking"] },
      { value: "economic_growth", label: "Contribute to economic growth and business", streams: ["commerce"], skills: ["business", "entrepreneurial", "economic"] },
      { value: "social_change", label: "Create social change and help communities", streams: ["arts", "humanities", "vocational"], skills: ["empathy", "social", "change-maker"] },
      { value: "education_culture", label: "Preserve culture and educate future generations", streams: ["arts", "humanities"], skills: ["educational", "cultural", "inspirational"] },
    ],
  },
  {
    id: 10,
    question: "After Class 12, what are you most interested in learning?",
    category: "Future Learning",
    options: [
      { value: "engineering_tech", label: "Engineering, Computer Science, or Pure Sciences", streams: ["science"], skills: ["technical", "analytical", "specialized"] },
      { value: "medical_health", label: "Medicine, Pharmacy, or Health Sciences", streams: ["science", "medical"], skills: ["medical", "caring", "scientific"] },
      { value: "business_finance", label: "Business, Finance, or Chartered Accountancy", streams: ["commerce"], skills: ["business", "financial", "professional"] },
      { value: "arts_humanities", label: "Arts, Literature, Psychology, or Social Work", streams: ["arts", "humanities"], skills: ["creative", "social", "humanistic"] },
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
    if (!user) {
      toast.error("Please log in to save your results");
      navigate("/auth");
      return;
    }
    
    setLoading(true);

    try {
      // Calculate skill scores and stream preferences
      const skillScores: Record<string, number> = {};
      const streamScores: Record<string, number> = {};
      
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        const option = question?.options.find(o => o.value === answer);
        
        // Count skills
        option?.skills.forEach(skill => {
          skillScores[skill] = (skillScores[skill] || 0) + 1;
        });
        
        // Count stream preferences
        option?.streams.forEach(stream => {
          streamScores[stream] = (streamScores[stream] || 0) + 1;
        });
      });

      // Normalize scores to percentages
      const maxSkillScore = Math.max(...Object.values(skillScores));
      const normalizedSkills: Record<string, number> = {};
      Object.entries(skillScores).forEach(([skill, score]) => {
        normalizedSkills[skill] = Math.round((score / maxSkillScore) * 100);
      });

      const maxStreamScore = Math.max(...Object.values(streamScores));
      const normalizedStreams: Record<string, number> = {};
      Object.entries(streamScores).forEach(([stream, score]) => {
        normalizedStreams[stream] = Math.round((score / maxStreamScore) * 100);
      });

      // Call AI recommendation function
      const { data, error } = await supabase.functions.invoke('career-recommendations', {
        body: { 
          answers, 
          skillScores: normalizedSkills,
          streamScores: normalizedStreams
        }
      });

      if (error) throw error;

      // Save quiz results
      await supabase.from("quiz_results").insert({
        student_id: user.id,
        quiz_data: answers,
        scores: { skills: normalizedSkills, streams: normalizedStreams },
        recommended_careers: data.recommendedCareerIds || []
      });

      toast.success("Assessment completed! See your personalized stream and career recommendations.");
      navigate("/quiz-results");
    } catch (error: any) {
      console.error("Quiz error:", error);
      toast.error("Failed to process assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Career & Stream Guidance Assessment
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Discover your ideal stream and career path based on your interests and strengths
          </p>
          <p className="text-sm text-muted-foreground">
            This comprehensive assessment will help you choose between Arts, Science, Commerce, or Vocational streams
          </p>
        </div>

        <Card className="shadow-glow animate-fade-in hover-lift">
          <CardHeader className="animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between mb-2">
              <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {questions[currentQuestion].category}
              </Badge>
            </div>
            <Progress 
              value={progress} 
              className="mt-3 h-2 animate-scale-in"
              style={{animationDelay: '0.2s'}}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(progress)}% Complete
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <h2 className="text-2xl font-semibold mb-6 leading-relaxed">
                {questions[currentQuestion].question}
              </h2>
            </div>
            
            <RadioGroup
              value={answers[questions[currentQuestion].id]}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {questions[currentQuestion].options.map((option, index) => (
                <div
                  key={option.value}
                  className={`flex items-start space-x-3 p-5 rounded-xl border-2 transition-all cursor-pointer animate-slide-up hover:shadow-md ${
                    answers[questions[currentQuestion].id] === option.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50 hover:bg-accent/30'
                  }`}
                  style={{animationDelay: `${0.4 + index * 0.1}s`}}
                  onClick={() => handleAnswer(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer text-base leading-relaxed"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

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
                  "Get My Results"
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