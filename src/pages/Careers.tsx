import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, TrendingUp, DollarSign, GraduationCap, Search } from "lucide-react";
import { toast } from "sonner";

interface Career {
  id: string;
  name: string;
  description: string;
  education_requirements: string;
  average_salary: string;
  required_skills: string[];
  growth_rate: string;
  image_url: string;
}

export default function Careers() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      const { data, error } = await supabase
        .from("careers")
        .select("*")
        .order("name");

      if (error) throw error;
      setCareers(data || []);
    } catch (error: any) {
      toast.error("Failed to load careers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCareers = careers.filter(career =>
    career.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    career.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2">Explore Careers</h1>
          <p className="text-muted-foreground mb-6">
            Discover career paths that match your interests and skills
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search careers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCareers.map((career, index) => (
              <Card 
                key={career.id} 
                className="overflow-hidden hover:shadow-lg transition-all hover-lift animate-fade-in" 
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div 
                  className="h-48 bg-cover bg-center relative overflow-hidden group"
                  style={{ backgroundImage: `url(${career.image_url})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    {career.name}
                  </CardTitle>
                  <CardDescription>{career.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <GraduationCap className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Education Required</p>
                      <p className="text-sm text-muted-foreground">{career.education_requirements}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10">
                    <DollarSign className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Average Salary</p>
                      <p className="text-sm text-muted-foreground">{career.average_salary}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Job Growth</p>
                      <p className="text-sm text-muted-foreground">{career.growth_rate}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {career.required_skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="hover-lift">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {!loading && filteredCareers.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-muted-foreground">No careers found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
