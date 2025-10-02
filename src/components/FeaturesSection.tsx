import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Users, 
  BookOpen, 
  GraduationCap, 
  MessageCircle, 
  Star,
  Brain,
  MapPin,
  ArrowRight
} from "lucide-react";
import careersImage from "@/assets/careers-illustration.jpg";
import mentorshipImage from "@/assets/mentorship-illustration.jpg";
import collegeImage from "@/assets/college-illustration.jpg";

const FeaturesSection = () => {
  const features = [
    {
      icon: Target,
      title: "Aptitude Assessment",
      description: "Advanced AI-powered quiz to identify your strengths, interests, and personality traits for accurate career matching.",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Users,
      title: "Expert Mentorship", 
      description: "Connect with industry professionals for one-on-one guidance, career advice, and skill development.",
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      icon: BookOpen,
      title: "Career Roadmaps",
      description: "Detailed pathways showing education requirements, skills needed, and step-by-step career progression.",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      icon: GraduationCap,
      title: "College Guidance",
      description: "Comprehensive database of colleges, courses, fees, and admission requirements with downloadable profiles.",
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      icon: MessageCircle,
      title: "24/7 AI Assistant",
      description: "Intelligent chatbot available round-the-clock to answer questions about careers, courses, and scholarships.",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      icon: Star,
      title: "Scholarship Alerts",
      description: "Real-time notifications about scholarship opportunities, admission deadlines, and educational grants.",
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    }
  ];

  const mainFeatures = [
    {
      title: "Career Exploration",
      description: "Discover diverse career paths with detailed insights into scope, salary expectations, required skills, and growth opportunities.",
      image: careersImage,
      features: ["500+ Career Profiles", "Salary Insights", "Growth Trends", "Skill Requirements"],
      cta: "Explore Careers"
    },
    {
      title: "Mentorship Network",
      description: "Connect with verified industry experts who provide personalized guidance, mock interviews, and career advice.",
      image: mentorshipImage,
      features: ["Verified Mentors", "Video Sessions", "Chat Support", "Progress Tracking"],
      cta: "Find Mentors"
    },
    {
      title: "Educational Pathways", 
      description: "Access comprehensive information about colleges, courses, admission processes, and educational opportunities.",
      image: collegeImage,
      features: ["College Database", "Course Details", "Admission Guides", "Fee Comparison"],
      cta: "Browse Colleges"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Comprehensive Career <span className="bg-gradient-hero bg-clip-text text-transparent">Guidance Platform</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to make informed career decisions, from assessment to achievement
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-custom-lg transition-all duration-300 animate-fade-in border-border" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Features */}
        <div className="space-y-20">
          {mainFeatures.map((feature, index) => (
            <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
              <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''} animate-slide-in`}>
                <h3 className="text-3xl lg:text-4xl font-bold">{feature.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {feature.features.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <Button variant="hero" className="group">
                  {feature.cta}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''} animate-fade-in`} style={{ animationDelay: '0.3s' }}>
                <div className="relative rounded-2xl overflow-hidden shadow-custom-lg">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;