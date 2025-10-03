import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Star, DollarSign, Calendar, Users } from "lucide-react";

interface MentorProfile {
  id: string;
  user_id: string;
  expertise: string[];
  years_experience: number;
  credentials: string;
  bio: string;
  hourly_rate: number;
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
}

const Mentors = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = mentors.filter(mentor =>
        mentor.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase())) ||
        mentor.bio.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMentors(filtered);
    } else {
      setFilteredMentors(mentors);
    }
  }, [searchTerm, mentors]);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `);

      if (error) throw error;
      setMentors(data || []);
      setFilteredMentors(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading mentors",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = (mentorId: string) => {
    navigate(`/book-session/${mentorId}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <p>Loading mentors...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">Find Your Mentor</h1>
              <p className="text-muted-foreground text-lg">
                Connect with experienced professionals who can guide your career journey
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, expertise, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {filteredMentors.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchTerm ? "No mentors found" : "No mentors available"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Check back later for available mentors"}
                  </p>
                  {searchTerm && (
                    <Button onClick={() => setSearchTerm("")} variant="outline">
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredMentors.map((mentor) => (
                  <Card key={mentor.id} className="hover:shadow-custom-md transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={mentor.profile.avatar_url || undefined} />
                          <AvatarFallback className="text-lg">
                            {getInitials(mentor.profile.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">
                            {mentor.profile.full_name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mb-2">
                            {mentor.years_experience} years of experience
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-warning text-warning mr-1" />
                              <span className="text-sm font-medium">4.9</span>
                            </div>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">50+ sessions</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {mentor.bio}
                      </p>

                      <div>
                        <div className="text-sm font-medium mb-2">Expertise:</div>
                        <div className="flex flex-wrap gap-2">
                          {mentor.expertise.slice(0, 4).map((exp, index) => (
                            <Badge key={index} variant="secondary">
                              {exp}
                            </Badge>
                          ))}
                          {mentor.expertise.length > 4 && (
                            <Badge variant="outline">+{mentor.expertise.length - 4} more</Badge>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-sm">
                            <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span className="font-semibold">${mentor.hourly_rate}/hour</span>
                          </div>
                          <Badge variant="outline" className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Available
                          </Badge>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleBookSession(mentor.user_id)}
                        >
                          Book a Session
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mentors;
