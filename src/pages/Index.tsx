import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/Navbar";
import { GraduationCap, Users, BookOpen, Award, TrendingUp, Sparkles, ArrowRight, Zap, Target, Brain } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-24 px-4">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-bounce-in">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">AI-Powered Career Guidance</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-slide-up">
            Shape Your Future with EduMentor
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
            Discover your perfect career path, connect with expert mentors, and unlock scholarship opportunities—all in one platform.
          </p>
          <div className="flex gap-4 justify-center animate-slide-up" style={{animationDelay: '0.4s'}}>
            <Link to="/auth">
              <Button size="lg" className="gap-2 hover-lift">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/careers">
              <Button size="lg" variant="outline" className="hover-glow">
                Explore Careers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and resources to guide your educational and career journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary transition-all hover-lift animate-fade-in" style={{animationDelay: '0.1s'}}>
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Career Assessment</CardTitle>
                <CardDescription>
                  Take our AI-powered quiz to discover careers that match your interests and skills
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-secondary transition-all hover-lift animate-fade-in" style={{animationDelay: '0.2s'}}>
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Expert Mentors</CardTitle>
                <CardDescription>
                  Connect with industry professionals who can guide you on your career path
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent transition-all hover-lift animate-fade-in" style={{animationDelay: '0.3s'}}>
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>College Guidance</CardTitle>
                <CardDescription>
                  Explore top colleges and universities that align with your career goals
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-warning transition-all hover-lift animate-fade-in" style={{animationDelay: '0.4s'}}>
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-warning" />
                </div>
                <CardTitle>Scholarship Finder</CardTitle>
                <CardDescription>
                  Discover scholarships and financial aid opportunities for your education
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-success transition-all hover-lift animate-fade-in" style={{animationDelay: '0.5s'}}>
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Career Resources</CardTitle>
                <CardDescription>
                  Access curated learning materials and courses for your chosen career
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-all hover-lift animate-fade-in" style={{animationDelay: '0.6s'}}>
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>
                  Get personalized career suggestions based on your quiz results and profile
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto text-center relative z-10 animate-slide-up">
          <h2 className="text-4xl font-bold mb-4 text-primary-foreground">
            Ready to Start Your Journey?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have found their path to success
          </p>
          <Button size="lg" variant="secondary" className="gap-2 hover-lift hover:scale-105" onClick={() => navigate("/auth")}>
            Create Your Free Account
            <GraduationCap className="h-5 w-5" />
          </Button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
