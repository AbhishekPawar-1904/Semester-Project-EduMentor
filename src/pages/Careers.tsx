import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, TrendingUp, GraduationCap } from "lucide-react";

const Careers = () => {
  const [careers, setCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    const { data } = await supabase
      .from("careers")
      .select("*")
      .order("name");
    setCareers(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore Careers</h1>
          <p className="text-muted-foreground text-lg">
            Discover various career paths and find your perfect fit
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading careers...</div>
        ) : careers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No careers available yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.map((career) => (
              <Card key={career.id} className="hover:shadow-soft transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start gap-2">
                    <Briefcase className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <span>{career.name}</span>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {career.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {career.average_salary && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-sm">
                        Avg. Salary: {career.average_salary}
                      </span>
                    </div>
                  )}
                  {career.education_requirements && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-accent" />
                      <span className="text-sm">{career.education_requirements}</span>
                    </div>
                  )}
                  {career.required_skills && career.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {career.required_skills.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                      {career.required_skills.length > 3 && (
                        <Badge variant="outline">
                          +{career.required_skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Careers;
