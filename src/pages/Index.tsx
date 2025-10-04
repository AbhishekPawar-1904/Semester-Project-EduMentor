import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Brain, Users, BookOpen, ArrowRight, Sparkles } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Recommendations",
      description: "Get personalized career suggestions based on your skills, interests, and goals",
    },
    {
      icon: Users,
      title: "Expert Mentorship",
      description: "Connect with experienced professionals who can guide your career journey",
    },
    {
      icon: BookOpen,
      title: "Curated Resources",
      description: "Access verified educational materials and learning resources",
    },
    {
      icon: Sparkles,
      title: "Career Insights",
      description: "Explore detailed information about careers, salaries, and requirements",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="mb-6 bg-gradient-primary p-4 rounded-2xl shadow-glow">
              <GraduationCap className="h-12 w-12 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your AI-Powered
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Career Guidance Platform
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
              Discover your perfect career path with personalized recommendations, 
              expert mentorship, and comprehensive resources - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/careers">
                <Button size="lg" variant="outline">
                  Explore Careers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need to Plan Your Future
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-soft transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 bg-gradient-hero p-3 rounded-lg w-fit">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students who have found their perfect career path with EduMentor
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 EduMentor. Empowering careers through AI and mentorship.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
