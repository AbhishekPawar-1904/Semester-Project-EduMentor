import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Mentors = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [bookingMentor, setBookingMentor] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
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

  const handleBookSession = async (mentorId: string) => {
    if (!selectedDate) {
      toast.error("Please select a date for your session.");
      return;
    }

    setIsBooking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(10, 0, 0, 0);

      const { error } = await supabase
        .from("appointments")
        .insert({
          student_id: user.id,
          mentor_id: mentorId,
          scheduled_at: scheduledDate.toISOString(),
          status: "pending",
          duration_minutes: 60,
        });

      if (error) throw error;

      toast.success("Session booked! The mentor will confirm shortly.");
      setBookingMentor(null);
      setSelectedDate(undefined);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to book session.");
    } finally {
      setIsBooking(false);
    }
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
                  <Dialog open={bookingMentor === mentor.user_id} onOpenChange={(open) => !open && setBookingMentor(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        onClick={() => setBookingMentor(mentor.user_id)}
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Book Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Book a Session with {mentor.profiles?.full_name}</DialogTitle>
                        <DialogDescription>
                          Select a date for your mentorship session. Sessions are 1 hour long.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center space-y-4">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                          className="rounded-md border"
                        />
                        <Button 
                          onClick={() => handleBookSession(mentor.user_id)}
                          disabled={!selectedDate || isBooking}
                          className="w-full"
                        >
                          {isBooking ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Booking...
                            </>
                          ) : (
                            "Confirm Booking"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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
