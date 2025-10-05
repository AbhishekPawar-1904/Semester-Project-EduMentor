import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, MapPin, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

interface College {
  id: string;
  name: string;
  location: string;
  ranking: number;
  website_url: string;
  courses_offered: string[];
  admission_requirements: string;
}

export default function Colleges() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase
        .from("colleges")
        .select("*")
        .order("ranking", { ascending: true });

      if (error) throw error;
      setColleges(data || []);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Top Colleges & Universities</h1>
            <p className="text-muted-foreground">
              Explore leading educational institutions
            </p>
          </div>

          <div className="grid gap-6">
            {colleges.map((college) => (
              <Card key={college.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{college.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        {college.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {college.location}
                          </span>
                        )}
                        {college.ranking && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            Rank #{college.ranking}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Courses Offered</p>
                    <div className="flex flex-wrap gap-2">
                      {college.courses_offered.map((course, idx) => (
                        <Badge key={idx} variant="outline">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Admission Requirements</p>
                    <p className="text-sm text-muted-foreground">
                      {college.admission_requirements}
                    </p>
                  </div>
                  {college.website_url && (
                    <Button
                      onClick={() => window.open(college.website_url, "_blank")}
                      className="w-full"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Website
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {colleges.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No colleges available at the moment. Check back later!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
