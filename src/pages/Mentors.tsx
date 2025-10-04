import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Calendar } from "lucide-react";

const Mentors = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    const { data } = await supabase
      .from("mentor_profiles")
      .select("*, profiles(*)")
      .eq("status", "approved");
    setMentors(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find a Mentor</h1>
          <p className="text-muted-foreground text-lg">
            Connect with experienced professionals to guide your career journey
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading mentors...</div>
        ) : mentors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No mentors available yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-soft transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={mentor.profiles?.avatar_url} />
                      <AvatarFallback>
                        {mentor.profiles?.full_name?.charAt(0) || "M"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle>{mentor.profiles?.full_name}</CardTitle>
                      {mentor.company && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Briefcase className="h-3 w-3" />
                          {mentor.company}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {mentor.bio}
                  </p>
                  {mentor.expertise && mentor.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {mentor.experience_years && (
                    <p className="text-sm">
                      <span className="font-semibold">{mentor.experience_years}</span> years experience
                    </p>
                  )}
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/book-session/${mentor.user_id}`)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentors;
