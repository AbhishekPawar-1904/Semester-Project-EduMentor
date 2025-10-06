import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, MapPin, ExternalLink, Award, Search, Trophy } from "lucide-react";
import { toast } from "sonner";

interface College {
  id: string;
  name: string;
  location: string;
  ranking: number;
  admission_requirements: string;
  courses_offered: string[];
  website_url: string;
}

export default function Colleges() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase
        .from("colleges")
        .select("*")
        .order("ranking");

      if (error) throw error;
      setColleges(data || []);
    } catch (error: any) {
      toast.error("Failed to load colleges");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    college.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-accent" />
            </div>
            Top Colleges & Universities
          </h1>
          <p className="text-muted-foreground mb-6">
            Explore leading institutions for your higher education
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search colleges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColleges.map((college, index) => (
              <Card 
                key={college.id} 
                className="hover:shadow-lg transition-all hover-lift border-t-4 border-t-accent animate-fade-in" 
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="flex items-center gap-2 flex-1">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-5 w-5 text-accent" />
                      </div>
                      <span className="line-clamp-2">{college.name}</span>
                    </CardTitle>
                    <div className="flex flex-col items-center gap-1">
                      <Trophy className="h-5 w-5 text-warning" />
                      <Badge variant="secondary" className="text-xs">#{college.ranking}</Badge>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    {college.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">Admission Requirements</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{college.admission_requirements}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                      Popular Programs
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {college.courses_offered.map((course, index) => (
                        <Badge key={index} variant="outline" className="hover-lift">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {college.website_url && (
                    <Button asChild variant="outline" className="w-full hover-lift hover:scale-105">
                      <a 
                        href={college.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        Visit Website
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {!loading && filteredColleges.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-muted-foreground">No colleges found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
