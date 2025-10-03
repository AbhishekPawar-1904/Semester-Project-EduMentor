import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clock, Calendar as CalendarIcon, User, CircleCheck as CheckCircle2 } from "lucide-react";

interface MentorProfile {
  id: string;
  user_id: string;
  expertise: string[];
  hourly_rate: number;
  bio: string;
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
}

const BookSession = () => {
  const { mentorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const availableTimes = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  useEffect(() => {
    if (mentorId) {
      fetchMentor();
    }
  }, [mentorId]);

  const fetchMentor = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('user_id', mentorId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({
          variant: "destructive",
          title: "Mentor not found",
        });
        navigate('/mentors');
        return;
      }
      setMentor(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading mentor",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select both a date and time for your session",
      });
      return;
    }

    setSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(':');
      const isPM = selectedTime.includes('PM');
      let hour = parseInt(hours);
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;

      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hour, parseInt(minutes.replace(/[^0-9]/g, '')), 0, 0);

      const { error } = await supabase
        .from('appointments')
        .insert({
          student_id: user?.id,
          mentor_id: mentorId,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: 60,
          status: 'scheduled',
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "Session booked successfully!",
        description: "Your mentor will be notified about the appointment.",
      });

      setIsBooked(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error booking session",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
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
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (isBooked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Session Booked!</h2>
            <p className="text-muted-foreground">Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mentor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => navigate('/mentors')} className="mb-6">
              ← Back to Mentors
            </Button>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={mentor.profile.avatar_url || undefined} />
                        <AvatarFallback className="text-2xl">
                          {getInitials(mentor.profile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-xl">{mentor.profile.full_name}</CardTitle>
                      <CardDescription className="mt-2">
                        ${mentor.hourly_rate}/hour
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{mentor.bio}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>60 min session</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>1-on-1 mentoring</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                      Select Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      Select Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          onClick={() => setSelectedTime(time)}
                          disabled={!selectedDate}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Additional Notes (Optional)</CardTitle>
                    <CardDescription>
                      Share what you'd like to discuss during the session
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="E.g., I'd like to discuss career paths in software engineering..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </CardContent>
                </Card>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!selectedDate || !selectedTime || submitting}
                >
                  {submitting ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookSession;
